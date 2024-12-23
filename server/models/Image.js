const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Image extends Model {}

Image.init({
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Image',
  tableName: 'images'
});

module.exports = Image;
