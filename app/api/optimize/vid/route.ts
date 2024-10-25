import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { updateCacheMetadata, deleteOldCacheFiles } from "@/utils/cache/videos";

// Cache directory in the project directory
const CACHE_DIR = path.join(process.cwd(), "database/cache/videos");

// Ensure cache directory exists
fs.mkdir(CACHE_DIR, { recursive: true }).catch(console.error);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoPath = searchParams.get("path");
  const width = searchParams.get("w")
    ? parseInt(searchParams.get("w")!)
    : undefined;
  const height = searchParams.get("h")
    ? parseInt(searchParams.get("h")!)
    : undefined;
  const quality = searchParams.get("q") ? parseInt(searchParams.get("q")!) : 23; // CRF value for H.264
  const isRelative = searchParams.get("relative") === "true";
  const duration = searchParams.get("duration")
    ? parseInt(searchParams.get("duration")!)
    : undefined;

  if (!videoPath) {
    return NextResponse.json(
      { error: "Video path is required" },
      { status: 400 }
    );
  }

  // Create a unique cache key based on the URL parameters
  const cacheKey = crypto
    .createHash("md5")
    .update(
      JSON.stringify({
        videoPath,
        width,
        height,
        quality,
        isRelative,
        duration,
      })
    )
    .digest("hex");
  const cachedFilePath = path.join(CACHE_DIR, `${cacheKey}.mp4`);

  try {
    // Delete old cache files older than one week
    await deleteOldCacheFiles(CACHE_DIR, 7);

    // Check if the cached file exists
    try {
      await fs.access(cachedFilePath);
      // If the file exists, serve it from cache
      const videoBuffer = await fs.readFile(cachedFilePath);
      await updateCacheMetadata(cacheKey);
      return serveVideo(videoBuffer);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // File doesn't exist in cache, proceed with processing
    }

    const fullPath = isRelative
      ? path.join(process.cwd(), videoPath)
      : videoPath;

    // Create FFmpeg command
    const command = ffmpeg(fullPath);

    // Set video size if specified
    if (width || height) {
      command.size(`${width || "?"}x${height || "?"}`);
    }

    // Set duration if specified
    if (duration) {
      command.duration(duration / 1000); // Convert ms to seconds
    }

    // Set quality (CRF)
    command.outputOptions([
      `-crf ${quality}`,
      "-preset ultrafast",
      "-tune fastdecode",
      "-movflags +faststart",
      "-c:a copy",
      "-threads 0",
    ]);

    // Set output format
    command.format("mp4");

    // Create a temporary file path for processing
    const tempFilePath = path.join(CACHE_DIR, `temp_${cacheKey}.mp4`);

    // Process the video
    await new Promise((resolve, reject) => {
      command.output(tempFilePath).on("end", resolve).on("error", reject).run();
    });

    // Read the processed video file
    const videoBuffer = await fs.readFile(tempFilePath);

    // If processing was successful, move the temp file to the cache
    await fs.rename(tempFilePath, cachedFilePath);
    await updateCacheMetadata(cacheKey);

    return serveVideo(videoBuffer);
  } catch (error) {
    console.error("Error processing video:", error);
    // If there was an error, ensure any temporary file is deleted
    const tempFilePath = path.join(CACHE_DIR, `temp_${cacheKey}.mp4`);
    await fs.unlink(tempFilePath).catch(() => {}); // Ignore errors if file doesn't exist
    return NextResponse.json(
      { error: "Error processing video" },
      { status: 500 }
    );
  }
}

function serveVideo(videoBuffer: Buffer): NextResponse {
  // Create a ReadableStream from the buffer
  const readableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(videoBuffer);
      controller.close();
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
