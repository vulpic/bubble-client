import { DataTypes, Sequelize } from "sequelize";
import logger from "./logger";

export const sequelize = new Sequelize({
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite",
});

const Settings = sequelize.define("guilds", {
  guild_id: {
    type: DataTypes.STRING,
    unique: true,
  },
  channel_quotes: DataTypes.STRING,
  channel_petitions: DataTypes.STRING,
  message_weather: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

export async function sync() {
  logger.info("Syncing database...");
  await Settings.sync();
  logger.info("Database sync complete.");
}

export default {
  settings: Settings,
};
