/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ActivityType, Events } from "discord.js";
import { client } from "..";
import { BotEvent } from "../types/interactions";
import { sync } from "../util/config";
import logger from "../util/logger";

const data: BotEvent = {
  type: Events.ClientReady,
  once: true,
  run: async () => {
    if (!client.user || !client.application) {
      throw new Error("Issue during startup, missing client.");
    }

    await sync();
    logger.success(`Ready as ${client.user.tag}.`);

    client.user.presence.set({
      activities: [
        {
          name: `${client.guilds.cache.size} servers`,
          type: ActivityType.Listening,
        },
      ],
      status: "online",
    });
  },
};

export default data;
