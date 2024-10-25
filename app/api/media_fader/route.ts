import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import exifr from "exifr";

export const revalidate = 0;

const mediaFaderConfig = {
  mediaPath: "$default",
  imageTypes: ["png", "jpg", "jpeg", "gif", "webp", "avif"],
  videoTypes: ["mp4", "mov", "mkv", "webm"],
};

async function getExifData(filePath: string) {
  try {
    const tags = await exifr.parse(filePath);
    return tags;
  } catch (error) {
    console.error(`Error parsing EXIF for ${filePath}:`, error);
    return null;
  }
}

function isTakenToday(exifData: { DateTimeOriginal: string }) {
  if (!exifData || !exifData.DateTimeOriginal) {
    return false;
  }

  const today = new Date();
  const takenDate = new Date(exifData.DateTimeOriginal);

  return (
    today.getMonth() === takenDate.getMonth() &&
    today.getDate() === takenDate.getDate()
  );
}

function takenYearsAgoCalc(exifData: { DateTimeOriginal: string }) {
  if (!exifData || !exifData.DateTimeOriginal) {
    return 0;
  }

  const today = new Date();
  const takenDate = new Date(exifData.DateTimeOriginal);

  return today.getFullYear() - takenDate.getFullYear();
}

export async function GET(request: NextRequest) {
  try {
    let mediaPath: string;
    if (mediaFaderConfig.mediaPath === "$default") {
      mediaPath = path.join(process.cwd(), "public", "media_fader");
    } else {
      mediaPath = mediaFaderConfig.mediaPath;
    }
    const files = await fs.readdir(mediaPath);
    const media = await Promise.all(
      files.map(async (file) => {
        const ext = path.extname(file).slice(1).toLowerCase();
        const filePath = path.join(mediaPath, file);
        let takenToday = false;
        let takenYearsAgo = 0;

        if (mediaFaderConfig.imageTypes.includes(ext)) {
          const exifData = await getExifData(filePath);
          takenToday = isTakenToday(exifData);
          takenYearsAgo = takenYearsAgoCalc(exifData);
        }

        const mediaType = mediaFaderConfig.imageTypes.includes(ext)
          ? "image"
          : mediaFaderConfig.videoTypes.includes(ext)
          ? "video"
          : "unknown";

        return {
          name: file,
          url:
            mediaFaderConfig.mediaPath === "$default"
              ? `/media_fader/${file}`
              : `${filePath}`,
          extension: ext,
          type: mediaType,
          takenToday: takenToday,
          takenYearsAgo: takenYearsAgo,
        };
      })
    );

    const filteredMedia = media.filter(
      (file) => file.url && file.type && file.type !== "unknown"
    );

    const url = new URL(request.url);
    const sortType = url.searchParams.get("sort");
    if (sortType === "random") {
      filteredMedia.sort(() => Math.random() - 0.5);
    } else if (sortType === "name") {
      filteredMedia.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "type") {
      filteredMedia.sort((a, b) => a.type.localeCompare(b.type));
    }

    return NextResponse.json({ media: filteredMedia });
  } catch (error) {
    console.error("Error listing media:", error);
    return NextResponse.json(
      { error: "Failed to list media" },
      { status: 500 }
    );
  }
}
