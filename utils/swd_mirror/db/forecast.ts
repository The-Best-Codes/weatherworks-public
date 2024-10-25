import fs from "fs";
import path from "path";

interface Forecast {
  current_conditions: CurrentConditions;
  forecast: ForecastData;
  lastFetched: string;
}

interface CurrentConditions {
  air_density: number;
  air_temperature: number;
  brightness: number;
  conditions: string;
  delta_t: number;
  dew_point: number;
  feels_like: number;
  icon: string;
  is_precip_local_day_rain_check: boolean;
  is_precip_local_yesterday_rain_check: boolean;
  lightning_strike_count_last_1hr: number;
  lightning_strike_count_last_3hr: number;
  lightning_strike_last_distance: number;
  lightning_strike_last_distance_msg: string;
  lightning_strike_last_epoch: number;
  precip_accum_local_day: number;
  precip_accum_local_yesterday: number;
  precip_minutes_local_day: number;
  precip_minutes_local_yesterday: number;
  pressure_trend: string;
  relative_humidity: number;
  sea_level_pressure: number;
  solar_radiation: number;
  station_pressure: number;
  time: number;
  uv: number;
  wet_bulb_globe_temperature: number;
  wet_bulb_temperature: number;
  wind_avg: number;
  wind_direction: number;
  wind_direction_cardinal: string;
  wind_gust: number;
}

interface ForecastData {
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

interface DailyForecast {
  air_temp_high: number;
  air_temp_low: number;
  conditions: string;
  day_num: number;
  day_start_local: number;
  icon: string;
  month_num: number;
  precip_icon: string;
  precip_probability: number;
  precip_type: string;
  sunrise: number;
  sunset: number;
}

interface HourlyForecast {
  air_temp: number;
  conditions: string;
  day_num: number;
  day_start_local: number;
  icon: string;
  month_num: number;
  precip_icon: string;
  precip_probability: number;
  precip_type: string;
  sunrise: number;
  sunset: number;
  time: number;
}

const databasePath = path.join(process.cwd(), "database", "swd_recent");
const databaseFile = path.join(databasePath, "forecast.json");

export default function getForecast() {
  return JSON.parse(fs.readFileSync(databaseFile, "utf8"));
}

export function setForecast(forecast: Forecast) {
  fs.writeFileSync(databaseFile, JSON.stringify(forecast));
}

export function checkDatabase() {
  if (!fs.existsSync(databasePath)) {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  if (!fs.existsSync(databaseFile)) {
    fs.writeFileSync(databaseFile, JSON.stringify({}));
  }
}

checkDatabase();
