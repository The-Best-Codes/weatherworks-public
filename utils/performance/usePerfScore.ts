"use client";
import { useState, useCallback, useEffect } from "react";

export function usePerfScore() {
  const [data, setData] = useState<PerformanceResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const recalculate = useCallback(() => {
    if (!navigator || !navigator.hardwareConcurrency) {
      setData(null);
      return;
    }

    setLoading(true);

    const performanceResults: PerformanceResults = {
      cpuCores: 0,
      deviceMemory: 0,
      networkSpeed: 0,
      gpuPerformance: 0,
      calculationTime: 0,
      score: 0,
    };

    // Measure CPU cores
    performanceResults.cpuCores = navigator.hardwareConcurrency || 1;

    // Measure device memory (in GB)
    performanceResults.deviceMemory =
      (navigator as { deviceMemory?: number }).deviceMemory || 1;

    // Measure network speed (in Mbps)
    performanceResults.networkSpeed =
      (navigator as { connection?: { downlink?: number } }).connection
        ?.downlink || 0;

    // Simple WebGL test
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    performanceResults.gpuPerformance = gl ? 1 : 0;

    // Test processing speed with a simple loop
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      eval("Math.random()");
    }
    const end = performance.now();
    performanceResults.calculationTime = end - start;

    // Clean up
    canvas.remove();

    // Calculate a simple performance score
    const score =
      performanceResults.cpuCores * 10 +
      performanceResults.deviceMemory * 5 +
      (performanceResults.networkSpeed || 0) +
      performanceResults.gpuPerformance * 20 -
      performanceResults.calculationTime;

    performanceResults.score = Math.max(0, score);

    setData(performanceResults);
    setLoading(false);
  }, []);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  return {
    cpuCores: data?.cpuCores || 0,
    deviceMemory: data?.deviceMemory || 0,
    networkSpeed: data?.networkSpeed || 0,
    gpuPerformance: data?.gpuPerformance || 0,
    calculationTime: data?.calculationTime || 0,
    score: data?.score || 0,
    recalculate,
    loading,
  };
}

interface PerformanceResults {
  cpuCores: number;
  deviceMemory: number;
  networkSpeed: number;
  gpuPerformance: number;
  calculationTime: number;
  score: number;
}
