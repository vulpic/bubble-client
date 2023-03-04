/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  ApplicationCommandOptionChoiceData,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Model } from "sequelize";
import { Command } from "../types/interactions";
import config from "../util/config";
import logger from "../util/logger";
import { isStaff } from "../util/utils";

const data: Command = {
  name: "macro",
  description: "Create, delete, list, or use macros.",
  usage: "/macro [create/delete/list/use]",

  run: async (i) => {
    if (i.guildId == null) {
      await i.reply({
        content: "You can only run this command in guilds!",
        ephemeral: true,
      });
      return;
    }

    switch (i.options.getSubcommand(true)) {
      case "create": {
        const inputName = i.options.getString("name", true).toLowerCase()
        const [macro, created] = await config.macros.findOrCreate({
          where: {
            guild_id: i.guildId,
            macro_name: inputName,
          },
          defaults: {
            guild_id: i.guildId,
            owner_id: i.user.id,
            macro_name: inputName,
            macro_contents: i.options.getString("content", true),
          },
        });

        if (!created) {
          await i.reply({
            content: "A macro with this name already exists!",
            ephemeral: true
          });
          return;
        }

        await i.reply({
          content: `Created a new macro with the name \`${inputName}\`.`,
          ephemeral: true
        });
        logger.info(`${i.user.tag} created a new tag ${inputName} in ${i.guildId}`)
        return;
      }
      case "delete": {
        const inputName = i.options.getString("name", true).toLowerCase()
        const macro = await config.macros.findOne({
          where: {
            guild_id: i.guildId,
            macro_name: inputName,
          },
        });

        if (!macro) {
          await i.reply({
            content: "A macro with this name doesn't exist!",
            ephemeral: true
          });
          return;
        }

        // TODO: Add ability for mods to delete macros.
        if (macro.get("owner_id") == i.user.id) {
          await macro.destroy();
          await i.reply({
            content: `Deleted your macro named \`${inputName}\``,
            ephemeral: true
          });
          logger.info(`${i.user.tag} deleted their tag ${inputName} in ${i.guildId}`)
          return;
        } else if (i.member && (await isStaff(i.guildId, i.member as GuildMember))) {
          await macro.destroy();
          await i.reply({
            content: `Forcefully delete macro named \`${inputName}\` by <@${macro.get("owner_id")}>`,
            ephemeral: true,
            allowedMentions: { parse: [] }
          });
          logger.info(`${i.user.tag} forcefully deleted the tag ${inputName} in ${i.guildId}`)
          return;
        }

        await i.reply({
          content: "You do not own this macro!",
          ephemeral: true
        });
        return;
      }
      case "list": {
        const macros = await config.macros.findAll({
          where: {
            guild_id: i.guildId,
          },
        });

        let list = "Macros: ";
        macros.every(
          (macro) => (list = `${list} ${macro.get("macro_name")}, `)
        );
        await i.reply(list);
        return;
      }
      case "use": {
        const inputName = i.options.getString("name", true).toLowerCase()
        const macro = await config.macros.findOne({
          where: {
            guild_id: i.guildId,
            macro_name: inputName,
          },
        });

        if (!macro) {
          await i.reply({
            content: "A macro with this name doesn't exist!",
            ephemeral: true
          });
          return;
        }

        await i.reply({
          content: `${macro.get("macro_contents")}`,
          allowedMentions: { parse: [] }
        });
        return;
      }
    }

    return;
  },
  autocomplete: async (i) => {
    if (!i.guildId) {
      await i.respond([]);
      return;
    }

    const focused = i.options.getFocused().toLowerCase();
    const subcommand = i.options.getSubcommand(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let macros: Model<any, any>[] | undefined = undefined;
    let staff = false;
    if (subcommand == "use") {
      macros = await config.macros.findAll({
        where: { guild_id: i.guildId },
      });
    } else if (subcommand == "delete") {
      staff = (await isStaff(i.guildId, i.member as GuildMember)) ?? false;
      if (staff) {
        macros = await config.macros.findAll({
          where: { guild_id: i.guildId },
        });
      } else {
        macros = await config.macros.findAll({
          where: { guild_id: i.guildId, owner_id: i.user.id },
        });
      }
    }
    if (!macros) {
      await i.respond([]);
      return;
    }
    const filtered: ApplicationCommandOptionChoiceData<string>[] = [];

    macros.forEach((macro) => {
      const name = macro.get("macro_name") as string;
      if (staff) {
        const owner = macro.get("owner_id") as string;
        if (name && name.startsWith(focused) && owner != i.user.id) {
          filtered.push({ name: `${name} ⚠️`, value: name });
          return;
        }
      }
      if (name && name.startsWith(focused))
        filtered.push({ name: name, value: name });
    });
    await i.respond(filtered);
  },
  builder: new SlashCommandBuilder()
    .setName("macro")
    .setDescription("Manage or use macros.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a new macro.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("the name of the macro.")
            .setRequired(true)
            .setMaxLength(255)
        )
        .addStringOption((option) =>
          option
            .setName("content")
            .setDescription("the contents of the macro.")
            .setRequired(true)
            .setMaxLength(255)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a macro.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("the name of the macro.")
            .setRequired(true)
            .setAutocomplete(true)
            .setMaxLength(255)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List all macros.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("use")
        .setDescription("Use a macro.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("the name of the macro.")
            .setRequired(true)
            .setAutocomplete(true)
            .setMaxLength(255)
        )
    ),
};

export default data;
