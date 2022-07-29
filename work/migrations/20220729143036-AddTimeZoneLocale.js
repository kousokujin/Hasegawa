'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    queryInterface.addColumn('installations', 'timezone', {
      type: Sequelize.STRING,
      after: "ssh"
    });

    queryInterface.addColumn('installations', 'locale', {
      type: Sequelize.STRING,
      after: "timezone"
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return [
      queryInterface.removeColumn('installations', 'timezone'),
      queryInterface.removeColumn('installations', 'locale'),
    ]
  }
};
