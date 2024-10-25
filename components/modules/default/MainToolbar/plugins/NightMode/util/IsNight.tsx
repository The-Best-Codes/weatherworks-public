import SunCalc from "suncalc";
import ApiConfig from "@/config/ww_apiData.json";

export const IsNight = (): boolean => {
  try {
    const currentDate = new Date();

    // Ensure latitude and longitude are numbers
    const latitude = Number(ApiConfig.metaData.latitude);
    const longitude = Number(ApiConfig.metaData.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error("Invalid latitude or longitude in API config");
    }

    const sunPosition = SunCalc.getTimes(currentDate, latitude, longitude);

    // Check if current time is before sunrise or after sunset
    return (
      currentDate < sunPosition.sunrise || currentDate > sunPosition.sunset
    );
  } catch (error) {
    console.error("Error in IsNight function:", error);
    // In case of error, return false (assume it's not night)
    return false;
  }
};
