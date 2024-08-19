const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "memory_database",
  "memoryuser",
  "54645645645Danil",
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_HOST,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to PostgreSQL has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = { sequelize, connectDB };
