const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class Post extends Model {}

Post.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 100]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Post',
  tableName: 'posts'
});

// Define associations
Post.belongsTo(User, { foreignKey: 'authorId' });
User.hasMany(Post, { foreignKey: 'authorId' });

module.exports = Post;
