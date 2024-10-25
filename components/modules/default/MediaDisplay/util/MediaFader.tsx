"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { usePerfScore } from "@/utils/performance/usePerfScore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MediaFaderProps {
  mediaUrls: {
    url: string;
    type: string | "image" | "video";
    takenToday: boolean;
    takenYearsAgo: number;
  }[];
  intervalDuration?: number;
  transitionDuration?: number;
  shouldLoop?: boolean;
  subtractTransitionFromInterval?: boolean;
  maxHeight?: number;
  horizontalAlignment?: "left" | "center" | "right";
  className?: string;
  fadeMode?: "sequential" | "crossfade";
  relativePaths?: boolean;
}

const MediaFader: React.FC<MediaFaderProps> = ({
  mediaUrls,
  intervalDuration = 3000,
  transitionDuration = 1000,
  shouldLoop = true,
  subtractTransitionFromInterval = false,
  maxHeight,
  horizontalAlignment = "left",
  className = "",
  fadeMode = "sequential",
  relativePaths = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    "next" | "previous"
  >("next");
  const { score: perfScore, loading: perfLoading } = usePerfScore();

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleMouseStart = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTouchEnd(e.clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 150) {
      // Swipe left
      goToNextMedia();
    }

    if (touchStart - touchEnd < -150) {
      // Swipe right
      goToPreviousMedia();
    }
  };

  const handleMouseEnd = () => {
    if (touchStart - touchEnd > 150) {
      // Swipe left
      goToNextMedia();
    }

    if (touchStart - touchEnd < -150) {
      // Swipe right
      goToPreviousMedia();
    }
  };

  const getOptimizedImageUrl = useCallback(
    (url: string) => {
      return `/api/optimize/img?path=${url}&h=${maxHeight}&relative=${relativePaths}${
        perfScore < 50 && !perfLoading ? "&q=50" : ""
      }`;
    },
    [maxHeight, relativePaths, perfLoading, perfScore]
  );

  const getOptimizedVideoUrl = useCallback(
    (url: string) => {
      return `/api/optimize/vid?path=${url}&h=${maxHeight}&relative=${relativePaths}&duration=${intervalDuration}${
        perfScore < 50 && !perfLoading ? "&q=27" : ""
      }`;
    },
    [intervalDuration, maxHeight, relativePaths, perfLoading, perfScore]
  );

  const goToNextMedia = useCallback(() => {
    if (isTransitioning) return;
    setTransitionDirection("next");
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % mediaUrls.length;
        return shouldLoop || newIndex !== 0 ? newIndex : prevIndex;
      });
      setIsTransitioning(false);
    }, transitionDuration);
  }, [mediaUrls.length, shouldLoop, transitionDuration, isTransitioning]);

  const goToPreviousMedia = useCallback(() => {
    if (isTransitioning) return;
    setTransitionDirection("previous");
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex - 1 + mediaUrls.length) % mediaUrls.length;
        return shouldLoop || newIndex !== mediaUrls.length - 1
          ? newIndex
          : prevIndex;
      });
      setIsTransitioning(false);
    }, transitionDuration);
  }, [mediaUrls.length, shouldLoop, transitionDuration, isTransitioning]);

  useEffect(() => {
    const totalInterval = subtractTransitionFromInterval
      ? Math.max(intervalDuration - transitionDuration, 0)
      : intervalDuration;

    const interval = setInterval(() => {
      goToNextMedia();
    }, totalInterval);

    return () => clearInterval(interval);
  }, [
    intervalDuration,
    transitionDuration,
    shouldLoop,
    subtractTransitionFromInterval,
    goToNextMedia,
  ]);

  const getTransformStyle = () => {
    switch (horizontalAlignment) {
      case "center":
        return "translate(-50%, -50%)";
      case "right":
        return "translate(-100%, -50%)";
      default:
        return "translate(0, -50%)";
    }
  };

  const getPositionStyle = () => {
    switch (horizontalAlignment) {
      case "center":
        return { left: "50%", top: "50%" };
      case "right":
        return { right: "0", top: "50%" };
      default:
        return { left: "0", top: "50%" };
    }
  };

  const renderMedia = (
    index: number,
    position: "previous" | "current" | "next",
    className: string | undefined
  ) => {
    if (index < 0 || index >= mediaUrls.length || !mediaUrls[index]) {
      return null;
    }

    const media = mediaUrls[index];

    const opacity = (() => {
      if (fadeMode === "sequential") {
        if (position === "current") return isTransitioning ? 0 : 1;
        if (position === "next" && transitionDirection === "next")
          return isTransitioning ? 1 : 0;
        if (position === "previous" && transitionDirection === "previous")
          return isTransitioning ? 1 : 0;
        return 0;
      } else {
        // Crossfade logic
        if (position === "current") return isTransitioning ? 0 : 1;
        if (
          (position === "next" && transitionDirection === "next") ||
          (position === "previous" && transitionDirection === "previous")
        ) {
          return isTransitioning ? 1 : 0;
        }
        return 0;
      }
    })();

    const zIndex = position === "current" ? 2 : 1;

    const commonStyle = {
      opacity,
      transitionDuration: `${transitionDuration}ms`,
      ...getPositionStyle(),
      transform: getTransformStyle(),
      zIndex,
      maxHeight: maxHeight,
      width: "auto",
      height: "100%",
    };

    const getMediaElement = () => {
      if (media.type === "image") {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={media.url}
            src={getOptimizedImageUrl(media.url)}
            alt={`Media ${index}`}
            className={`absolute object-cover transition-opacity ${className} cursor-ew-resize`}
            style={{
              ...commonStyle,
              visibility:
                position === "current" || isTransitioning
                  ? "visible"
                  : "hidden",
            }}
            draggable={false}
            loading={position === "current" ? "eager" : "lazy"}
            aria-label={`Slideshow Image ${index}`}
          />
        );
      } else if (media.type === "video") {
        return (
          <video
            key={media.url}
            ref={(el) => {
              if (position === "current") videoRefs.current[0] = el;
              else if (position === "next") videoRefs.current[1] = el;
              else videoRefs.current[2] = el;
            }}
            src={getOptimizedVideoUrl(media.url)}
            className={`absolute object-cover transition-opacity ${className} cursor-ew-resize`}
            style={{
              ...commonStyle,
              visibility:
                position === "current" || isTransitioning
                  ? "visible"
                  : "hidden",
            }}
            aria-label={`Slideshow Video ${index}`}
            autoPlay
            loop
            muted
            playsInline
          >
            Your browser does not support playing videos directly.
          </video>
        );
      }
    };

    return getMediaElement();
  };

  const previousIndex =
    (currentIndex - 1 + mediaUrls.length) % mediaUrls.length;
  const nextIndex = (currentIndex + 1) % mediaUrls.length;

  return (
    <div
      ref={containerRef}
      className={"relative overflow-hidden"}
      style={{
        width: "auto",
        height: maxHeight,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseStart}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseEnd}
    >
      {mediaUrls[currentIndex]?.takenToday && (
        <div className={"absolute top-2 right-2 z-10"}>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <CalendarDays className="w-24 h-24 text-white drop-shadow-md" />
              </TooltipTrigger>
              <TooltipContent side="left">
                {`This media was taken exactly ${mediaUrls[currentIndex]?.takenYearsAgo} years ago`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      {renderMedia(previousIndex, "previous", className)}
      {renderMedia(currentIndex, "current", className)}
      {renderMedia(nextIndex, "next", className)}
    </div>
  );
};

export default React.memo(MediaFader);
