const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { getSignedDownloadUrl } = require('../utils/s3');

class Image extends Model {
  async getSignedUrl() {
    return await getSignedDownloadUrl(this.s3Key);
  }
}

Image.init({
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  s3Key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contentType: {
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
  tableName: 'images',
  hooks: {
    afterFind: async (instances) => {
      if (Array.isArray(instances)) {
        await Promise.all(instances.map(async (instance) => {
          if (instance) {
            instance.dataValues.url = await instance.getSignedUrl();
          }
        }));
      } else if (instances) {
        instances.dataValues.url = await instances.getSignedUrl();
      }
    }
  }
});

module.exports = Image;
