'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class routings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  routings.init({
    installation_id: DataTypes.INTEGER,
    network: DataTypes.STRING,
    mask: DataTypes.INTEGER,
    gateway: DataTypes.STRING,
    metric: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'routings',
  });
  return routings;
};