import { NextResponse } from "next/server";
import ApiData from "@/config/ww_apiData.json";

export async function GET(request: Request) {
  const apiKey = ApiData.authData.pixabayApiKey;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "nature";
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
    query
  )}&image_type=photo&safesearch=true&per_page=200`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const randomImage = data.hits[Math.floor(Math.random() * data.hits.length)];
    const imageUrl = randomImage.largeImageURL;

    // Fetch the actual image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Determine the content type
    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while fetching the image" },
      { status: 500 }
    );
  }
}
