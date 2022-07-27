'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('installations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      install_id: {
        type: Sequelize.STRING
      },
      hostname: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.TEXT
      },
      other_attibute: {
        type: Sequelize.TEXT
      },
      ssh: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('installations');
  }
};