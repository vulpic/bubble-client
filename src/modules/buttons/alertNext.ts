/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../../types/interactions";
import { createWeatherAlert, getWeatherData } from "../weather";
import next from "./alertNext";
import prev from "./alertPrev";

const data: Button = {
  id: "weather_nextButton",
  run: async (i) => {
    const buttonData = i.customId.split("#")[1].split("&"); // 0 = location, 1 = index
    const location = buttonData[0];
    let index = parseInt(buttonData[1]);

    const data = await getWeatherData(location);
    if (!data) return; // Could not fetch weather data.
    const alerts: AlertData[] = data.alerts.alert;

    if (alerts.length == 0) {
      await i.update({
        content: `All weather alerts in ${buttonData[0]} have expired.`,
      });
      return;
    }

    index++;
    if (index >= alerts.length) index = 0;

    const embed = createWeatherAlert(alerts[index]).setFooter({
      text: `Alert ${index + 1} of ${alerts.length}`,
    });
    const row = new ActionRowBuilder().addComponents(
      prev.builder.setCustomId(`${prev.id}#${location}&${index}`),
      next.builder.setCustomId(`${next.id}#${location}&${index}`)
    );

    await i.update({
      content: `Weather alerts in ${location}`,
      embeds: [embed],
      // @ts-ignore
      components: alerts.length > 0 ? [row] : undefined,
    });
  },
  builder: new ButtonBuilder().setLabel("Next").setStyle(ButtonStyle.Secondary),
};

export default data;
