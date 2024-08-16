import { DataTypes } from "sequelize";
import db from "../config/Database.js";
import User from "./User.js";
import Streams from "./Stream.js";

const Donations = db.define("donations", {
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  stream_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Streams,
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  timestamps: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

User.hasMany(Donations, {
  foreignKey: "sender_id",
  as: "sentDonations",
});
User.hasMany(Donations, {
  foreignKey: "receiver_id",
  as: "receivedDonations",
});
Donations.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});
Donations.belongsTo(User, {
  foreignKey: "receiver_id",
  as: "receiver",
});

Streams.hasMany(Donations, {
  foreignKey: "stream_id",
  as: "donations",
});
Donations.belongsTo(Streams, {
  foreignKey: "stream_id",
  as: "stream",
});

export default Donations;
