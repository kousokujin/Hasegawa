'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ipaddrs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ipaddrs.init({
    installation_id: DataTypes.INTEGER,
    address: DataTypes.STRING,
    mask: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ipaddrs',
  });
  return ipaddrs;
};