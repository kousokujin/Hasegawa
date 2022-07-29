'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class installations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  installations.init({
    install_id: DataTypes.STRING,
    discription: DataTypes.TEXT,
    hostname: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.TEXT,
    other_attibute: DataTypes.TEXT,
    ssh: DataTypes.BOOLEAN,
    timezone: DataTypes.STRING,
    locale: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'installations',
  });
  return installations;
};