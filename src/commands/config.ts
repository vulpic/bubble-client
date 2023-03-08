import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/interactions";
import config from "../util/config";

const data: Command = {
  name: "config",
  description: "Modify the bot settings for this guild.",
  usage: "/config [set/view] <setting> (value)",

  run: async (i) => {
    if (i.guildId == null) {
      await i.reply({
        content: "You can only run this command in guilds!",
        ephemeral: true,
      });
      return;
    }

    let settings = await config.settings.findOne({
      where: { guild_id: i.guildId },
    });
    if (!settings) {
      settings = await config.settings.create({
        guild_id: i.guildId,
      });
      if (!settings) {
        await i.reply({
          content:
            "There was an issue accessing your guild settings. Please contact the developer.",
          ephemeral: true,
        });
        return;
      }
    }

    switch (i.options.getSubcommand(true)) {
      case "view": {
        const selected = i.options.getString("setting", true);
        const value = settings.get(selected);
        if (!value) {
          await i.reply({
            content: `The value of \`${selected}\` is \`null\``,
            ephemeral: true,
          });
          return;
        }
        await i.reply({
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          content: `The value of \`${selected}\` is \`${value}\``,
          ephemeral: true,
        });
        return;
      }
      case "quotes": {
        const value = i.options.getChannel("channel");
        if (!value) {
          await settings.update(
            { channel_quotes: null },
            { where: { guild_id: i.guildId } }
          );
          await i.reply({
            content: `Disabled quotes on this server.`,
            ephemeral: true,
          });
          return;
        }
        await settings.update(
          { channel_quotes: value.id },
          { where: { guild_id: i.guildId } }
        );
        await i.reply({
          content: `Set the quotes channel to <#${value.id}>`,
          ephemeral: true,
        });
        return;
      }
      case "petitions": {
        const value = i.options.getChannel("channel");
        if (!value) {
          await settings.update(
            { channel_petitions: null },
            { where: { guild_id: i.guildId } }
          );
          await i.reply({
            content: `Disabled petitions on this server.`,
            ephemeral: true,
          });
          return;
        }
        await settings.update(
          { channel_petitions: value.id },
          { where: { guild_id: i.guildId } }
        );
        await i.reply({
          content: `Set the petitions channel to <#${value.id}>`,
          ephemeral: true,
        });
        return;
      }
      case "staff-role": {
        const value = i.options.getRole("role");
        if (!value) {
          await settings.update(
            { staff_role: null },
            { where: { guild_id: i.guildId } }
          );
          await i.reply({
            content: `Removed staff role on this server.`,
            ephemeral: true,
          });
          return;
        }
        await settings.update(
          { staff_role: value.id },
          { where: { guild_id: i.guildId } }
        );
        await i.reply({
          content: `Set the staff role to <@&${value.id}>`,
          ephemeral: true,
          allowedMentions: { parse: [] },
        });
        return;
      }
    }
    return;
  },
  builder: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Modify the bot settings for this guild.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommandGroup((group) =>
      group
        .setName("set")
        .setDescription("Set the value of a setting for this guild.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("quotes")
            .setDescription(
              "Where messages go when 📌 reacted. Set to none to disable."
            )
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("Channel to send quoted messages to.")
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("petitions")
            .setDescription(
              "Set a channel for petitions to go, no channel will disable it."
            )
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("Channel to send petitions to.")
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("staff-role")
            .setDescription("Allows users to bypass some settings.")
            .addRoleOption((option) =>
              option.setName("role").setDescription("Role to bypass.")
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View the value of a selected setting.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("Setting to view the value of.")
            .setRequired(true)
            .addChoices(
              { name: "Quotes Channel", value: "channel_quotes" },
              { name: "Petitions Channel", value: "channel_petitions" },
              { name: "Staff Role", value: "staff_role" }
            )
        )
    ),
};

export default data;
