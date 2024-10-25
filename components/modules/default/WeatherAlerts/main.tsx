"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import { Button } from "@/components/ui/button";
import {
  X,
  Inbox,
  Volume2,
  Loader2,
  StopCircle,
  AlertCircle,
} from "lucide-react";

interface AlertProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  refreshInterval: number;
  collapsedAlerts?: boolean;
  showReadButtons?: boolean;
  readDescription?: boolean;
  autoReadAlerts?: boolean;
  playNewAlertSound?: boolean;
  readOnPageLoad?: boolean;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  link: string;
  expires: string;
  severity: string;
  urgency: string;
  event: string;
  alertData: {
    color: string;
    headline: string;
    description: string;
    sent: string;
  };
  timestamp: string;
  read: boolean;
}

const DefaultWeatherAlerts: React.FC<AlertProps> = ({
  theme,
  refreshInterval,
  collapsedAlerts = true,
  showReadButtons = true,
  readDescription = false,
  autoReadAlerts = true,
  playNewAlertSound = true,
  readOnPageLoad = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const prevAlertsRef = useRef<Alert[]>(alerts);
  const [seenAlertIds, setSeenAlertIds] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [readingStatus, setReadingStatus] = useState<
    "loading" | "reading" | "idle"
  >("idle");
  const [readingAlertId, setReadingAlertId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean | string>(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakAlert = useCallback(
    async (id: string, title: string, description: string) => {
      setIsReading(true);
      setReadingAlertId(id);
      setReadingStatus("loading");
      const textToRead = readDescription ? `${title}. ${description}` : title;
      const url = "/api/tts/";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: textToRead }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch audio");
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        setReadingStatus("reading");

        const audioElement = new Audio(audioUrl);
        audioRef.current = audioElement; // Store the audio element in the ref

        setReadingStatus("reading");

        await new Promise((resolve) => {
          try {
            audioElement.onended = () => {
              audioRef.current = null; // Clear the ref when audio ends naturally
              resolve(null);
            };
            audioElement.play().catch((error) => {
              console.error("Error playing audio:", error);
              resolve(null);
            });
          } catch (error) {
            console.error("Error playing audio:", error);
            resolve(null);
          }
        });
      } catch (error) {
        console.error("Error playing audio:", error);
      } finally {
        setIsReading(false);
        setReadingAlertId(null);
        setReadingStatus("idle");
        audioRef.current = null; // Ensure the ref is cleared
      }
    },
    [readDescription]
  );

  const stopReading = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setIsReading(false);
      setReadingAlertId(null);
      setReadingStatus("idle");
    } catch (error) {
      console.error("Error stopping reading:", error);
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        try {
          const preFetch = await fetch("/api/alerts/refresh/nws/");
          const preFetchData = await preFetch.json();
          if (!preFetchData.success) {
            throw new Error("Failed to fetch NWS alerts");
          }
        } catch (error) {
          console.error("Error refreshing NWS alerts:", error);
        }

        const response = await fetch("/api/alerts/");
        const data = await response.json();
        setAlerts(data.alerts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        setError("Error fetching alerts");
        setLoading(false);
      }
    };

    fetchAlerts();

    const intervalId = setInterval(fetchAlerts, refreshInterval);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  useEffect(() => {
    try {
      const newAlertIds = alerts.map((alert) => alert.id);
      const isNewAlert = newAlertIds.some((id) => !seenAlertIds.includes(id));

      if (isNewAlert && prevAlertsRef.current !== alerts) {
        if (playNewAlertSound) {
          const audio = new Audio("/audio/alert.mp3");
          try {
            audio.play().catch((error) => {
              console.error("Error playing audio:", error);
            });
          } catch (error) {
            console.error("Error playing audio:", error);
          }
        }

        prevAlertsRef.current = alerts;
        setSeenAlertIds(newAlertIds);

        if (isInitialLoad !== true || readOnPageLoad) {
          if (autoReadAlerts && isNewAlert) {
            const newAlert = alerts.find(
              (alert) => !seenAlertIds.includes(alert.id)
            );
            if (newAlert) {
              speakAlert(
                newAlert.id,
                newAlert.alertData.headline,
                newAlert.alertData.description
              );
            }
          }
        }

        if (isInitialLoad === true) {
          setIsInitialLoad(false);
        }
      }
    } catch (error) {
      console.error("Error reading alerts:", error);
    }
  }, [
    alerts,
    seenAlertIds,
    autoReadAlerts,
    playNewAlertSound,
    speakAlert,
    isInitialLoad,
    readOnPageLoad,
  ]);

  const removeAlert = (id: string) => {
    try {
      setAlerts(alerts.filter((alert) => alert.id !== id));
    } catch (error) {
      console.error("Error removing alert:", error);
    }
  };

  const removeAlertApi = async (id: string) => {
    try {
      const alert = document.getElementById(id);
      const buttons = alert?.querySelectorAll("button");
      if (alert) {
        alert.classList.add("opacity-50");
      }

      if (buttons) {
        for (let i = 0; i < buttons.length; i++) {
          buttons[i].classList.add("opacity-50");
          buttons[i].disabled = true;
        }
      }

      const response = await fetch("/api/alerts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      const data = await response.json();

      if (data.success) {
        if (alert) {
          removeAlert(id);
          if (alert) {
            alert.classList.remove("opacity-50");
          }
          if (buttons) {
            for (let i = 0; i < buttons.length; i++) {
              buttons[i].classList.remove("opacity-50");
              buttons[i].disabled = false;
            }
          }
        }
      } else {
        console.error("Error removing alert:", data.error);
        if (alert) {
          alert.classList.remove("opacity-50");
        }
        if (buttons) {
          for (let i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove("opacity-50");
            buttons[i].disabled = false;
          }
        }
      }
    } catch (error) {
      console.error("Error removing alert:", error);
    }
  };

  const themeClasses: ThemeClasses = themes[theme];

  const renderAlertContent = (alert: Alert) => {
    if (collapsedAlerts) {
      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={alert.id} className="border-none">
            <AccordionTrigger className="text-white text-left font-bold text-lg p-2">
              <h3 className="text-white font-bold text-lg">
                {alert.alertData.headline}
              </h3>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <div className="w-full p-2">
                <p className="max-h-40 overflow-auto p-2">
                  {alert.alertData.description}
                </p>
                <p className="text-white text-xs mt-2 py-2">
                  {new Date(alert.alertData.sent)?.toLocaleString() || ""}
                </p>
                {showReadButtons && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Read Alert"
                    onClick={
                      readingStatus === "idle"
                        ? () =>
                            speakAlert(
                              alert.id,
                              alert.alertData.headline,
                              alert.alertData.description
                            )
                        : stopReading
                    }
                    disabled={
                      (isReading &&
                        readingAlertId !== alert.id &&
                        readingStatus !== "reading") ||
                      readingStatus === "loading"
                    }
                  >
                    {isReading &&
                    readingStatus === "loading" &&
                    readingAlertId === alert.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : readingStatus === "reading" &&
                      readingAlertId === alert.id ? (
                      <StopCircle className="w-4 h-4" />
                    ) : isReading ? (
                      <Volume2 className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    <span className="ml-2">Speak Alert</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Delete Alert"
                  onClick={() => removeAlertApi(alert.id)}
                >
                  <X className="w-4 h-4" />
                  <span className="ml-2">Delete Alert</span>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    } else {
      return (
        <>
          <CardHeader className="p-2 flex-row w-full justify-between items-start gap-2">
            <h3 className="text-white font-bold text-lg">
              {alert.alertData.headline}
            </h3>
            <div className="flex flex-row gap-1" style={{ margin: "0px" }}>
              {showReadButtons && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  aria-label="Read Alert"
                  onClick={
                    readingStatus === "idle"
                      ? () =>
                          speakAlert(
                            alert.id,
                            alert.alertData.headline,
                            alert.alertData.description
                          )
                      : stopReading
                  }
                  disabled={
                    (isReading &&
                      readingAlertId !== alert.id &&
                      readingStatus !== "reading") ||
                    readingStatus === "loading"
                  }
                >
                  {isReading &&
                  readingStatus === "loading" &&
                  readingAlertId === alert.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : readingStatus === "reading" &&
                    readingAlertId === alert.id ? (
                    <StopCircle className="w-4 h-4" />
                  ) : isReading ? (
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                aria-label="Delete Alert"
                onClick={() => removeAlertApi(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <p className="max-h-40 overflow-auto">
              {alert.alertData.description}
            </p>
          </CardContent>
          <CardFooter className="p-2">
            <p className="text-white text-xs">
              {new Date(alert.alertData.sent)?.toLocaleString() || ""}
            </p>
          </CardFooter>
        </>
      );
    }
  };

  if (error) {
    return (
      <Card className={`${themeClasses.card} w-[350px] h-[450px] p-8`}>
        <div className="flex flex-col justify-center items-center overflow-auto max-h-full">
          <AlertCircle className="w-24 h-24 text-red-500 mb-4" />
          <p className={`${themeClasses.text} text-center`}>
            Something went wrong with alerts
          </p>
          <p className={`${themeClasses.text} text-center text-red-500`}>
            {error || "No details available"}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {loading ? (
        <Card className={`${themeClasses.card} w-[350px] h-[450px] p-8`}>
          <div className="flex flex-col gap-6 overflow-auto max-h-full">
            <Skeleton className={`${themeClasses.skeleton} w-full h-48`} />
            <Skeleton className={`${themeClasses.skeleton} w-full h-48`} />
          </div>
        </Card>
      ) : (
        <Card
          className={`${themeClasses.card} w-[350px] h-[450px] overflow-auto p-2`}
        >
          <CardHeader className="p-2">
            <h3 className={`${themeClasses.text} font-bold text-xl`}>
              Alerts ({alerts.length || 0})
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 p-2">
            {alerts.length === 0 ? (
              <>
                <p className={`${themeClasses.text} text-center`}>
                  No alerts found
                </p>
                <Inbox className="w-24 h-24 text-gray-400 mx-auto" />
                <p
                  className={`${themeClasses.text} text-center text-sm italic opacity-70`}
                >
                  Try causing a natural disaster to get started
                </p>
              </>
            ) : (
              <>
                {alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    id={`${alert.id}`}
                    data-timestamp={alert.timestamp}
                    className={"border-none text-white"}
                    style={{
                      backgroundColor:
                        alert.alertData?.color || "rgb(249, 115, 22)",
                    }}
                  >
                    {renderAlertContent(alert)}
                  </Card>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default React.memo(DefaultWeatherAlerts);
