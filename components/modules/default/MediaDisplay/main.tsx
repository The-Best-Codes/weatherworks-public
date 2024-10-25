"use client";
import { Skeleton } from "@/components/ui/skeleton";
import MediaFader from "./util/MediaFader";
import React, { useState, useEffect } from "react";
import { ThemeClasses, themes } from "@/utils/modules/defaultModuleThemes";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaDisplayProps {
  intervalDuration?: number;
  transitionDuration?: number;
  maxHeight?: number;
  horizontalAlignment?: "left" | "center" | "right";
  className?: string;
  sortOrder?: string;
  optimizeImages?: boolean;
  optimizeVideos?: boolean;
  relativePaths?: boolean;
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
}

interface mediaUrl {
  url: string;
  type: string | "image" | "video";
  takenToday: boolean;
  takenYearsAgo: number;
}

interface mediaType {
  url: string;
  type: string | "image" | "video";
  takenToday: boolean;
  takenYearsAgo: number;
  mediaHeight: number;
}

const DefaultMediaDisplay: React.FC<MediaDisplayProps> = ({
  intervalDuration = 10000,
  transitionDuration = 1000,
  maxHeight,
  horizontalAlignment = "left",
  className = "",
  sortOrder = "",
  relativePaths = true,
  theme = "defaultLight",
}) => {
  const [mediaUrls, setMediaUrls] = useState<mediaUrl[]>([]);
  const [mediaHeight, setMediaHeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const themeClasses: ThemeClasses = themes[theme];

  useEffect(() => {
    const fetchMediaUrls = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/media_fader/${sortOrder ? `?sort=${sortOrder}` : ""}`
        );
        const data = await response.json();
        const sortedMedia = data.media.map((media: mediaType) => {
          return {
            url: relativePaths ? `/public${media.url}` : media.url,
            type: media.type,
            takenToday: media.takenToday,
            takenYearsAgo: media.takenYearsAgo,
          };
        });
        setMediaUrls(sortedMedia);
        setLoading(false);
      } catch (error) {
        setError(true);
        setErrorMessage("Error fetching media URLs");
        setLoading(false);
        console.error("Error fetching media URLs:", error);
      }
    };

    fetchMediaUrls();
  }, [sortOrder, relativePaths]);

  useEffect(() => {
    const calcMediaHeight = () => {
      if (maxHeight === undefined || maxHeight === null) {
        const fitter = document.getElementById("modulesHeightFitter");
        const windowHeight = window.innerHeight;
        if (fitter) {
          let adjustedHeight = windowHeight - fitter.offsetHeight;
          if (adjustedHeight < 300) {
            adjustedHeight = 300;
          }
          setMediaHeight(adjustedHeight);
        }
      } else {
        setMediaHeight(maxHeight);
      }
    };

    calcMediaHeight();

    window.addEventListener("resize", calcMediaHeight);
    return () => window.removeEventListener("resize", calcMediaHeight);
  }, [maxHeight, mediaHeight]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-lg",
            themeClasses.card
          )}
          style={{
            width: (mediaHeight as number) * 1.5 || 450,
            height: mediaHeight || 300,
          }}
        >
          <AlertCircle className="w-24 h-24 mb-4 text-red-500" />
          <p className="text-red-500">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Skeleton
          className={`${themeClasses.skeleton}`}
          style={{
            width: (mediaHeight as number) * 1.5 || 450,
            height: mediaHeight || 300,
          }}
        />
      </div>
    );
  }

  return (
    <MediaFader
      mediaUrls={mediaUrls}
      intervalDuration={intervalDuration}
      transitionDuration={transitionDuration}
      maxHeight={mediaHeight || 300}
      horizontalAlignment={horizontalAlignment}
      className={className}
      fadeMode="sequential"
      shouldLoop={true}
      subtractTransitionFromInterval={false}
      relativePaths={relativePaths}
    />
  );
};

export default React.memo(DefaultMediaDisplay);
