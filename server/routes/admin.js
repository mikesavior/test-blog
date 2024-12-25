const express = require('express');
const bcrypt = require('bcryptjs');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    console.log('[Admin] Fetching all users');
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'isAdmin', 'createdAt', 'updatedAt']
    });
    res.json(users);
  } catch (error) {
    console.error('[Admin] Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-demotion from admin
    if (parseInt(req.params.id) === req.user.id && !isAdmin) {
      return res.status(400).json({ message: 'Cannot remove your own admin status' });
    }

    const updates = {
      username,
      email,
      isAdmin
    };

    // Only update password if provided
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    await user.update(updates);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('[Admin] Error updating user:', error);
    res.status(400).json({ message: 'Error updating user', error: error.message });
  }
});

// Create user
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('[Admin] Error creating user:', error);
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    // Prevent self-deletion
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[Admin] Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
