const express = require('express');
const { Op } = require('sequelize');
const { auth } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

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
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.create({
      title,
      content,
      authorId: req.user.id
    });
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
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { title, content, published } = req.body;
    await post.update({ title, content, published });
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
