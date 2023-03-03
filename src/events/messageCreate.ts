/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Events, Message } from "discord.js";
import { BotEvent } from "../types/interactions";
import weather from "../modules/weather";
import { removeStopwords } from "stopword";

const data: BotEvent = {
  type: Events.MessageCreate,
  run: async (m: Message) => {
    if (m.author.bot && m.author.id != "962785279255666698") return;

    let content = m.content.toLowerCase();
    let array: string[] = removeStopwords(content.split(" "));
    // Exception for arcators IRC Relay bot.
    if (m.author.id == "962785279255666698") {
      if (content.indexOf(":") == -1) return;
      content = content.slice(content.indexOf(":") + 2);
      array = removeStopwords(content.split(" "));
    }

    if (
      array.includes("weather") &&
      content.split(" ").indexOf("weather") <= 3
    ) {
      await weather(m, array);
      return;
    }
  },
};

export default data;
