'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('routings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      installation_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'installations',
          key: 'id'
        }
      },
      network: {
        type: Sequelize.STRING
      },
      mask: {
        type: Sequelize.INTEGER
      },
      gateway: {
        type: Sequelize.STRING
      },
      metric: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('routings');
  }
};