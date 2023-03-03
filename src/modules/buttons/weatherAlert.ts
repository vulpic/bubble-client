/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../../types/interactions";
import next from "./alertNext";
import prev from "./alertPrev";
import { createWeatherAlert, getWeatherData } from "../weather";

const data: Button = {
  id: "weather_alertButton",
  run: async (i) => {
    const location = i.customId.split("#")[1];
    const data = await getWeatherData(location);
    if (!data) return; // Could not fetch weather data.
    const alerts: AlertData[] = data.alerts.alert;

    if (alerts.length == 0) {
      await i.reply({
        content: `All weather alerts in ${location} have expired.`,
        ephemeral: true,
      });
      return;
    }

    const embed = createWeatherAlert(alerts[0]).setFooter({
      text: `Alert 1 of ${alerts.length}`,
    });
    const row = new ActionRowBuilder().addComponents(
      prev.builder.setCustomId(`${prev.id}#${location}&0`),
      next.builder.setCustomId(`${next.id}#${location}&0`)
    );

    await i.reply({
      content: `Weather alerts in ${location}`,
      embeds: [embed],
      // @ts-ignore
      components: alerts.length > 0 ? [row] : undefined,
      ephemeral: true,
    });
  },
  builder: new ButtonBuilder().setStyle(ButtonStyle.Danger),
};

export default data;
