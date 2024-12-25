require('dotenv').config();
const User = require('../models/User');
const Post = require('../models/Post');
const Image = require('../models/Image');
const sequelize = require('./database');

const seedDatabase = async () => {
  console.log('Starting database seed...');
  try {
    // Sync database
    await sequelize.sync({ force: true }); // This will drop existing tables

    console.log('Creating users...');
    // Create admin users
    const superAdmin = await User.create({
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: 'SuperAdmin123!',
      isAdmin: true
    });

    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!',
      isAdmin: true
    });

    // Create regular users with varying activity levels
    const activeUser = await User.create({
      username: 'active_user',
      email: 'active@example.com',
      password: 'User123!',
      isAdmin: false
    });

    const casualUser = await User.create({
      username: 'casual_user',
      email: 'casual@example.com',
      password: 'User123!',
      isAdmin: false
    });

    const newUser = await User.create({
      username: 'new_user',
      email: 'new@example.com',
      password: 'User123!',
      isAdmin: false
    });

    console.log('Creating posts...');
    // Create various types of posts
    
    // Admin posts
    const welcomePost = await Post.create({
      title: 'Welcome to Our Blog Platform',
      content: '<h1>Welcome!</h1><p>This is our official blog platform. We\'re excited to share our thoughts and ideas with you!</p><p>Feel free to explore and contribute to our growing community.</p>',
      published: true,
      authorId: superAdmin.id
    });

    const guidelinesPost = await Post.create({
      title: 'Community Guidelines and Best Practices',
      content: '<h2>Community Guidelines</h2><p>To maintain a positive environment, please follow these guidelines:</p><ul><li>Be respectful</li><li>Share constructive feedback</li><li>Follow our content policies</li></ul>',
      published: true,
      authorId: admin.id
    });

    // Active user posts with rich content
    const techPost = await Post.create({
      title: 'Advanced Node.js Development Techniques',
      content: '<h2>Modern Node.js Development</h2><p>Let\'s explore advanced concepts in Node.js development:</p><pre><code>const example = async () => {\n  // Your code here\n};</code></pre><p>This example demonstrates modern async patterns...</p>',
      published: true,
      authorId: activeUser.id
    });

    const draftTechPost = await Post.create({
      title: '[Draft] Upcoming Features in JavaScript',
      content: '<h2>New JavaScript Features</h2><p>This post will cover upcoming features in JavaScript...</p><p>[Work in progress]</p>',
      published: false,
      authorId: activeUser.id
    });

    // Casual user posts
    const casualPost = await Post.create({
      title: 'My Journey in Web Development',
      content: '<h2>Starting Out</h2><p>I began learning web development six months ago...</p><p>Here\'s what I\'ve learned so far...</p>',
      published: true,
      authorId: casualUser.id
    });

    // Draft posts in various states
    const draftPost = await Post.create({
      title: 'Ideas for Future Projects',
      content: '<h2>Project Ideas</h2><p>Here are some project ideas I\'m considering...</p>',
      published: false,
      authorId: casualUser.id
    });

    // Posts with images
    const imagePost = await Post.create({
      title: 'Working with Images in Web Development',
      content: '<h2>Image Handling</h2><p>Learn how to effectively work with images in your web applications.</p>',
      published: true,
      authorId: activeUser.id
    });

    // Create sample images
    await Image.create({
      filename: 'sample1.webp',
      s3Key: 'posts/1/sample1.webp',
      contentType: 'image/webp',
      postId: imagePost.id
    });

    await Image.create({
      filename: 'sample2.webp',
      s3Key: 'posts/1/sample2.webp',
      contentType: 'image/webp',
      postId: imagePost.id
    });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
