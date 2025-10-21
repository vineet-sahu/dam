import { Sequelize } from "sequelize-typescript";
import path from "path";
import logger from "../utils/logger";
import dbConfig from "./dbconfig";

const sequelize = new Sequelize({
  host: dbConfig.host || "localhost",
  port: parseInt(`${dbConfig.port}` || "5432"),
  database: dbConfig.database || "dam_db",
  username: dbConfig.username || "dam_user",
  password: dbConfig.password || "dam_password",
  dialect: "postgres",
  logging:
    process.env.NODE_ENV === "development" ? (msg) => logger.debug(msg) : false,
  models: [path.join(__dirname, "../models")],
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established successfully");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync();
      logger.info("Database models synchronized");
    }
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

export default sequelize;
