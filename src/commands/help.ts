import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { client } from "..";
import { Command } from "../types/interactions";
import { isCommand } from "../util/utils";

const data: Command = {
  name: "help",
  description: "Shows help info and commands.",
  usage: "/help (command)",

  run: async (i) => {
    const select = i.options.getString("command");
    if (!client.user) return;

    if (select) {
      const command = client.commands.get(select);
      if (!command || !isCommand(command)) {
        await i.reply({
          content: "That command does not exist.",
          ephemeral: true,
        });
        return;
      }

      const avatar = client.user.avatarURL();
      const author = avatar
        ? { name: `/${command.name}`, iconURL: avatar }
        : { name: `/${command.name}` };
      const embed = new EmbedBuilder()
        .setAuthor(author)
        .setDescription(command.description)
        .setFooter({ text: command.usage })
        .setColor(0x2f3136);

      await i.reply({ embeds: [embed] });
      return;
    }

    const inline = client.commands.size >= 9 ? true : false;
    let embed = new EmbedBuilder();

    client.commands.forEach((command) => {
      if (!isCommand(command)) return;
      embed = embed.addFields({
        name: `/${command.name}`,
        value: `${command.description}`,
        inline: inline,
      });
    });

    await i.reply({ embeds: [embed] });
  },
  autocomplete: async (i) => {
    const focused = i.options.getFocused();
    const choices = client.commands.keys();
    const filter = [...choices].filter((choice) => choice.startsWith(focused));
    await i.respond(filter.map((choice) => ({ name: choice, value: choice })));
  },
  builder: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows help info and commands.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("Show information about a command.")
        .setAutocomplete(true)
    ),
};

export default data;
