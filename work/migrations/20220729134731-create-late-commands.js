'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('late_commands', {
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
      command: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('late_commands');
  }
};