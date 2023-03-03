import { Client, GatewayIntentBits, Partials } from "discord.js";

import "dotenv/config";
import build from "./build";
import logger from "./util/logger";

export const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

void build(client)
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .then(() => {
    void client.login(process.env.TOKEN);
  });
