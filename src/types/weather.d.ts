declare interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    long: number;

    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };

  current: {
    last_updated_epoch: number;
    last_updated: string;

    temp_c: number;
    temp_f: number;
    feelslike_c: number;
    feelslike_f: number;

    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;

    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;

    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };

  forecast: {
    forecastday: ForecastData[];
  };

  alerts: {
    alert: AlertData[];
  };

  error?: {
    code: number;
    message: string;
  };
}

declare interface ForecastData {
  date: string;
  date_epoch: number;
  day: {
    maxtemp_c: number;
    maxtemp_f: number;
    mintemp_c: number;
    mintemp_f: number;
    avgtemp_c: number;
    avgtemp_f: number;
    maxwind_mph: number;
    maxwind_kph: number;
    totalprecip_mm: number;
    totalprecip_in: number;
    totalsnow_cm: number;

    avgvis_km: number;
    avgvis_miles: number;

    avghumidity: number;
    daily_will_it_rain: number;
    daily_chance_of_rain: number;
    daily_will_it_snow: number;
    daily_chance_of_snow: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    air_quality: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      us_epa_index: number;
      gb_defra_index: number;
    };
  };
  astro: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moon_phase: string;
    moon_illumination: string;
  };
}

declare interface AlertData {
  headline: string;
  msgtype: string;
  severity: string;
  urgency: string;
  areas: string;
  category: string;
  certainty: string;
  event: string;
  note: string;
  effective: string;
  expires: string;
  desc: string;
  instruction: string;
}
