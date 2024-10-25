"use client";
import { useState, useEffect, useCallback } from "react";

const API_URL = "/api/swd_mirror/history";
const CACHE_KEY = "historicalDataLatestObs";

interface WeatherData {
  station_id: string;
  type: string;
  first_ob_day_local: string;
  last_ob_day_local: string;
  stats_day: Array<string[]>;
  stats_week: Array<string[]>;
  stats_month: Array<string[]>;
  stats_year: Array<string[]>;
  stats_alltime: Array<string[]>;
  stats_week_time: Array<string[]>;
  stats_month_time: Array<string[]>;
  stats_year_time: Array<string[]>;
  stats_alltime_time: Array<string[]>;
  status: {
    status_code: number;
    status_message: string;
  };
  lastFetched: string;
  isOnline: boolean;
  isDataFresh: boolean;
}

const useHistoryCache = (refreshInterval = 3600000) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchAndCacheData = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const newWeatherData = data;
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
  }, []);

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
    ...weatherData,
  };
};

export default useHistoryCache;
