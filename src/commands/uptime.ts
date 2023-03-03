import { SlashCommandBuilder } from "discord.js";
import { client } from "..";
import { Command } from "../types/interactions";

import moment from "moment";
import("moment-duration-format");

const data: Command = {
  name: "uptime",
  description: "Get the bots uptime.",
  usage: "/uptime",

  run: async (i) => {
    const uptime = client.uptime;
    const timestamp = client.readyTimestamp;
    if (!uptime || !timestamp) {
      throw new Error("Uptime/timestamp is missing from the client ");
    }

    const duration: string = moment
      .duration(uptime)
      .format(" D [days], H [hrs], m [mins], s [secs]");

    await i.reply({
      content: `:stopwatch: Uptime: \`${duration}\``, // optional addition for a timestamp: \n${time((Math.floor(timestamp/1000)), 'f')}
    });
  },
  builder: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Get the bots uptime."),
};

export default data;
