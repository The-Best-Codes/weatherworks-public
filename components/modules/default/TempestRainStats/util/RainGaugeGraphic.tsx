import React from "react";

interface RainGaugeProps {
  width: number;
  height: number;
  fillLevel: number;
  waterColor: string;
  backgroundColor: string;
  tickColor: string;
  textColor: string;
  textRatio?: number;
  unitText?: string;
}

const RainGauge: React.FC<RainGaugeProps> = ({
  width,
  height,
  fillLevel,
  waterColor,
  backgroundColor,
  tickColor,
  textColor,
  textRatio = 1,
  unitText = "in",
}) => {
  return (
    <div
      aria-label="Rain Gauge"
      className="relative mx-auto overflow-hidden rounded-t-lg rounded-b-lg"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: backgroundColor,
      }}
    >
      <div
        className="absolute bottom-0 w-full transition-all ease-in-out duration-1000"
        style={{
          height: `${fillLevel}%`,
          backgroundColor: waterColor,
        }}
      ></div>
      {[
        5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
        95, 100,
      ].map((tick, index) => (
        <div key={index}>
          <div
            className="absolute"
            style={{
              top: `${tick}%`,
              left: 0,
              width: "10px",
              height: "2px",
              backgroundColor: tickColor,
            }}
          ></div>
          {tick % 10 === 0 && (
            <div
              className="absolute"
              style={{
                top: `${tick - 1}%`,
                left: "15px",
                fontSize: "12px",
                color: textColor,
              }}
            >
              {(5 * textRatio - tick / (20 / textRatio)).toFixed(1)}
              {unitText}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(RainGauge);
