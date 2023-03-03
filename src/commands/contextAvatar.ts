import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { UserContextMenu } from "../types/interactions";

const data: UserContextMenu = {
  name: "Get Avatar",
  run: async (i) => {
    const member = i.targetMember as GuildMember;
    const url = i.targetUser.avatarURL({ size: 1024 });
    if (!url) {
      await i.reply({
        content: `Could not get this users avatar.`,
        ephemeral: true,
      });
      return;
    }
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${member.nickname ?? i.targetUser.username}'s Avatar`,
      })
      .setColor(0x2f3136)
      .setImage(url);
    await i.reply({
      embeds: [embed],
    });
  },
  builder: new ContextMenuCommandBuilder()
    .setName("Get Avatar")
    .setType(ApplicationCommandType.User),
};

export default data;
