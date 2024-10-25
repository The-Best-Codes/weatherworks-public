"use client";
import React, { useEffect, useRef } from "react";

interface SunUVGraphicProps {
  value: number;
}

const SunUVGraphic: React.FC<SunUVGraphicProps> = ({ value }) => {
  const mouthRef = useRef<SVGPathElement>(null);
  const leftEyebrowRef = useRef<SVGLineElement>(null);
  const rightEyebrowRef = useRef<SVGLineElement>(null);
  const sunRef = useRef<SVGCircleElement>(null);
  const sunRayDefRef = useRef<SVGPolygonElement>(null);
  const raysRef = useRef<SVGUseElement[]>([]);

  useEffect(() => {
    const updateSunMouth = (val: number) => {
      const controlPointY = 70 + val * -20;
      if (mouthRef.current) {
        mouthRef.current.setAttribute(
          "d",
          `M 40 60 Q 50 ${controlPointY} 60 60`
        );
      }
    };

    const updateSunEyebrows = (angerValue: number) => {
      const eyebrowStartYHappy = 30;
      const eyebrowEndYAngry = 31 + angerValue * 4;
      if (leftEyebrowRef.current && rightEyebrowRef.current) {
        leftEyebrowRef.current.setAttribute("y1", `${eyebrowStartYHappy}`);
        leftEyebrowRef.current.setAttribute("y2", `${eyebrowEndYAngry}`);
        rightEyebrowRef.current.setAttribute("y1", `${eyebrowEndYAngry}`);
        rightEyebrowRef.current.setAttribute("y2", `${eyebrowStartYHappy}`);
      }
    };

    const updateSunColor = (val: number) => {
      const green = Math.floor(220 - val * 140);
      const color = `rgb(255, ${green}, 0)`;

      if (sunRef.current) {
        sunRef.current.setAttribute("fill", color);
      }

      if (sunRayDefRef.current) {
        sunRayDefRef.current.setAttribute("fill", color);
      }

      raysRef.current.forEach((ray) => {
        if (ray) {
          ray.setAttribute("fill", color);
          //ray.setAttribute("filter", `url(#uv-sun_glow)`);
        }
      });
    };

    updateSunMouth(value);
    updateSunEyebrows(value);
    updateSunColor(value);
  }, [value]);

  return (
    <svg aria-label="UV Index Graphic" width="100%" viewBox="0 0 150 150">
      <g id="sun_container_main-svg" transform="translate(25, 25)">
        <circle cx="50" cy="50" r="47.5" fill="orange" ref={sunRef} />
        <g id="sun-main-face_svg-el" transform="translate(-5, 5) scale(1.1)">
          <circle cx="35" cy="40" r="5" fill="black" />
          <circle cx="65" cy="40" r="5" fill="black" />
          <path
            d="M 40 60 Q 50 50 60 60"
            stroke="black"
            strokeWidth="2"
            fill="none"
            ref={mouthRef}
          />
          <line
            x1="30"
            y1="30"
            x2="40"
            y2="35"
            stroke="black"
            strokeWidth="2"
            ref={leftEyebrowRef}
          />
          <line
            x1="60"
            y1="35"
            x2="70"
            y2="30"
            stroke="black"
            strokeWidth="2"
            ref={rightEyebrowRef}
          />
        </g>
        <defs>
          <polygon
            id="sun-ray_svg-el_sun"
            points="50,0 40,20 60,20"
            fill="orange"
            ref={sunRayDefRef}
          />
          <filter id="uv-sun_glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: 8 }).map((_, index) => (
          <use
            href="#sun-ray_svg-el_sun"
            key={index}
            ref={(el) => {
              if (el) raysRef.current[index] = el;
            }}
            transform={`rotate(${45 * index} 50 50) translate(0,-25)`}
          />
        ))}
      </g>
    </svg>
  );
};

export default React.memo(SunUVGraphic);
