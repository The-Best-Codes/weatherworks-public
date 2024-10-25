"use client";
import React, { useState, useEffect } from "react";
import { getCompassThemeClasses } from "./compassThemeClasses";
import { getAriaLabelDirection } from "@/utils/accessibility/unitAriaLabels";

interface CompassProps {
  direction: number;
  width?: number;
  height?: number;
  className?: string;
  rotationType?: "needle" | "base";
  needleWidth?: number;
  relativeRotation?: number;
  relativeRotationAlign?: boolean;
  realisticRelativeRotation?: boolean;
  needleBackgroundCircle?: boolean;
  theme?:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
}

const Compass: React.FC<CompassProps> = ({
  direction,
  width = 300,
  height = 300,
  className = "flex flex-col items-center",
  rotationType = "needle",
  needleWidth = 30,
  relativeRotation = 0,
  relativeRotationAlign = true,
  realisticRelativeRotation = false,
  needleBackgroundCircle = false,
  theme = "defaultLight",
}) => {
  const [rotationStyle, setRotationStyle] = useState({
    transform: "rotate(0deg)",
  });

  useEffect(() => {
    setRotationStyle({
      transform: `rotate(${direction}deg)`,
    });
  }, [direction]);

  const getRelativeRotation = (angle: number) => {
    return `rotate(${angle} 150 150)`;
  };

  const themeClasses = getCompassThemeClasses(theme);

  return (
    <div aria-label="Compass graphic" className={className}>
      <svg width={width} height={height} viewBox="0 0 300 300">
        <g
          style={{
            transform: rotationType === "base" ? rotationStyle.transform : "",
            transformOrigin: "center",
            transition: "transform 0.3s ease",
          }}
        >
          <circle
            cx="150"
            cy="150"
            r="145"
            className={themeClasses.outerCircle}
          />
          <circle
            cx="150"
            cy="150"
            r="135"
            className={themeClasses.innerCircle}
          />
          <g
            id="compass-rose"
            transform={getRelativeRotation(relativeRotation)}
          >
            {/* Tick markers */}
            <g className={themeClasses.tickMarkers}>
              {[
                22.5, 45, 67.5, 112.5, 135, 157.5, 202.5, 225, 247.5, 292.5,
                315, 337.5,
              ].map((angle) => (
                <line
                  key={angle}
                  x1="150"
                  y1="20"
                  x2="150"
                  y2="30"
                  transform={`rotate(${angle} 150 150)`}
                />
              ))}
            </g>
          </g>
          <g transform={getRelativeRotation(relativeRotation)}>
            {["N", "E", "S", "W"].map((direction, index) => {
              const angle = index * 90;
              const textX = Math.sin((angle * Math.PI) / 180) * 120 + 150;
              const textY = -Math.cos((angle * Math.PI) / 180) * 120 + 150;
              return (
                <text
                  key={direction}
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Arial"
                  fontSize="20"
                  className={themeClasses.directionText}
                  aria-label={getAriaLabelDirection(direction)}
                  transform={
                    relativeRotationAlign
                      ? `rotate(${
                          realisticRelativeRotation
                            ? -angle - relativeRotation
                            : -relativeRotation
                        } ${textX} ${textY})`
                      : ""
                  }
                >
                  {direction}
                </text>
              );
            })}
          </g>
        </g>
        <g
          id="needle"
          aria-label="Wind compass needle"
          className="transition-transform duration-300"
          style={{
            ...(rotationType === "needle" ? rotationStyle : {}),
            transformOrigin: "center",
          }}
        >
          {needleBackgroundCircle && (
            <circle
              cx="150"
              cy="150"
              r="20"
              className={themeClasses.needleBackground}
            />
          )}
          <path
            aria-label="Wind compass needle"
            d={`M150 40 L${150 + needleWidth / 2} 150 L${
              150 - needleWidth / 2
            } 150 Z`}
            className={themeClasses.needleNorth}
          />
          <path
            aria-label="Wind compass needle"
            d={`M150 260 L${150 + needleWidth / 2} 150 L${
              150 - needleWidth / 2
            } 150 Z`}
            className={themeClasses.needleSouth}
          />
        </g>
      </svg>
    </div>
  );
};

export default Compass;
