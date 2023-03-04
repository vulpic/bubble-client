import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  GuildMember,
  Message,
  SlashCommandBuilder,
} from "discord.js";
import {
  Command,
  MessageContextMenu,
  UserContextMenu,
} from "../types/interactions";
import config from "./config";

export const getFiles = (m: Message) => {
  const urls: string[] = m.content
    .split(" ")
    .filter((text) => {
      return (
        text.startsWith("https://") &&
        (text.endsWith(".png") ||
          text.endsWith(".jpg") ||
          text.endsWith(".gif") ||
          text.endsWith(".webp"))
      );
    })
    .concat(m.attachments.map((a) => a.url));

  return urls.map((url) => {
    return { attachment: url };
  });
};

export async function isStaff(guildId: string, member: GuildMember) {
  const guild = await config.settings.findOne({ where: { guild_id: guildId }})
  if (!guild) return false;
  const staffId = guild.get("staff_role") as string | null;
  return staffId ? member.roles.cache.has(staffId) : false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isCommand(object: any): object is Command {
  if ("builder" in object) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return object.builder instanceof SlashCommandBuilder;
  }
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUserContext(object: any): object is UserContextMenu {
  if ("builder" in object) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (object.builder instanceof ContextMenuCommandBuilder) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return object.builder.type == ApplicationCommandType.User;
    }
  }
  return false;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isMessageContext(object: any): object is MessageContextMenu {
  if ("builder" in object) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (object.builder instanceof ContextMenuCommandBuilder) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return object.builder.type == ApplicationCommandType.Message;
    }
  }
  return false;
}
