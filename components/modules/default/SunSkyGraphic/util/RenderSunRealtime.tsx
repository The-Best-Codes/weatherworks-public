"use client";
import React, { useRef, useEffect, useState } from "react";
import SunCalc from "suncalc";

interface SunPositionGraphicProps {
  latitude: number;
  longitude: number;
  sunRadius?: number;
  customClassName?: string;
  width?: number;
  height?: number;
}

const SunPositionGraphic: React.FC<SunPositionGraphicProps> = ({
  latitude,
  longitude,
  sunRadius = 30,
  customClassName = "",
  width = window.innerWidth,
  height = window.innerHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawSky = () => {
      const sunPosition = SunCalc.getPosition(date, latitude, longitude);
      const times = SunCalc.getTimes(date, latitude, longitude);

      // Convert altitude and azimuth to x, y coordinates
      const x = width * ((sunPosition.azimuth + Math.PI) / (Math.PI * 2));
      const y =
        height * (1 - (sunPosition.altitude + Math.PI / 18) / (Math.PI / 2));

      // Calculate sun height (0 to 1)
      /* let sunHeight = 1 - y / height;
      sunHeight = Math.max(0, Math.min(1, sunHeight)); */

      // Calculate time factor (0 to 1, where 0.5 is noon)
      const noon = new Date(times.solarNoon);
      const timeFactor =
        (date.getHours() * 60 +
          date.getMinutes() -
          (noon.getHours() * 60 + noon.getMinutes())) /
          (24 * 60) +
        0.5;

      // Define color stops for different times of day
      const colorStops = [
        { time: 0, colors: [10, 10, 35] }, // Night
        { time: 0.2, colors: [135, 206, 235] }, // Morning
        { time: 0.5, colors: [135, 206, 235] }, // Noon
        { time: 0.8, colors: [135, 206, 235] }, // Afternoon
        { time: 1, colors: [10, 10, 35] }, // Night
      ];

      // Find the two closest color stops
      let lowerIndex = 0;
      let upperIndex = 1;
      for (let i = 0; i < colorStops.length - 1; i++) {
        if (
          timeFactor >= colorStops[i].time &&
          timeFactor < colorStops[i + 1].time
        ) {
          lowerIndex = i;
          upperIndex = i + 1;
          break;
        }
      }

      // Interpolate between the two color stops
      const lowerStop = colorStops[lowerIndex];
      const upperStop = colorStops[upperIndex];
      const factor =
        (timeFactor - lowerStop.time) / (upperStop.time - lowerStop.time);

      const r = Math.round(
        lowerStop.colors[0] +
          (upperStop.colors[0] - lowerStop.colors[0]) * factor
      );
      const g = Math.round(
        lowerStop.colors[1] +
          (upperStop.colors[1] - lowerStop.colors[1]) * factor
      );
      const b = Math.round(
        lowerStop.colors[2] +
          (upperStop.colors[2] - lowerStop.colors[2]) * factor
      );

      // Draw sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
      gradient.addColorStop(
        1,
        `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(
          0,
          b - 10
        )})`
      );

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw sun
      ctx.beginPath();
      ctx.arc(x, y, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 140, 0, 0.8)";
      ctx.fill();

      // Draw sun glow
      const glowRadius = sunRadius * 1.5;
      const glowGradient = ctx.createRadialGradient(
        x,
        y,
        sunRadius,
        x,
        y,
        glowRadius
      );
      glowGradient.addColorStop(0, "rgba(255, 140, 0, 0.4)");
      glowGradient.addColorStop(1, "rgba(255, 140, 0, 0)");

      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
    };

    drawSky();

    // Update time every minute
    const interval = setInterval(() => {
      setDate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [date, latitude, longitude, width, height, sunRadius]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded-tr-lg rounded-tl-lg ${customClassName || ""}`}
      aria-label="Sun position graphic"
    />
  );
};

export default React.memo(SunPositionGraphic);
