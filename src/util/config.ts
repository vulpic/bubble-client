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
  staff_role: DataTypes.STRING,
  message_weather: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

const Macros = sequelize.define("macros", {
  guild_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  owner_id: DataTypes.STRING,
  macro_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  macro_contents: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  global: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  uses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

export async function sync() {
  logger.info("Syncing database...");
  await Settings.sync({alter: true});
  await Macros.sync();
  logger.info("Database sync complete.");
}

export default {
  settings: Settings,
  macros: Macros,
};
