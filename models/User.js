const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  banner: {
    type: DataTypes.STRING,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  quote: {
    type: DataTypes.TEXT,
  },
  media: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, 
  },
});

module.exports = User;
