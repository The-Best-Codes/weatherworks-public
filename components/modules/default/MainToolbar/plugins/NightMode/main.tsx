"use client";
import React, { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Slash, Loader2 } from "lucide-react";
import { IsNight } from "./util/IsNight";

interface NightModeContextValue {
  isNightMode: boolean;
  setManualNightMode: (mode: boolean | null) => void;
}

const NightModeContext = React.createContext<NightModeContextValue | undefined>(
  undefined
);

const useNightModeContext = () => {
  const context = useContext(NightModeContext);
  if (!context) {
    throw new Error(
      "useNightModeContext must be used within a NightModeProvider"
    );
  }
  return context;
};

const NightModeProvider = ({
  children,
  automode = true,
}: {
  children: React.ReactNode;
  automode?: boolean;
}) => {
  const [autoNightMode, setAutoNightMode] = useState(false);
  const [manualNightMode, setManualNightMode] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const savedManualMode = localStorage.getItem("manualNightMode");
        if (savedManualMode !== null) {
          setManualNightMode(JSON.parse(savedManualMode));
        }
      } catch (error) {
        console.error(
          "Failed to load night mode state from localStorage:",
          error
        );
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(
          "manualNightMode",
          JSON.stringify(manualNightMode)
        );
      } catch (error) {
        console.error(
          "Failed to save night mode state to localStorage:",
          error
        );
      }
    }
  }, [manualNightMode, isLoading]);

  const isNightMode =
    manualNightMode !== null ? manualNightMode : autoNightMode;

  useEffect(() => {
    const checkAutoMode = () => {
      if (automode) {
        const newAutoMode = IsNight();
        setAutoNightMode(newAutoMode);

        if (manualNightMode === newAutoMode) {
          setManualNightMode(null);
        }
      }
    };

    checkAutoMode();

    const intervalId = setInterval(checkAutoMode, 60000);
    return () => clearInterval(intervalId);
  }, [automode, manualNightMode]);

  const setNightMode = (mode: boolean | null) => {
    setManualNightMode(mode);
  };

  if (isLoading) {
    return (
      <Button
        aria-label="Loading indicator for night mode"
        disabled
        size={"icon"}
      >
        <Loader2 className="animate-spin w-6 h-6" />
      </Button>
    );
  }

  return (
    <NightModeContext.Provider
      value={{ isNightMode, setManualNightMode: setNightMode }}
    >
      {children}
    </NightModeContext.Provider>
  );
};

export const NightModeButton = () => {
  const { isNightMode, setManualNightMode } = useNightModeContext();

  const toggleNightMode = () => {
    setManualNightMode(!isNightMode);
  };

  return (
    <Button
      size={"icon"}
      aria-label="Toggle night mode"
      onClick={toggleNightMode}
    >
      {isNightMode ? (
        <div className="relative">
          <Slash className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          <Moon />
        </div>
      ) : (
        <Moon />
      )}
    </Button>
  );
};

export const NightModeOverlay = () => {
  const { isNightMode } = useNightModeContext();

  if (!isNightMode) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        backgroundColor: "rgba(255, 150, 0)",
        mixBlendMode: "multiply",
      }}
    />
  );
};

export default React.memo(NightModeProvider);
