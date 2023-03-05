import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
  } from "discord.js";
import { MessageContextMenu } from "../types/interactions";
import utils from "../util/utils";

const data: MessageContextMenu = {
  name: "UwUify",
  run: async (i) => {
    const message = i.targetMessage;
    await message.reply({
      content: utils.uwuifier.uwuifySentence(message.content),
      allowedMentions: { parse: [] }
    });
    await i.reply({
        content: "Message UwUified.",
        ephemeral: true
    })
    await i.deleteReply()
},
builder: new ContextMenuCommandBuilder()
    .setName("UwUify")
    .setType(ApplicationCommandType.Message),
};

export default data;
