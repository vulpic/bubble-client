/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";

declare type CommandTypes = Command | ContextMenu;

/**
 * Represents a command.
 * @param {string} name - The name of the command.
 * @param {string} description - The descrtiption of the command.
 * @param {PermissionResolvable} permission - The permission required for the bot to run the command.
 * @param {string} usage - How to use the command. For help command.
 * @param {method} run - What runs when the command is used.
 * @param {method} autocomplete - What runs when autocomplete is enabled.
 * @param {SlashCommandBuilder} builder - What is used to deploy the command.
 */
declare interface Command {
  name: string;
  description: string;
  usage: string;
  permission?: PermissionResolvable;
  cooldown?: number;

  run(i: ChatInputCommandInteraction): void | Promise<void>;
  autocomplete?(i: AutocompleteInteraction): void | Promise<void>;
  builder: any;
}

/**
 * Represents an event.
 * @param {Events} type - The type of event this runs on.
 * @param {boolean} once - If this event only runs once. (optional)
 * @param {method} run - Runs when the event is called.
 */
declare interface BotEvent {
  type: string;
  once?: boolean;
  run(...args: any): void | Promise<void>;
}

declare interface Button {
  id: string;
  builder: ButtonBuilder;
  run(i: ButtonInteraction): void | Promise<void>;
}

declare interface StringSelectMenu {
  id: string;
  builder: StringSelectMenuBuilder;
  run(i: StringSelectMenuInteraction): void | Promise<void>;
}

declare interface UserContextMenu {
  name: string;
  builder: ContextMenuCommandBuilder;
  run(i: UserContextMenuCommandInteraction): void | Promise<void>;
}

declare interface MessageContextMenu {
  name: string;
  builder: ContextMenuCommandBuilder;
  run(i: MessageContextMenuCommandInteraction): void | Promise<void>;
}

declare type ContextMenu = UserContextMenu | MessageContextMenu;
