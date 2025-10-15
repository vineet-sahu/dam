import { Dialect } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

interface DBConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
}

const env = process.env.NODE_ENV || "development";

const config: Record<string, DBConfig> = {
  development: {
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "myapp_dev",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    dialect: (process.env.DB_DIALECT as Dialect) || "postgres",
  },
  test: {
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "myapp_test",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    dialect: (process.env.DB_DIALECT as Dialect) || "postgres",
  },
  production: {
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "myapp_prod",
    host: process.env.DB_HOST || "prod_host",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    dialect: (process.env.DB_DIALECT as Dialect) || "postgres",
  },
};

export default config[env];

module.exports = config[env];
