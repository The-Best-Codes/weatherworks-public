// utils/unitConversions.ts

type TemperatureUnit = "C" | "F" | "K";
type SpeedUnit = "m/s" | "km/h" | "mph" | "knots";
type PressureUnit = "hPa" | "inHg" | "mmHg" | "mbar";
type LengthUnit = "mm" | "in" | "cm" | "yd" | "ft" | "mi" | "m" | "km";

type ConversionFunction = (value: number, from: string, to: string) => number;

const roundToDecimal = (value: number, decimals: number): number => {
  return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
};

export const convertTemperature: ConversionFunction = (value, from, to) => {
  const normalize = (val: number, unit: TemperatureUnit): number => {
    switch (unit) {
      case "C":
        return val;
      case "F":
        return ((val - 32) * 5) / 9;
      case "K":
        return val - 273.15;
      default:
        throw new Error(`Unknown temperature unit: ${unit}`);
    }
  };

  const denormalize = (val: number, unit: TemperatureUnit): number => {
    switch (unit) {
      case "C":
        return val;
      case "F":
        return (val * 9) / 5 + 32;
      case "K":
        return val + 273.15;
      default:
        throw new Error(`Unknown temperature unit: ${unit}`);
    }
  };

  const normalizedValue = normalize(value, from as TemperatureUnit);
  return roundToDecimal(denormalize(normalizedValue, to as TemperatureUnit), 2);
};

export const convertSpeed: ConversionFunction = (value, from, to) => {
  const conversions: Record<SpeedUnit, number> = {
    "m/s": 1,
    "km/h": 3.6,
    mph: 2.23694,
    knots: 1.94384,
  };

  const normalizedValue = value / conversions[from as SpeedUnit];
  return roundToDecimal(normalizedValue * conversions[to as SpeedUnit], 2);
};

export const convertPressure: ConversionFunction = (value, from, to) => {
  const hPaToInHg = 0.02953;
  const hPaToMmHg = 0.75006;

  const toHpa = (val: number, unit: PressureUnit): number => {
    switch (unit) {
      case "hPa":
        return val;
      case "inHg":
        return val / hPaToInHg;
      case "mmHg":
        return val / hPaToMmHg;
      case "mbar":
        return val;
      default:
        throw new Error(`Unknown pressure unit: ${unit}`);
    }
  };

  const fromHpa = (val: number, unit: PressureUnit): number => {
    switch (unit) {
      case "hPa":
        return val;
      case "inHg":
        return val * hPaToInHg;
      case "mmHg":
        return val * hPaToMmHg;
      case "mbar":
        return val;
      default:
        throw new Error(`Unknown pressure unit: ${unit}`);
    }
  };

  const hPaValue = toHpa(value, from as PressureUnit);
  return roundToDecimal(fromHpa(hPaValue, to as PressureUnit), 2);
};

export const convertLength: ConversionFunction = (value, from, to) => {
  const conversions: Record<LengthUnit, number> = {
    mm: 1,
    in: 25.4,
    cm: 10,
    yd: 91.44,
    ft: 30.48,
    mi: 1609.34,
    m: 1,
    km: 1000,
  };

  const normalizedValue = value * conversions[from as LengthUnit];
  return roundToDecimal(normalizedValue / conversions[to as LengthUnit], 2);
};

export const convert = (value: number, from: string, to: string): number => {
  if (from === to) return value; // No conversion needed if units are the same

  const converters: Record<string, ConversionFunction> = {
    temperature: convertTemperature,
    speed: convertSpeed,
    pressure: convertPressure,
    length: convertLength,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [category, converter] of Object.entries(converters)) {
    try {
      const result = converter(value, from, to);
      if (isNaN(result)) {
        throw new Error("Conversion resulted in NaN");
      }
      return result;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // If conversion fails, try the next category
      //console.warn(`Failed to convert using ${category}: ${e?.message || ""}`);
      continue;
    }
  }

  throw new Error(`Unable to convert ${value} from ${from} to ${to}`);
};
