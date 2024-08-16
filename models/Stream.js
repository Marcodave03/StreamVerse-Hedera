import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import User from "./User.js";

const Streams = db.define("streams", {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stream_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_live: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

User.hasOne(Streams, {
  foreignKey: "user_id",
  as: "stream",
});
Streams.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export default Streams;
