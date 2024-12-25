const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Image = require('../models/Image');
const { uploadToS3, deleteFromS3, getSignedDownloadUrl } = require('../utils/s3');

const router = express.Router();

// Helper function to get signed URLs for images
const getPostsWithSignedUrls = async (posts) => {
  return Promise.all(
    posts.map(async (post) => {
      const postJson = post.toJSON();
      if (postJson.Images && postJson.Images.length > 0) {
        postJson.Images = await Promise.all(
          postJson.Images.map(async (image) => ({
            ...image,
            url: await getSignedDownloadUrl(image.s3Key)
          }))
        );
      }
      return postJson;
    })
  );
};

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
});

// Upload image for rich text editor
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const processedBuffer = await sharp(req.file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer();

    const filename = `${uuidv4()}.webp`;
    const s3Key = `uploads/${filename}`;
    
    await uploadToS3({
      buffer: processedBuffer,
      mimetype: 'image/webp'
    }, s3Key);
    
    const url = await getSignedDownloadUrl(s3Key);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Get all posts (admin)
router.get('/admin', auth, async (req, res) => {
  console.log(`[Admin Posts] Request from user ${req.user.id} (isAdmin: ${req.user.isAdmin})`);
  if (!req.user.isAdmin) {
    console.warn(`[Admin Posts] Unauthorized access attempt by user ${req.user.id}`);
    return res.status(403).json({ message: 'Admin access required' });
  }
  try {
    const { search, searchBy } = req.query;
    console.log(`[Admin Posts] Search query:`, { search, searchBy });
    let whereClause = {
      authorId: req.user.id
    };
    
    if (search) {
      const searchCondition = {};
      switch (searchBy) {
        case 'title':
          searchCondition.title = { [Op.iLike]: `%${search}%` };
          break;
        case 'content':
          searchCondition.content = { [Op.iLike]: `%${search}%` };
          break;
        case 'user':
          delete whereClause.authorId;
          whereClause['$User.username$'] = { [Op.iLike]: `%${search}%` };
          break;
        default:
          delete whereClause.authorId;
          whereClause[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { content: { [Op.iLike]: `%${search}%` } },
            { '$User.username$': { [Op.iLike]: `%${search}%` } }
          ];
      }
      whereClause = { ...whereClause, ...searchCondition };
    }

    const posts = await Post.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['username']
        },
        {
          model: Image,
          attributes: ['id', 's3Key', 'filename', 'contentType']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get signed URLs for all images
    const postsWithSignedUrls = await Promise.all(
      posts.map(async (post) => {
        const postJson = post.toJSON();
        if (postJson.Images) {
          postJson.Images = await Promise.all(
            postJson.Images.map(async (image) => ({
              ...image,
              url: await getSignedDownloadUrl(image.s3Key)
            }))
          );
        }
        return postJson;
      })
    );

    console.log(`[Admin Posts] Successfully fetched ${postsWithSignedUrls.length} posts`);
    res.json(postsWithSignedUrls);
  } catch (error) {
    console.error('[Admin Posts] Error:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});


// Get all published posts (public access)
router.get('/', async (req, res) => {
  try {
    // For public access, only show published posts
    const whereClause = {
      published: true
    };
    
    const posts = await Post.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['username']
        },
        {
          model: Image,
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get signed URLs for all images if they exist
    const postsWithSignedUrls = await Promise.all(
      posts.map(async (post) => {
        const postJson = post.toJSON();
        if (postJson.Images && postJson.Images.length > 0) {
          postJson.Images = await Promise.all(
            postJson.Images.map(async (image) => ({
              ...image,
              url: await getSignedDownloadUrl(image.s3Key)
            }))
          );
        }
        return postJson;
      })
    );

    console.log(`[Public Posts] Successfully fetched ${postsWithSignedUrls.length} published posts`);
    res.json(postsWithSignedUrls);
  } catch (error) {
    console.error('[Public Posts] Error:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Create post
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, content } = req.body;
    console.log('[Create Post] Attempting to create post:', { 
      title: title?.length, 
      contentLength: content?.length,
      hasFiles: req.files?.length > 0 
    });
    
    const images = [];

    const post = await Post.create({
      title,
      content,
      authorId: req.user.id
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const processedBuffer = await sharp(file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toBuffer();

        const filename = `${uuidv4()}.webp`;
        const s3Key = `posts/${post.id}/${filename}`;
        
        const url = await uploadToS3({
          buffer: processedBuffer,
          mimetype: 'image/webp'
        }, s3Key);
        
        await Image.create({
          filename,
          s3Key,
          contentType: 'image/webp',
          postId: post.id
        });
      }
    }
    
    res.status(201).json(post);
  } catch (error) {
    console.error('[Create Post] Error:', {
      name: error.name,
      message: error.message,
      errors: error.errors
    });
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    res.status(400).json({ message: 'Error creating post', error: error.message });
  }
});

// Get user's posts
router.get('/my-posts', auth, async (req, res) => {
  try {
    console.log(`[My Posts] Fetching posts for user ${req.user.id}`);
    const posts = await Post.findAll({
      where: {
        authorId: req.user.id
      },
      include: [
        {
          model: User,
          attributes: ['username']
        },
        {
          model: Image,
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const postsWithSignedUrls = await Promise.all(
      posts.map(async (post) => {
        const postJson = post.toJSON();
        if (postJson.Images && postJson.Images.length > 0) {
          postJson.Images = await Promise.all(
            postJson.Images.map(async (image) => ({
              ...image,
              url: await getSignedDownloadUrl(image.s3Key)
            }))
          );
        }
        return postJson;
      })
    );

    res.json(postsWithSignedUrls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    console.log(`[Single Post] Fetching post ID: ${req.params.id}`);
    
    // Skip findByPk if the ID is not numeric
    if (req.params.id === 'my-posts') {
      console.warn('[Single Post] Attempted to access my-posts through /:id route');
      return res.status(404).json({ message: 'Invalid post ID' });
    }
    
    // Check if there's an auth token and verify it
    let userId = null;
    const authHeader = req.header('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (error) {
        console.warn('[Single Post] Invalid token:', error.message);
      }
    }

    const post = await Post.findOne({
      where: {
        id: parseInt(req.params.id),
        // Show all posts to the author, only published posts to others
        ...(!userId && { published: true })
      },
      include: [{
        model: User,
        attributes: ['id', 'username', 'isAdmin']
      },
      {
        model: Image
      }]
    });
    if (!post) {
      console.warn(`[Single Post] Post ${req.params.id} not found`);
      return res.status(404).json({ message: 'Post not found' });
    }
    console.log(`[Single Post] Successfully fetched post ${post.id}`);
    res.json(post);
  } catch (error) {
    console.error('[Single Post] Error:', error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Update post
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { title, content, published, removedImages } = req.body;
    
    // Remove deleted images
    if (removedImages) {
      const imagesToRemove = JSON.parse(removedImages);
      for (const imageId of imagesToRemove) {
        const image = await Image.findByPk(imageId);
        if (image) {
          await deleteFromS3(image.s3Key);
          await image.destroy();
        }
      }
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filename = `${uuidv4()}.webp`;
        const filepath = path.join(__dirname, '../uploads/images', filename);
        
        await sharp(file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toFile(filepath);
        
        await Image.create({
          filename,
          path: `/api/posts/uploads/images/${filename}`,
          postId: post.id
        });
      }
    }

    // Update the post with the new data
    await post.update({ 
      title, 
      content,
      published: published === 'true' || published === true
    });

    // Fetch the updated post with associations
    const updatedPost = await Post.findByPk(post.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'isAdmin']
      },
      {
        model: Image
      }]
    });

    // Get signed URLs for images
    if (updatedPost.Images) {
      updatedPost.Images = await Promise.all(
        updatedPost.Images.map(async (image) => ({
          ...image.toJSON(),
          url: await getSignedDownloadUrl(image.s3Key)
        }))
      );
    }
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: 'Error updating post', error: error.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

module.exports = router;
