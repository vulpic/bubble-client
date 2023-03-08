/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  ApplicationCommandOptionChoiceData,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../types/interactions";
import config from "../util/config";

const data: Command = {
  name: "use",
  description: "Use a macro",
  usage: "/use <macro>",

  run: async (i) => {
    const inputName = i.options.getString("name", true).toLowerCase();
    const macro = await config.macros.findOne({
      where: {
        guild_id: i.guildId,
        macro_name: inputName,
      },
    });

    if (!macro) {
      await i.reply({
        content: "A macro with this name doesn't exist!",
        ephemeral: true,
      });
      return;
    }

    const uses = macro.get("uses") as number;
    await i.reply({
      content: `${macro.get("macro_contents")}`,
      allowedMentions: { parse: [] },
    });
    await macro.update(
      { uses: uses + 1 },
      { where: { guild_id: i.guildId, macro_name: inputName } }
    );
    return;
  },
  autocomplete: async (i) => {
    const focused = i.options.getFocused().toLowerCase();
    const macros = await config.macros.findAll({
      where: { guild_id: i.guildId },
    });

    if (!macros) {
      await i.respond([]);
      return;
    }
    const filtered: ApplicationCommandOptionChoiceData<string>[] = [];

    macros.forEach((macro) => {
      const name = macro.get("macro_name") as string;
      if (name && name.startsWith(focused))
        filtered.push({ name: name, value: name });
    });
    await i.respond(filtered);
  },
  builder: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Use a macro.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The macro to use.")
        .setRequired(true)
        .setAutocomplete(true)
        .setMaxLength(255)
    ),
};

export default data;
