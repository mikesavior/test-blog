const express = require('express');
const bcrypt = require('bcryptjs');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

const router = express.Router();

// Get admin statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalPosts, publishedPosts, draftPosts, totalUsers, adminUsers, regularUsers] = await Promise.all([
      Post.count(),
      Post.count({ where: { published: true }}),
      Post.count({ where: { published: false }}),
      User.count(),
      User.count({ where: { isAdmin: true }}),
      User.count({ where: { isAdmin: false }})
    ]);
    
    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers,
      adminUsers,
      regularUsers
    });
  } catch (error) {
    console.error('[Admin] Error fetching statistics:', error);
    res.status(500).json({
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'isAdmin', 'createdAt', 'updatedAt']
    });
    res.json(users);
  } catch (error) {
    console.error('[Admin] Error fetching users:', error);
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get single user
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'isAdmin', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('[Admin] Error fetching user:', error);
    res.status(500).json({
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-demotion from admin
    if (userId === req.user.id && isAdmin === false) {
      return res.status(400).json({ message: 'Cannot remove your own admin status' });
    }

    // Only include defined fields in updates
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (isAdmin !== undefined) updates.isAdmin = isAdmin;

    // Only hash and update password if provided
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    await user.update(updates);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('[Admin] Error updating user:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Username or email already exists',
        error: error.message
      });
    }
    res.status(400).json({
      message: 'Error updating user',
      error: error.message
    });
  }
});

// Create user
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { username, email, password, isAdmin = false } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('[Admin] Error creating user:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Username or email already exists',
        error: error.message
      });
    }
    res.status(400).json({
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[Admin] Error deleting user:', error);
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message
    });
  }
});

module.exports = router;