const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const zxcvbn = require('zxcvbn');
const sequelize = require('../config/database');

class User extends Model {
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  static validatePassword(password) {
    const result = zxcvbn(password);
    if (result.score < 3) {
      throw new Error('Password too weak. Must include mix of characters, numbers, and be at least 12 characters long.');
    }
    return true;
  }
}

User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: [12],
      notNull: true,
      is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    }
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  passwordChangedAt: {
    type: DataTypes.DATE
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verificationExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        User.validatePassword(user.password);
        const SALT_ROUNDS = 12;
        user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        user.passwordChangedAt = new Date();
      }
    }
  }
});

module.exports = User;