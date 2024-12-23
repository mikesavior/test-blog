const express = require('express');
const { Op } = require('sequelize');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

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

// Serve static files
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Get all posts (admin)
router.get('/admin', auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  try {
    const { search, searchBy } = req.query;
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
      include: [{
        model: User,
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Get all published posts
router.get('/', auth, async (req, res) => {
  try {
    let whereClause = { published: true };
    
    // If user is not admin, only show their own posts
    if (!req.user.isAdmin) {
      whereClause.authorId = req.user.id;
    }
    
    const posts = await Post.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Create post
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, content } = req.body;
    const images = [];

    const post = await Post.create({
      title,
      content,
      authorId: req.user.id
    });

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
    
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: 'Error creating post', error: error.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'isAdmin']
      },
      {
        model: Image
      }]
    });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
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
          const filepath = path.join(__dirname, '../uploads/images', image.filename);
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
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

    await post.update({ 
      title, 
      content, 
      published
    });
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
