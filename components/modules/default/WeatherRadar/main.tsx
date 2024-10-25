"use client";
import React, { useRef, useState } from "react";
import ApiData from "@/config/ww_apiData.json";
import { Card } from "@/components/ui/card";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import { Button } from "@/components/ui/button";
import { RefreshCcw, MapPin, CheckCircle, AlertCircle } from "lucide-react";

interface WeatherRadarModuleProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
}

const DefaultWeatherRadar: React.FC<WeatherRadarModuleProps> = ({ theme }) => {
  const themeClasses: ThemeClasses = themes[theme];
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshStatus, setRefreshStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Store the iframe URL in a variable
  const iframeUrl = `https://www.rainviewer.com/map.html?loc=${
    ApiData.metaData.latitude
  },${
    ApiData.metaData.longitude
  },${10}&oFa=0&oC=1&oU=0&oCS=0&oF=0&oAP=1&c=3&o=35&lm=0&layer=sat-rad&sm=1&sn=1&hu=false`;

  const reloadIframe = () => {
    if (iframeRef.current) {
      try {
        setIsRefreshing(true);
        setRefreshStatus("idle");
        iframeRef.current.src = ""; // Clear the src to trigger reload
        iframeRef.current.src = iframeUrl;

        iframeRef.current.onload = () => {
          setIsRefreshing(false);
          setRefreshStatus("success");
          setTimeout(() => {
            setRefreshStatus("idle");
          }, 1000);
        };

        iframeRef.current.onerror = () => {
          setIsRefreshing(false);
          setRefreshStatus("error");
          setTimeout(() => {
            setRefreshStatus("idle");
          }, 1000);
        };
      } catch (error) {
        console.error("Error reloading iframe:", error);
        setIsRefreshing(false);
        setRefreshStatus("error");
        setTimeout(() => {
          setRefreshStatus("idle");
        }, 1000);
      }
    }
  };

  return (
    <Card className={`w-[716px] h-[450px] rounded-lg ${themeClasses.card}`}>
      <div className="max-w-full max-h-full w-full h-full rounded-lg overflow-hidden relative">
        <div className="flex flex-row absolute bottom-0 right-0 m-2">
          <Button
            variant="default"
            size="icon"
            className={`opacity-70 z-20 w-8 h-8 text-white`}
            onClick={reloadIframe}
            disabled={isRefreshing || refreshStatus !== "idle"}
            aria-label="Reset map"
          >
            {isRefreshing ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : refreshStatus === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : refreshStatus === "error" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </Button>
        </div>
        <iframe
          className="rounded-lg"
          src={iframeUrl}
          width="100%"
          height="100%"
          title="Weather Radar"
          loading="lazy"
          ref={iframeRef}
        ></iframe>
      </div>
    </Card>
  );
};

export default DefaultWeatherRadar;
