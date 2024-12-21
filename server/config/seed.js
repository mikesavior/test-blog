require('dotenv').config();
const User = require('../models/User');
const sequelize = require('./database');

const seedDatabase = async () => {
  console.log('Starting database seed...');
  try {
    // Sync database
    await sequelize.sync({ force: true }); // This will drop existing tables

    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true
    });

    // Create some regular users
    await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password: 'user123',
      isAdmin: false
    });

    await User.create({
      username: 'user2',
      email: 'user2@example.com',
      password: 'user123',
      isAdmin: false
    });

    // Create some sample posts
    const Post = require('../models/Post');
    
    await Post.create({
      title: 'First Blog Post',
      content: 'This is the content of our first blog post. Welcome to the blog!',
      published: true,
      authorId: 1
    });

    await Post.create({
      title: 'Getting Started with Node.js',
      content: 'Node.js is a powerful runtime that lets you build full-stack applications...',
      published: true,
      authorId: 2
    });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
require('dotenv').config();
const User = require('../models/User');
const Post = require('../models/Post');
const sequelize = require('./database');

const seedDatabase = async () => {
  console.log('Starting database seed...');
  try {
    // Sync database
    await sequelize.sync({ force: true }); // This will drop existing tables

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!',
      isAdmin: true
    });

    // Create some regular users
    const user1 = await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password: 'User123!',
      isAdmin: false
    });

    const user2 = await User.create({
      username: 'user2',
      email: 'user2@example.com',
      password: 'User123!',
      isAdmin: false
    });

    // Create some sample posts
    await Post.create({
      title: 'Welcome to Our Blog',
      content: 'This is our first blog post. We\'re excited to share our thoughts and ideas with you!',
      published: true,
      authorId: admin.id
    });

    await Post.create({
      title: 'Getting Started with Node.js',
      content: 'Node.js is a powerful runtime that lets you build full-stack applications with JavaScript. Here\'s how to get started...',
      published: true,
      authorId: user1.id
    });

    await Post.create({
      title: 'Web Development Best Practices',
      content: 'In this post, we\'ll cover some essential web development best practices that every developer should know...',
      published: true,
      authorId: user2.id
    });

    await Post.create({
      title: 'Draft Post',
      content: 'This is a draft post that isn\'t published yet.',
      published: false,
      authorId: user1.id
    });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
