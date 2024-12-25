const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { getSignedDownloadUrl } = require('../utils/s3');

class Image extends Model {
  async getSignedUrl() {
    try {
      return await getSignedDownloadUrl(this.s3Key);
    } catch (error) {
      console.warn(`Failed to get signed URL for image ${this.id}:`, error.message);
      // Return the s3Key as a fallback - useful for development/debugging
      return this.s3Key;
    }
  }

  // Optional method that doesn't auto-generate URLs in hooks
  toJSON() {
    const values = { ...this.get() };
    delete values.url; // Remove auto-generated URL
    return values;
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
      // Only try to get signed URLs if AWS config is available
      if (!process.env.AWS_REGION) {
        console.log('AWS Region not configured - skipping signed URLs');
        return;
      }

      try {
        if (Array.isArray(instances)) {
          await Promise.all(instances.map(async (instance) => {
            if (instance) {
              try {
                instance.dataValues.url = await instance.getSignedUrl();
              } catch (error) {
                console.warn(`Failed to get signed URL for image ${instance.id}:`, error.message);
                instance.dataValues.url = instance.s3Key; // Fallback
              }
            }
          }));
        } else if (instances) {
          try {
            instances.dataValues.url = await instances.getSignedUrl();
          } catch (error) {
            console.warn(`Failed to get signed URL for image ${instances.id}:`, error.message);
            instances.dataValues.url = instances.s3Key; // Fallback
          }
        }
      } catch (error) {
        console.error('Error in afterFind hook:', error);
        // Don't throw - let the request continue without URLs
      }
    }
  }
});

module.exports = Image;
