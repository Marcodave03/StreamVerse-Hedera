import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const database = process.env.MYSQL_DATABASE;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOST;
const dialect = process.env.MYSQL_DIALECT;

const db = new Sequelize(database, user, password, {
  host: host,
  dialect: dialect,
});

export default db;
