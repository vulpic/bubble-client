/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  EmbedBuilder,
  codeBlock,
  ChatInputCommandInteraction,
  Message,
  ActionRowBuilder,
} from "discord.js";
import logger from "../util/logger";

import selectmenu from "./selectmenus/weatherSelect";
import alertbutton from "./buttons/weatherAlert";
import { client } from "..";
import moment from "moment";

export default async function onEvent(
  e: ChatInputCommandInteraction | Message,
  content?: string[]
) {
  let location: string | undefined = undefined;
  if (e instanceof Message && content) {
    if (content.length == 1) return;

    const keyIndex: number = content.indexOf("weather");
    if (keyIndex == content.length - 1) {
      location = content[keyIndex - 1];
    } else {
      location = content.splice(keyIndex + 1).join(" ");
    }
  } else if (e instanceof ChatInputCommandInteraction) {
    location = e.options.getString("location", true);
  } else {
    return; // could not run
  }

  const data: WeatherData | void = await getWeatherData(location);
  if (!data) return;
  if (data.error) {
    await e.reply(data.error.message);
    return;
  }

  const locationString = createLocationString(data);

  const condition = createTemperatureEmbed(data, locationString);
  const menu = new ActionRowBuilder().addComponents(
    selectmenu.builder.setCustomId(`${selectmenu.id}#${locationString}`)
  );
  const alert = new ActionRowBuilder().addComponents(
    alertbutton.builder
      .setCustomId(`${alertbutton.id}#${locationString}`)
      .setLabel(`${data.alerts.alert.length} alert(s)!`)
  );

  await e.reply({
    content: `It is currently \`${data.current.temp_f}°F\` (\`${data.current.temp_c}°C\`) in ${locationString}`,
    allowedMentions: { repliedUser: false },
    embeds: [condition],
    // @ts-ignore
    components: data.alerts.alert.length > 0 ? [menu, alert] : [menu],
  });
}

export async function getWeatherData(
  location: string
): Promise<WeatherData | void> {
  const data = client.cache.weather.get(location);
  if (!data || moment().diff(data.lastCall) > 180000) {
    logger.info(`Getting weather data for ${location}`, "log");
    return await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${
        process.env.WEATHER_API_KEY ?? "nokey"
      }&q=${location}&alerts=yes`,
      { method: "GET" }
    )
      .then((response) => response.json())
      .then((response) => {
        const filtered = filterAlerts(response as WeatherData);
        client.cache.weather.set(createLocationString(filtered), {
          lastCall: Date.now(),
          data: filtered,
        });
        return filtered;
      })
      .catch((err) => console.error(err));
  }

  return data.data;
}

function filterAlerts(data: WeatherData): WeatherData {
  if (data.error) return data;
  const alerts: AlertData[] = data.alerts.alert;
  const filter: AlertData[] = [];
  alerts.forEach((alert) => {
    const now = Date.now();
    const effective = new Date(alert.effective);
    const expires = new Date(alert.expires);
    if (expires.getTime() > now) {
      alert.effective = effective[Symbol.toPrimitive]("string");
      alert.expires = expires[Symbol.toPrimitive]("string");

      filter.push(alert);
    }
  });

  data.alerts.alert = filter;
  return data;
}

function createLocationString(data: WeatherData) {
  let locationString = `${data.location.name}, ${data.location.country}`;
  if (
    data.location.country == "United States of America" ||
    data.location.country == "USA United States of America"
  ) {
    locationString = `${data.location.name}, ${data.location.region}`;
  }
  return locationString;
}

export function createWeatherAlert(alert: AlertData): EmbedBuilder {
  let desc = alert.desc;
  if (desc.length > 4096) {
    desc = `${desc.slice(0, 4000)}`;
  }

  let instruc = alert.instruction;
  if (instruc.length > 1024) {
    instruc = `${desc.slice(0, 1000)}`;
  }

  const embed = new EmbedBuilder()
    .setTitle(alert.event)
    .setAuthor({ name: alert.headline })
    .setDescription(codeBlock(desc))
    .addFields(
      {
        name: "Effective",
        value: codeBlock(alert.effective),
        inline: true,
      },
      {
        name: "Expires",
        value: codeBlock(alert.expires),
        inline: true,
      }
    );

  if (alert.instruction)
    embed.addFields({
      name: "Instructions",
      value: codeBlock(instruc),
    });

  return embed;
}

export function createTemperatureEmbed(
  data: WeatherData,
  location: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setThumbnail(`https:${data.current.condition.icon}`)
    .setTitle(location)
    .setDescription(
      `It is currently \`${data.current.condition.text}\` in ${location}`
    )
    .setTimestamp(data.current.last_updated_epoch * 1000)
    .setFooter({ text: `Updated` })
    .addFields(
      {
        name: "Temperature",
        value: codeBlock(`${data.current.temp_f}°F (${data.current.temp_c}°C)`),
        inline: true,
      },
      {
        name: "High",
        value: codeBlock(
          `${data.forecast.forecastday[0].day.maxtemp_f}°F (${data.forecast.forecastday[0].day.maxtemp_c}°C)`
        ),
        inline: true,
      },
      {
        name: "Low",
        value: codeBlock(
          `${data.forecast.forecastday[0].day.mintemp_f}°F (${data.forecast.forecastday[0].day.mintemp_c}°C)`
        ),
        inline: true,
      },
      {
        name: "Feels Like",
        value: codeBlock(
          `${data.current.feelslike_f}°F (${data.current.feelslike_c}°C)`
        ),
        inline: true,
      },
      {
        name: "Wind",
        value: codeBlock(
          `${data.current.wind_dir} at ${data.current.wind_mph}mph (${data.current.wind_kph}kph)`
        ),
        inline: true,
      }
    );
}

export function createForecastEmbed(
  data: WeatherData,
  location: string
): EmbedBuilder {
  const forecast: ForecastData = data.forecast.forecastday[0];
  const embed = new EmbedBuilder()
    .setThumbnail(`https:${forecast.day.condition.icon}`)
    .setTitle(location)
    .setDescription(
      `It is \`${forecast.day.condition.text}\` today in ${location}`
    )
    .setFooter({ text: `${forecast.date}` })
    .addFields(
      {
        name: "Average Temperature",
        value: codeBlock(
          `${forecast.day.avgtemp_f}°F (${forecast.day.avgtemp_c}°C)`
        ),
        inline: true,
      },
      {
        name: "Visibility",
        value: codeBlock(
          `${forecast.day.avgvis_miles} miles (${forecast.day.avgvis_km}km)`
        ),
        inline: true,
      },
      {
        name: "Humidity",
        value: codeBlock(`${forecast.day.avghumidity}%`),
        inline: true,
      },
      {
        name: "Precipitation (rain)",
        value: codeBlock(
          `${forecast.day.totalprecip_in}in (${forecast.day.totalprecip_mm}mm)`
        ),
        inline: true,
      },
      {
        name: "Precipitation (snow)",
        value: codeBlock(`${forecast.day.totalsnow_cm}cm`),
        inline: true,
      }
    );

  return embed;
}

export function createAstronomyEmbed(
  data: WeatherData,
  location: string
): EmbedBuilder {
  const forecast: ForecastData = data.forecast.forecastday[0];

  let time = data.location.localtime.split(" ")[1];
  const split = time.split(":");
  if (parseInt(split[0]) > 12) {
    time = `${parseInt(split[0]) - 12}:${split[1]} PM`;
  } else if (parseInt(split[0]) == 12) {
    time = `${time} PM`;
  } else if (parseInt(split[0]) == 0) {
    time = `12:${split[1]} AM`;
  } else {
    time = `${time} AM`;
  }

  return new EmbedBuilder()
    .setThumbnail(`https:${forecast.day.condition.icon}`)
    .setTitle(location)
    .setDescription(
      `It is \`${time}\` in ${location} (<t:${data.location.localtime_epoch}:t>)`
    )
    .setTimestamp(data.current.last_updated_epoch * 1000)
    .setFooter({ text: `Updated` })
    .addFields(
      {
        name: "Sunrise",
        value: codeBlock(`${forecast.astro.sunrise}`),
        inline: true,
      },
      {
        name: "Sunset",
        value: codeBlock(`${forecast.astro.sunset}`),
        inline: true,
      },
      {
        name: "Cloud Cover",
        value: codeBlock(`${data.current.cloud}%`),
        inline: true,
      },
      {
        name: "Moonrise",
        value: codeBlock(`${forecast.astro.moonrise}`),
        inline: true,
      },
      {
        name: "Moonset",
        value: codeBlock(`${forecast.astro.moonset}`),
        inline: true,
      },
      {
        name: "Moon Phase",
        value: codeBlock(`${forecast.astro.moon_phase}`),
        inline: true,
      }
    );
}
