import { ActivityType, Events } from "discord.js";
import { client } from "..";
import { BotEvent } from "../types/interactions";

const data: BotEvent = {
  type: Events.GuildCreate,
  run: () => {
    if (!client.user || !client.application) {
      throw new Error("Missing client user or application.");
    }
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
