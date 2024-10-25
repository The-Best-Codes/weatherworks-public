function calculateFeelsLikeTemperature(
    humidity: number,
    windSpeed: number,
    temperature: number
  ): number {
    // Convert wind speed from m/s to km/h
    const windSpeedKmh = windSpeed * 3.6;
  
    // Calculate the heat index (HI) for high temperatures
    const heatIndex = calculateHeatIndex(temperature, humidity);
  
    // Calculate the wind chill for low temperatures and high wind speeds
    const windChill = calculateWindChill(temperature, windSpeedKmh);
  
    // Determine which index to use based on temperature
    if (temperature <= 10 && windSpeedKmh > 4.8) {
      return windChill;
    } else {
      return heatIndex;
    }
  }
  
  function calculateHeatIndex(temperature: number, humidity: number): number {
    const c1 = -8.78469475556;
    const c2 = 1.61139411;
    const c3 = 2.33854883889;
    const c4 = -0.14611605;
    const c5 = -0.012308094;
    const c6 = -0.0164248277778;
    const c7 = 0.002211732;
    const c8 = 0.00072546;
    const c9 = -0.000003582;
  
    const heatIndex =
      c1 +
      c2 * temperature +
      c3 * humidity +
      c4 * temperature * humidity +
      c5 * temperature ** 2 +
      c6 * humidity ** 2 +
      c7 * temperature ** 2 * humidity +
      c8 * temperature * humidity ** 2 +
      c9 * temperature ** 2 * humidity ** 2;
  
    return heatIndex;
  }
  
  function calculateWindChill(temperature: number, windSpeed: number): number {
    return (
      13.12 +
      0.6215 * temperature -
      11.37 * Math.pow(windSpeed, 0.16) +
      0.3965 * temperature * Math.pow(windSpeed, 0.16)
    );
  }
  
  export {
    calculateFeelsLikeTemperature as default,
    calculateHeatIndex,
    calculateWindChill,
  };
  