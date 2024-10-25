"use client";
import { useState, useEffect, useCallback } from "react";

const API_URL = "/api/swd_mirror/latest_obs";
const CACHE_KEY = "weatherDataLatestObs";

interface WeatherData {
  air_density: number;
  air_temperature: number;
  barometric_pressure: number;
  brightness: number;
  delta_t: number;
  dew_point: number;
  feels_like: number;
  heat_index: number;
  lightning_strike_count: number;
  lightning_strike_count_last_1hr: number;
  lightning_strike_count_last_3hr: number;
  lightning_strike_last_distance: number;
  lightning_strike_last_epoch: number;
  precip: number;
  precip_accum_last_1hr: number;
  precip_accum_local_day: number;
  precip_accum_local_day_final: number;
  precip_accum_local_yesterday: number;
  precip_accum_local_yesterday_final: number;
  precip_analysis_type_yesterday: number;
  precip_minutes_local_day: number;
  precip_minutes_local_yesterday: number;
  precip_minutes_local_yesterday_final: number;
  pressure_trend: string;
  relative_humidity: number;
  sea_level_pressure: number;
  solar_radiation: number;
  station_pressure: number;
  timestamp: number;
  uv: number;
  wet_bulb_globe_temperature: number;
  wet_bulb_temperature: number;
  wind_avg: number;
  wind_chill: number;
  wind_direction: number;
  wind_gust: number;
  wind_lull: number;
}

const useLatestObs = (refreshInterval = 60000) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchAndCacheData = useCallback(async () => {
    try {
      const response = await fetch(API_URL, {
        next: { revalidate: refreshInterval },
      });
      const data = await response.json();
      const newWeatherData = data.obs[0];
      const now = new Date().getTime();

      // Update state
      setWeatherData(newWeatherData);
      setLastUpdated(now);

      // Cache data
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: newWeatherData,
          timestamp: now,
        })
      );
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }, [refreshInterval]);

  const getCachedData = useCallback(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();
      if (now - timestamp < refreshInterval) {
        setWeatherData(data);
        setLastUpdated(timestamp);
        return true;
      }
    }
    return false;
  }, [refreshInterval]);

  useEffect(() => {
    const initializeData = async () => {
      const hasCachedData = getCachedData();
      if (!hasCachedData) {
        await fetchAndCacheData();
      }
    };

    initializeData();

    const intervalId = setInterval(() => {
      const hasCachedData = getCachedData();
      if (!hasCachedData) {
        fetchAndCacheData();
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchAndCacheData, getCachedData, refreshInterval]);

  const forceUpdate = useCallback(() => {
    fetchAndCacheData();
  }, [fetchAndCacheData]);

  return {
    lastUpdated,
    forceUpdate,
    air_density: weatherData?.air_density || 0,
    air_temperature: weatherData?.air_temperature || 0,
    barometric_pressure: weatherData?.barometric_pressure || 0,
    brightness: weatherData?.brightness || 0,
    delta_t: weatherData?.delta_t || 0,
    dew_point: weatherData?.dew_point || 0,
    feels_like: weatherData?.feels_like || 0,
    heat_index: weatherData?.heat_index || 0,
    lightning_strike_count: weatherData?.lightning_strike_count || 0,
    lightning_strike_count_last_1hr:
      weatherData?.lightning_strike_count_last_1hr || 0,
    lightning_strike_count_last_3hr:
      weatherData?.lightning_strike_count_last_3hr || 0,
    lightning_strike_last_distance:
      weatherData?.lightning_strike_last_distance || 0,
    lightning_strike_last_epoch: weatherData?.lightning_strike_last_epoch || 0,
    precip: weatherData?.precip || 0,
    precip_accum_last_1hr: weatherData?.precip_accum_last_1hr || 0,
    precip_accum_local_day: weatherData?.precip_accum_local_day || 0,
    precip_accum_local_day_final:
      weatherData?.precip_accum_local_day_final || 0,
    precip_accum_local_yesterday:
      weatherData?.precip_accum_local_yesterday || 0,
    precip_accum_local_yesterday_final:
      weatherData?.precip_accum_local_yesterday_final || 0,
    precip_analysis_type_yesterday:
      weatherData?.precip_analysis_type_yesterday || 0,
    precip_minutes_local_day: weatherData?.precip_minutes_local_day || 0,
    precip_minutes_local_yesterday:
      weatherData?.precip_minutes_local_yesterday || 0,
    precip_minutes_local_yesterday_final:
      weatherData?.precip_minutes_local_yesterday_final || 0,
    pressure_trend: weatherData?.pressure_trend || "",
    relative_humidity: weatherData?.relative_humidity || 0,
    sea_level_pressure: weatherData?.sea_level_pressure || 0,
    solar_radiation: weatherData?.solar_radiation || 0,
    station_pressure: weatherData?.station_pressure || 0,
    timestamp: weatherData?.timestamp || 0,
    uv: weatherData?.uv || 0,
    wet_bulb_globe_temperature: weatherData?.wet_bulb_globe_temperature || 0,
    wind_avg: weatherData?.wind_avg || 0,
    wind_direction: weatherData?.wind_direction || 0,
    wind_gust: weatherData?.wind_gust || 0,
    wind_lull: weatherData?.wind_lull || 0,
  };
};

export default useLatestObs;
