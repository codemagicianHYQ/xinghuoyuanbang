require("dotenv").config();

module.exports = {
  HOST: "10.0.4.11",
  USER: "root",
  PASSWORD: "Hyq@1471753670",
  DB: "users",
  dialect: "mysql",
  port: 3306,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeout: 60000,
  },
};
