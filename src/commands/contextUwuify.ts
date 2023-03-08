import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { client } from "..";
import { MessageContextMenu } from "../types/interactions";
import utils from "../util/utils";

const data: MessageContextMenu = {
  name: "UwUify",
  run: async (i) => {
    const message = i.targetMessage;
    if (message.author == client.user) {
      await i.reply({
        content: "uwu",
        ephemeral: true,
      });
      return;
    }
    if (message.content == "") {
      await i.reply({
        content: utils.uwuifier.uwuifySentence("There is no message content!"),
        ephemeral: true,
      });
      return;
    }

    const uwu = utils.uwuifier.uwuifySentence(message.content);
    if (uwu == message.content) {
      await i.reply({
        content: utils.uwuifier.uwuifySentence(
          "This message did not get changed through the filter!"
        ),
        ephemeral: true,
      });
      return;
    }
    try {
      await message.reply({
        content: uwu,
        allowedMentions: { parse: [] },
      });
      await i.reply({
        content: utils.uwuifier.uwuifySentence("Message UwUified!"),
        ephemeral: true,
      });
      await i.deleteReply();
    } catch {
      await i.reply({
        content: utils.uwuifier.uwuifySentence(
          "I do not have permissions to type here!"
        ),
        ephemeral: true,
      });
    }
  },
  builder: new ContextMenuCommandBuilder()
    .setName("UwUify")
    .setType(ApplicationCommandType.Message),
};

export default data;
