"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import NewsSources from "@/config/news_sources.json";
import { themes, ThemeClasses } from "@/utils/modules/defaultModuleThemes";
import {
  RefreshCcw,
  CheckCircle,
  CheckCheck,
  AlertCircle,
  SquareArrowOutUpRight,
} from "lucide-react";

// Helper function to decode HTML entities
const decodeHtmlEntities = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
};

interface CustomNewsModuleProps {
  theme:
    | "defaultLight"
    | "defaultDark"
    | "opaqueLight"
    | "opaqueDark"
    | "blurLight"
    | "blurDark";
  refreshInterval: number;
  showThumbnails?: boolean;
  showBadges?: boolean;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  badge: string;
  imageUrl: string;
  published: string;
  source: string;
  type: string;
  link: string;
}

const NewsContainer = ({
  theme,
  refreshInterval,
  showThumbnails = false,
  showBadges = false,
}: CustomNewsModuleProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshStatus, setRefreshStatus] = useState<
    "idle" | "success" | "new" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previousNewsRef = useRef<NewsItem[]>(news);

  const fetchNews = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null); // Reset error message before fetching
    try {
      const response = await fetch("/api/news/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls: NewsSources.sources,
        }),
        next: { revalidate: refreshInterval },
      });

      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }

      if (JSON.stringify(data) !== JSON.stringify(previousNewsRef.current)) {
        setRefreshStatus("new");
        setNews(data);
        previousNewsRef.current = data;
      } else {
        setRefreshStatus("success");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setErrorMessage(
        "We encountered an issue fetching the latest news. Please try again later."
      );
      setRefreshStatus("error");
    }
    setLoading(false);
    setIsRefreshing(false);

    // Reset status after 1 second
    setTimeout(() => {
      setRefreshStatus("idle");
    }, 1000);
  }, [refreshInterval]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    const interval = setInterval(fetchNews, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchNews, refreshInterval]);

  const themeClass: ThemeClasses = themes[theme];

  if (loading) {
    return (
      <Card
        className={`${themeClass.card} w-[350px] h-[450px] p-8 overflow-auto`}
      >
        <div className="flex flex-col gap-6">
          <Skeleton className={`${themeClass.skeleton} w-full h-64`} />
          <Skeleton className={`${themeClass.skeleton} w-full h-64`} />
          <Skeleton className={`${themeClass.skeleton} w-full h-64`} />
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card
        className={`w-[350px] h-[450px] p-8 overflow-auto ${themeClass.card}`}
      >
        <CardContent className="flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-center mt-4 text-red-500">{errorMessage}</p>
          <Button
            onClick={fetchNews}
            variant="default"
            className="mt-6"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              "Retry"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-[350px] h-[450px] relative ${themeClass.card}`}>
      <Button
        variant="default"
        size="icon"
        className={`absolute opacity-70 w-8 h-8 right-0 top-0 m-2 z-10 text-white`}
        onClick={fetchNews}
        aria-label="Refresh"
        disabled={isRefreshing || refreshStatus !== "idle"}
      >
        {isRefreshing ? (
          <RefreshCcw className="w-4 h-4 animate-spin" />
        ) : refreshStatus === "success" ? (
          <CheckCircle className="w-4 h-4" />
        ) : refreshStatus === "new" ? (
          <CheckCheck className="w-4 h-4" />
        ) : refreshStatus === "error" ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <RefreshCcw className="w-4 h-4" />
        )}
      </Button>
      <CardContent className="p-4 relative overflow-hidden pr-6 hover:overflow-auto hover:pr-4 max-h-full">
        {news.length > 0 &&
          news.map((item: NewsItem, index: number) => (
            <Card key={index} className={`${themeClass.card} mb-4`}>
              <CardHeader className="pb-2">
                <div className="flex flex-col">
                  {item.title && item.imageUrl && showThumbnails && (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full mb-2 rounded-lg object-cover"
                      width={300}
                      height={300}
                    />
                  )}
                  <Link
                    href={`/api/anti_track/outbound_link?url=${item.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span
                      className={`text-base inline-block group ${
                        theme.includes("Dark")
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    >
                      {decodeHtmlEntities(item.title)}{" "}
                      <SquareArrowOutUpRight className="hidden group-hover:inline w-4 h-4" />
                    </span>
                  </Link>
                  {showBadges && (
                    <Badge
                      variant={"outline"}
                      className={`w-fit mt-2 ${themeClass.text}`}
                    >
                      {item.source}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-sm ${themeClass.text}`}>
                  {decodeHtmlEntities(item.description)}
                </p>
              </CardContent>
            </Card>
          ))}
      </CardContent>
    </Card>
  );
};

export default React.memo(NewsContainer);
