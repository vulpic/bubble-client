import { EmbedBuilder, SlashCommandBuilder, TextChannel } from "discord.js";
import { client } from "..";
import { Command } from "../types/interactions";
import config from "../util/config";
import logger from "../util/logger";

const data: Command = {
  name: "petition",
  description: "Create a petition.",
  usage: "/petition <description> (title) (image)",

  run: async (i) => {
    if (!i.guildId || !i.guild) return;
    const u = i.user;

    const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle(i.options.getString("title") ?? "Petition")
      .setColor(0x2f3136)
      .setFooter({ text: u.username, iconURL: u.avatarURL() ?? undefined })
      .setTimestamp(Date.now())
      .setDescription(i.options.getString("description", true))
      .setImage(
        i.options.getAttachment("image")
          ? i.options.getAttachment("image")?.url ?? null
          : null
      );

    // start thread
    const settings = await config.settings.findOne({
      where: { guild_id: i.guildId },
    });
    if (!settings) {
      await i.reply({
        content: "This guild does not have petitions set up!",
        ephemeral: true,
      });
      return;
    }
    const id = settings.get("channel_petitions");
    if (!(typeof id === "string")) {
      await i.reply({
        content: "This guild has petitions disabled.",
        ephemeral: true,
      });
      return;
    }
    const channel: TextChannel = (await client.channels.fetch(
      id
    )) as TextChannel;
    await i.deferReply();

    const string =
      i.guild.id == "148831815984087041" ? "<@&894314069488701490>" : "";

    const start = await channel.send({ content: string, embeds: [embed] });
    await i.editReply(`Successfully sent petition in <#${channel.id}>!`);

    void start.react(
      i.guild.id != "148831815984087041"
        ? "yes:1041252681009860620"
        : "upvote:639227843758391306"
    );
    void start.react(
      i.guild.id != "148831815984087041"
        ? "no:1041252679902572585"
        : "downvote:639227835130707978"
    );
    logger.info(`${u.username} created a petition in ${i.guild.name}`);
  },
  builder: new SlashCommandBuilder()
    .setName("petition")
    .setDescription("Create a petition.")
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The description of your petition.")
        .setMaxLength(500)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription('The title of your petition. (default = "Petition")')
        .setMaxLength(100)
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("An image relating to you petition. (optional)")
    ),
};

export default data;
