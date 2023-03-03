import { SlashCommandBuilder } from "discord.js";
import { Command } from "../types/interactions";

import weather from "../modules/weather";

const data: Command = {
  name: "weather",
  description: "Get the weather in a location.",
  usage: "/weather <location>",

  run: async (i) => {
    await weather(i);
  },
  builder: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Get the weather in a location.")
    .addStringOption((option) =>
      option
        .setName("location")
        .setDescription("Input location for weather.")
        .setRequired(true)
    ),
};

export default data;
