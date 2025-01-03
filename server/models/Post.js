const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Image = require('./Image');

class Post extends Model {
  async getImagesWithUrls() {
    if (!this.Images) return [];
    return Promise.all(
      this.Images.map(async (image) => ({
        ...image.toJSON(),
        url: await image.getSignedUrl()
      }))
    );
  }
}

Post.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: {
        args: [1, 100],
        msg: "Title must be between 1 and 100 characters long"
      }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Post',
  tableName: 'posts'
});

// Define associations
Post.belongsTo(User, { foreignKey: 'authorId' });
User.hasMany(Post, { foreignKey: 'authorId' });
Post.hasMany(Image, { foreignKey: 'postId', onDelete: 'CASCADE' });
Image.belongsTo(Post, { foreignKey: 'postId' });

module.exports = Post;
