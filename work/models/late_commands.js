'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class late_commands extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  late_commands.init({
    installation_id: DataTypes.INTEGER,
    command: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'late_commands',
  });
  return late_commands;
};