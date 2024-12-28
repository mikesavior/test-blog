module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'loginAttempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
    await queryInterface.addColumn('users', 'lockUntil', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'isVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    await queryInterface.addColumn('users', 'verificationToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'verificationExpires', {
      type: Sequelize.DATE,
      allowNull: true  
    });
    await queryInterface.addColumn('users', 'resetToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'resetTokenExpires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },
 
  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'loginAttempts');
    await queryInterface.removeColumn('users', 'lockUntil');
    await queryInterface.removeColumn('users', 'isVerified');
    await queryInterface.removeColumn('users', 'verificationToken'); 
    await queryInterface.removeColumn('users', 'verificationExpires');
    await queryInterface.removeColumn('users', 'resetToken');
    await queryInterface.removeColumn('users', 'resetTokenExpires');
  }
 };