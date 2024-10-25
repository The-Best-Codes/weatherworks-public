import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { deleteOldCacheFiles, updateCacheMetadata } from "@/utils/cache/images";

// Cache directory in the project directory
const CACHE_DIR = path.join(process.cwd(), "database/cache/images");

// Ensure cache directory exists
fs.mkdir(CACHE_DIR, { recursive: true }).catch(console.error);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imagePath = searchParams.get("path");
  const width = searchParams.get("w")
    ? parseInt(searchParams.get("w")!)
    : undefined;
  const height = searchParams.get("h")
    ? parseInt(searchParams.get("h")!)
    : undefined;
  const quality = searchParams.get("q") ? parseInt(searchParams.get("q")!) : 80;
  const isRelative = searchParams.get("relative") === "true";

  if (!imagePath) {
    return NextResponse.json(
      { error: "Image path is required" },
      { status: 400 }
    );
  }

  // Create a unique cache key based on the URL parameters
  const cacheKey = crypto
    .createHash("md5")
    .update(JSON.stringify({ imagePath, width, height, quality, isRelative }))
    .digest("hex");
  const cachedFilePath = path.join(CACHE_DIR, `${cacheKey}.webp`);

  try {
    // Delete old cache files, older than one week
    await deleteOldCacheFiles(CACHE_DIR, 7);

    // Check if the cached file exists
    try {
      await fs.access(cachedFilePath);
      // If the file exists, serve it from cache
      const imageBuffer = await fs.readFile(cachedFilePath);
      await updateCacheMetadata(cacheKey);
      return serveImage(imageBuffer, "webp");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // File doesn't exist in cache, proceed with processing
    }

    const fullPath = isRelative
      ? path.join(process.cwd(), imagePath)
      : imagePath;

    const imageBuffer = await fs.readFile(fullPath);
    let sharpInstance = sharp(imageBuffer);

    // Get image metadata
    const metadata = await sharpInstance.metadata();

    // Calculate dimensions
    let resizeOptions: sharp.ResizeOptions = {};
    if (width && !height) {
      resizeOptions.width = width;
      resizeOptions.height = Math.round(
        (width / metadata.width!) * metadata.height!
      );
    } else if (height && !width) {
      resizeOptions.height = height;
      resizeOptions.width = Math.round(
        (height / metadata.height!) * metadata.width!
      );
    } else if (width && height) {
      resizeOptions = { width, height };
    }

    // Resize image if needed
    if (Object.keys(resizeOptions).length > 0) {
      sharpInstance = sharpInstance.resize(resizeOptions);
    }

    // Compress and convert image to WebP
    const outputBuffer = await sharpInstance.webp({ quality }).toBuffer();

    // Save to cache
    await fs.writeFile(cachedFilePath, outputBuffer);
    await updateCacheMetadata(cacheKey);

    return serveImage(outputBuffer, "webp");
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Error processing image" },
      { status: 500 }
    );
  }
}

function serveImage(imageBuffer: Buffer, format: string): NextResponse {
  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": `image/${format}`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
