import React from "react";

interface MoonPhaseProps {
  phase: number;
  moonTexture?: string;
  rotation?: number;
  size?: number;
}

const MoonPhase: React.FC<MoonPhaseProps> = ({
  phase,
  moonTexture = "/image/moon/moon.svg",
  rotation = 0,
  size = 100,
}) => {
  const getMoonPhaseAttributes = (val: number) => {
    let r1Fill = "#444";
    let r2Fill = "white";
    let e1Fill = "#444";
    let e1Rx = "0";

    if (val <= 0.25) {
      e1Rx = String(50 - val * 200);
    } else if (val <= 0.5) {
      r1Fill = "#444";
      r2Fill = "white";
      e1Fill = "white";
      e1Rx = String((val - 0.25) * 200);
    } else if (val <= 0.75) {
      r1Fill = "white";
      r2Fill = "#444";
      e1Fill = "white";
      e1Rx = String(50 - (val - 0.5) * 200);
    } else if (val <= 1) {
      r1Fill = "white";
      r2Fill = "#444";
      e1Fill = "#444";
      e1Rx = String((val - 0.75) * 200);
    }

    return { r1Fill, r2Fill, e1Fill, e1Rx };
  };

  const { r1Fill, r2Fill, e1Fill, e1Rx } = getMoonPhaseAttributes(phase);

  return (
    <div aria-label="Moon Phase Graphic">
      <svg
        width={size}
        viewBox="0 0 100 100"
        style={{ transform: `rotate(${rotation}deg)`, transition: "all 0.3s" }}
      >
        <defs>
          <pattern
            id="moonTexturePattern"
            patternUnits="userSpaceOnUse"
            width="100"
            height="100"
          >
            <image
              href={moonTexture}
              x="-10"
              y="-10"
              width="120"
              height="120"
            />
          </pattern>
          <mask id="moonMask">
            <rect id="r1" x="0" y="0" width="50" height="100" fill={r1Fill} />
            <rect id="r2" x="50" y="0" width="50" height="100" fill={r2Fill} />
            <ellipse id="e1" cx="50" cy="50" rx={e1Rx} ry="50" fill={e1Fill} />
          </mask>
        </defs>
        <circle cx="50" cy="50" r="49" fill="black" />
        <circle
          cx="50"
          cy="50"
          r="49"
          fill="url(#moonTexturePattern)"
          mask="url(#moonMask)"
        />
      </svg>
    </div>
  );
};

export default React.memo(MoonPhase);
