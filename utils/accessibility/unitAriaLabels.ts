export function getAriaLabelUnit(unit: string) {
  switch (unit) {
    case "C":
      return "Celsius";
    case "F":
      return "Fahrenheit";
    case "K":
      return "Kelvin";
    case "m/s":
      return "meters per second";
    case "km/h":
      return "kilometers per hour";
    case "mph":
      return "miles per hour";
    case "knots":
      return "knots";
    case "hPa":
      return "hectopascals";
    case "inHg":
      return "inches of mercury";
    case "mmHg":
      return "millimeters of mercury";
    case "mbar":
      return "millibar";
    case "mb":
      return "millibar";
    case "mm":
      return "millimeters";
    case "in":
      return "inches";
    case "cm":
      return "centimeters";
    case "m":
      return "meters";
    case "km":
      return "kilometers";
    case "mi":
      return "miles";
    case "ft":
      return "feet";
    case "yd":
      return "yards";
    case "%":
      return "percent";
    case "ppm":
      return "parts per million";
    case "ppb":
      return "parts per billion";
    case "ppt":
      return "parts per trillion";
    default:
      return "Units";
  }
}

export function getAriaLabelDirection(direction: string) {
  switch (direction) {
    case "N":
      return "North";
    case "S":
      return "South";
    case "E":
      return "East";
    case "W":
      return "West";
    case "NE":
      return "Northeast";
    case "NNE":
      return "North-Northeast";
    case "NW":
      return "Northwest";
    case "NNW":
      return "North-Northwest";
    case "SE":
      return "Southeast";
    case "SSE":
      return "South-Southeast";
    case "SW":
      return "Southwest";
    case "SSW":
      return "South-Southwest";
    case "ENE":
      return "East-Northeast";
    case "ESE":
      return "East-Southeast";
    case "WNW":
      return "West-Northwest";
    case "WSW":
      return "West-Southwest";
    default:
      return "Direction";
  }
}
