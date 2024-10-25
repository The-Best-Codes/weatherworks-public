// compassThemeClasses.ts

interface CompassThemeClasses {
  outerCircle: string;
  innerCircle: string;
  tickMarkers: string;
  directionText: string;
  needleBackground: string;
  needleNorth: string;
  needleSouth: string;
}

const themes: Record<string, CompassThemeClasses> = {
  defaultLight: {
    outerCircle: "fill-gray-100 stroke-gray-800",
    innerCircle: "fill-white stroke-gray-600",
    tickMarkers: "stroke-gray-600",
    directionText: "fill-gray-800",
    needleBackground: "fill-gray-500",
    needleNorth: "fill-blue-600",
    needleSouth: "fill-red-600",
  },
  defaultDark: {
    outerCircle: "fill-gray-800 stroke-gray-300",
    innerCircle: "fill-gray-700 stroke-gray-400",
    tickMarkers: "stroke-gray-400",
    directionText: "fill-gray-200",
    needleBackground: "fill-gray-500",
    needleNorth: "fill-blue-500",
    needleSouth: "fill-red-500",
  },
  opaqueLight: {
    outerCircle: "fill-white stroke-gray-800",
    innerCircle: "fill-gray-100 stroke-gray-600",
    tickMarkers: "stroke-gray-600",
    directionText: "fill-gray-800",
    needleBackground: "fill-gray-400",
    needleNorth: "fill-blue-500",
    needleSouth: "fill-red-500",
  },
  opaqueDark: {
    outerCircle: "fill-gray-900 stroke-gray-300",
    innerCircle: "fill-gray-800 stroke-gray-400",
    tickMarkers: "stroke-gray-400",
    directionText: "fill-gray-200",
    needleBackground: "fill-gray-600",
    needleNorth: "fill-blue-300",
    needleSouth: "fill-red-300",
  },
  blurLight: {
    outerCircle: "fill-white fill-opacity-50 stroke-gray-800 backdrop-blur-sm",
    innerCircle: "fill-white fill-opacity-30 stroke-gray-600",
    tickMarkers: "stroke-gray-600",
    directionText: "fill-gray-800",
    needleBackground: "fill-gray-400 fill-opacity-50",
    needleNorth: "fill-blue-500",
    needleSouth: "fill-red-500",
  },
  blurDark: {
    outerCircle:
      "fill-gray-900 fill-opacity-50 stroke-gray-300 backdrop-blur-sm",
    innerCircle: "fill-gray-800 fill-opacity-30 stroke-gray-400",
    tickMarkers: "stroke-gray-400",
    directionText: "fill-gray-200",
    needleBackground: "fill-gray-600 fill-opacity-50",
    needleNorth: "fill-blue-500",
    needleSouth: "fill-red-500",
  },
};

export function getCompassThemeClasses(theme: string): CompassThemeClasses {
  return themes[theme] || themes.defaultLight;
}
