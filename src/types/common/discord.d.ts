import { Collection } from "discord.js";
import {
  Button,
  CommandTypes,
  ContextMenu,
  StringSelectMenu,
} from "../interactions";

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, CommandTypes>;
    contextmenus: Collection<string, ContextMenu>;
    buttons: Collection<string, Button>;
    selectmenus: Collection<string, StringSelectMenu>;
    cooldown: Collection<string, string[]>;
    cache: {
      weather: Collection<
        string,
        {
          lastCall: number;
          data: WeatherData;
        }
      >;
    };
  }
}
