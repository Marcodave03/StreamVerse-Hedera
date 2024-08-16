import { DataTypes } from "sequelize";
import db from "../config/Database.js";

const User = db.define(
  "users",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hederaAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    hederaPrivateKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

export default User;
