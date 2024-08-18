import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import User from "./User.js";

const Follower = db.define(
  "follower",
  {
    following_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: false,
  }
);

User.hasMany(Follower, {
  foreignKey: "following_id",
  as: "Following",
});
User.hasMany(Follower, {
  foreignKey: "follower_id",
  as: "Followed",
});
Follower.belongsTo(User, {
  foreignKey: "following_id",
  as: "Following",
});
Follower.belongsTo(User, {
  foreignKey: "follower_id",
  as: "Followed",
});

export default Follower;
