import {
  EmbedBuilder,
  Events,
  Message,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import { client } from "..";
import { BotEvent } from "../types/interactions";
import logger from "../util/logger";
import config from "../util/config";
import { getFiles } from "../util/utils";

const data: BotEvent = {
  type: Events.MessageReactionAdd,
  run: async (r: MessageReaction, u: User) => {
    const m = r.message as Message;

    if (r.partial) await r.fetch().catch((e) => logger.error(e));
    if (m.partial) await m.fetch().catch((e) => logger.error(e));

    if (!m.content && !m.attachments) return;
    if (!m.channel.isTextBased()) return;

    if (r.emoji.name === "📌" && r.count <= 1) {
      if (r.me || !m.guild || m.author === null || m.author == client.user)
        return;

      const settings = await config.settings.findOne({
        where: { guild_id: m.guildId },
      });
      if (!settings) return;
      const id = settings.get("channel_quotes");
      if (!(typeof id === "string")) return;

      const channel = await client.channels.fetch(id);
      if (!(channel instanceof TextChannel)) {
        await settings.update(
          { channel_quotes: null },
          { where: { guild_id: m.guildId } }
        );
        return;
      }

      // message content
      const embed: EmbedBuilder = new EmbedBuilder()
        .setAuthor({
          name: m.author.username,
          iconURL: m.author.avatarURL({ size: 128 }) ?? undefined,
          url: m.url,
        })
        .setDescription(m.content.length >= 1 ? m.content : null)
        .setColor(0x2f3136)
        .setFooter({ text: `Pinned by ${u.username}` })
        .setTimestamp(Date.now());

      const files = getFiles(m);
      try {
        void m.react(r.emoji);
        files.length > 0
          ? await channel.send({ embeds: [embed], files: files })
          : await channel.send({ embeds: [embed] });
      } catch (e) {
        // the bot doesn't have permission to send in this channel, so just ignore for now until I figure out how to check that.
        return;
      }

      logger.info(`${u.username} quoted a text in ${m.guild.name}`, "cmd");
    }
  },
};

export default data;
