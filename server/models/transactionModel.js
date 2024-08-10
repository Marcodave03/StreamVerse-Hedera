import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Transactions = db.define(
  "transactions",
  {
    sender: {
      type: DataTypes.STRING,
    },
    receiver: {
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.FLOAT,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Transactions;
