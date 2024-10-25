"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface PageFullBackgroundProps {
  refreshInterval?: number;
  enableMask?: boolean;
}

const PageFullBackground = ({
  refreshInterval = 3600000,
  enableMask = false,
}: PageFullBackgroundProps) => {
  const [imageUrl, setImageUrl] = useState<string>(
    "/image/page_bg/default.webp"
  );

  const fetchImage = async () => {
    try {
      const response = await fetch(`/api/random_image/pixabay?t=${Date.now()}`);
      const data = await response.json();
      setImageUrl(data.url);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  useEffect(() => {
    fetchImage();
    const interval = setInterval(fetchImage, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className={"fixed -z-20 top-0 left-0 w-full h-full"}>
      <div className="w-full h-full relative">
        {enableMask ? (
          <div className="w-full h-full bg-black opacity-50"></div>
        ) : null}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="background"
            className="w-full h-full object-cover absolute -z-10"
            crossOrigin="anonymous"
            fill
          />
        )}
      </div>
    </div>
  );
};

export default PageFullBackground;
