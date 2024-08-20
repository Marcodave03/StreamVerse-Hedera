import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import User from "./User.js";

const Profiles = db.define("profiles", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",  
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profile_picture: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

User.hasOne(Profiles, {
  foreignKey: "user_id",
  as: "profile",
});
Profiles.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export default Profiles;
