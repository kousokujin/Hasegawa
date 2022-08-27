require('dotenv').config();

config_dict = {
  development: {
    username: "docker",
    password: "docker",
    database: "app",
    host: "mysql_db",
    dialect: "mysql"
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIARECT,
  }
}

var config = config_dict['development'];
if(process.env.NODE_ENV != null){
  const node_env = process.env.NODE_ENV;

  if(node_env == 'development' || node_env == 'test' || node_env == "production"){
    config = config_dict[node_env];
  }
}

//console.log(config);
module.exports = config;