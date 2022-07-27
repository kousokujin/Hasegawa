'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InstallPackeages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  InstallPackeages.init({
    installation_id: DataTypes.INTEGER,
    package_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'InstallPackeages',
  });
  return InstallPackeages;
};