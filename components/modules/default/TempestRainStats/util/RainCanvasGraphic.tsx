/* eslint-disable react/no-is-mounted */
"use client";
import React, { useEffect, useRef } from "react";

interface RainEffectProps {
  width: number;
  height: number;
  dropCount: number;
  speed: number;
  className?: string;
}

class Raindrop {
  x!: number;
  y!: number;
  length!: number;
  speed!: number;
  canvasWidth: number;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvasWidth;
    this.y = Math.random() * -this.canvasHeight;
    this.length = Math.random() * 20 + 10;
    this.speed = Math.random() * 3 + 2;
  }

  fall(speed: number) {
    this.y += (this.speed * speed) / 10;
    if (this.y > this.canvasHeight) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + this.length);
    ctx.strokeStyle = "rgba(0, 191, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

const RainEffect: React.FC<RainEffectProps> = ({
  width,
  height,
  dropCount,
  speed,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raindrops: Raindrop[] = [];

    const createRaindrops = () => {
      raindrops = [];
      for (let i = 0; i < dropCount; i++) {
        raindrops.push(new Raindrop(width, height));
      }
    };

    /* const updateRaindrops = () => {
      if (raindrops.length < dropCount) {
        for (let i = raindrops.length; i < dropCount; i++) {
          raindrops.push(new Raindrop(width, height));
        }
      } else if (raindrops.length > dropCount) {
        raindrops = raindrops.slice(0, dropCount);
      }
    }; */

    const drawRain = () => {
      ctx.clearRect(0, 0, width, height);
      raindrops.forEach((drop) => {
        drop.fall(speed);
        drop.draw(ctx);
      });
      requestAnimationFrame(drawRain);
    };

    createRaindrops();
    drawRain();

    return () => {
      // Clean up if needed
    };
  }, [width, height, dropCount, speed]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`w-full h-full ${className}`}
    />
  );
};

export default React.memo(RainEffect);
