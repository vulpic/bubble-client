import { EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { StringSelectMenu } from "../../types/interactions";
import {
  createAstronomyEmbed,
  createForecastEmbed,
  createTemperatureEmbed,
  getWeatherData,
} from "../weather";

const data: StringSelectMenu = {
  id: "weather_select",
  run: async (i) => {
    const location = i.customId.split("#")[1];
    const data = await getWeatherData(location);
    if (!data) return; // Could not fetch weather data.

    const select = i.values[0];
    let embed: EmbedBuilder | undefined = undefined;
    let content: string | undefined = undefined;

    switch (select) {
      case "temperature": {
        embed = createTemperatureEmbed(data, location);
        content = `It is currently \`${data.current.temp_f}°F\` (\`${data.current.temp_c}°C\`) in ${location}`;
        break;
      }
      case "forecast": {
        embed = createForecastEmbed(data, location);
        if (
          data.forecast.forecastday[0].day.daily_will_it_snow == 1 &&
          data.forecast.forecastday[0].day.daily_will_it_rain == 1
        ) {
          content = `It will rain and snow today in ${location}`;
        } else if (data.forecast.forecastday[0].day.daily_will_it_rain == 1) {
          content = `It will rain today in ${location}`;
        } else if (data.forecast.forecastday[0].day.daily_will_it_snow == 1) {
          content = `It will snow today in ${location}`;
        } else {
          content = `There is no rain or snow projected in ${location}.`;
        }
        break;
      }
      case "astronomy": {
        embed = createAstronomyEmbed(data, location);
        content = `The sun rises at \`${data.forecast.forecastday[0].astro.sunrise}\` and sets at \`${data.forecast.forecastday[0].astro.sunset}\` in ${location}`;
        break;
      }
    }

    await i.update({
      content: content,
      embeds: embed ? [embed] : undefined,
    });
  },
  builder: new StringSelectMenuBuilder()
    .setCustomId("weather-select")
    .setPlaceholder("Select one")
    .addOptions(
      {
        label: "Temperature",
        description: "Shows the temperature information for the location.",
        value: "temperature",
      },
      {
        label: "Forecast",
        description: "Shows the weather information for the location.",
        value: "forecast",
      },
      {
        label: "Astronomy",
        description: "Shows the sunrise and sunset times.",
        value: "astronomy",
      }
    ),
};

export default data;
