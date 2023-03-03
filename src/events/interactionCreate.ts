import { Events, Interaction, PermissionsBitField } from "discord.js";
import { client } from "..";
import { BotEvent } from "../types/interactions";
import logger from "../util/logger";
import { isCommand, isMessageContext, isUserContext } from "../util/utils";

const data: BotEvent = {
  type: Events.InteractionCreate,
  run: async (i: Interaction) => {
    /* ========================================
                 AUTOCOMPLETE EVENT
       ======================================== */

    if (i.isAutocomplete()) {
      const command = i.client.commands.get(i.commandName);
      if (!command || !isCommand(command) || !command.autocomplete) {
        logger.error(
          `Command ${i.commandName} does not exist or doesn't have an autocomplete function.`
        );
        return;
      }

      try {
        await command.autocomplete(i);
      } catch (e) {
        logger.error(e);
      }
    }

    /* ========================================
                CHATCOMMAND EVENT
       ======================================== */

    if (i.isChatInputCommand()) {
      const command = i.client.commands.get(i.commandName);
      if (!command || !isCommand(command)) {
        await i.reply({
          content:
            "The command you're trying to run does not exist, contact the bot developer if you think this is an error.",
          ephemeral: true,
        });
        logger.warn(
          `Command ${i.commandName} does not exist, this may be an issue or a command may not have been deleted.`
        );
        return;
      }
      if (!i.guild) {
        await i.reply({
          content: "You can only run commands in guilds!",
          ephemeral: true,
        });
        logger.warn(`Command ${i.commandName} was ran outside of a guild!`);
        return;
      }

      let cooldown =
        i.client.cooldown.get(`${i.user.id}:${i.guild.id}`) ??
        new Array<string>();
      if (cooldown && cooldown.includes(command.name)) {
        if (!command.cooldown)
          throw new Error("Tried to call a cooldown when there was none.");
        await i.reply({
          content: `This command is on cooldown for \`${command.cooldown} secs\`, try again later.`,
          ephemeral: true,
        });
        return;
      }

      if (command.permission) {
        if (!i.guild.members.me)
          throw new Error(`Could not find the clients member in ${i.guild.id}`);
        const permissions: PermissionsBitField = i.guild.members.me.permissions;

        if (!permissions.has(command.permission)) {
          const missing = permissions.missing(command.permission).join(", ");

          await i.reply({
            content: `I am missing the permissions to run \`/${command.name}\`, contact a staff member if you think this is an error. \nMissing: \`${missing}\``,
            ephemeral: true,
          });
          return;
        }
      }

      try {
        await command.run(i);
        if (command.cooldown) {
          cooldown.push(command.name);
          i.client.cooldown.set(`${i.user.id}:${i.guild.id}`, cooldown);
          setTimeout(() => {
            if (i.guild == null) return;
            cooldown =
              i.client.cooldown.get(`${i.user.id}:${i.guild.id}`) ??
              new Array<string>();
            cooldown.splice(cooldown.indexOf(command.name), 1);
            i.client.cooldown.set(`${i.user.id}:${i.guild.id}`, cooldown);
          }, command.cooldown * 1000);
        }
      } catch (e) {
        logger.error(e);

        await i
          .reply({
            content: "There was an issue running this command!",
            ephemeral: true,
          })
          .catch(() => {
            void i.editReply({
              content: "There was an issue running this command!",
            });
          });
      }

      return;
    }

    /* ========================================
                  BUTTON EVENT
      ======================================== */

    if (i.isButton()) {
      const id = i.customId.split("#")[0];
      const button = client.buttons.get(id);
      if (!button) {
        await i.reply({
          content: `Could not find button '${id}' please contact the developer.`,
          ephemeral: true,
        });
        return;
      }
      await button.run(i);
      return;
    }

    /* ========================================
               SELECTMENU EVENT
      ======================================== */

    if (i.isStringSelectMenu()) {
      const id = i.customId.split("#")[0];
      const selectmenu = client.selectmenus.get(id);
      if (!selectmenu) {
        await i.reply({
          content: `Could not find select menu '${id}' please contact the developer.`,
          ephemeral: true,
        });
        return;
      }
      await selectmenu.run(i);
      return;
    }

    /* ========================================
               USERCONTEXT EVENT
      ======================================== */

    if (i.isUserContextMenuCommand()) {
      const command = client.commands.get(i.commandName);

      if (!command || !isUserContext(command)) {
        await i.reply({
          content:
            "The command you're trying to run does not exist, contact the bot developer if you think this is an error.",
          ephemeral: true,
        });
        logger.warn(
          `Command ${i.commandName} does not exist, this may be an issue or a command may not have been deleted.`
        );
        return;
      }

      try {
        await command.run(i);
      } catch (e) {
        logger.error(e);
      }
    }

    /* ========================================
               USERCONTEXT EVENT
      ======================================== */

    if (i.isMessageContextMenuCommand()) {
      const command = client.commands.get(i.commandName);

      if (!command || !isMessageContext(command)) {
        await i.reply({
          content:
            "The command you're trying to run does not exist, contact the bot developer if you think this is an error.",
          ephemeral: true,
        });
        logger.warn(
          `Command ${i.commandName} does not exist, this may be an issue or a command may not have been deleted.`
        );
        return;
      }

      try {
        await command.run(i);
      } catch (e) {
        logger.error(e);
      }
    }
  },
};

export default data;
