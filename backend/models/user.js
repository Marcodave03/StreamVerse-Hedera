import { DataTypes } from "sequelize";
import sequelize from "./index.js";
import bcrypt from "bcryptjs";

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
    },
  }
);

export default User;
