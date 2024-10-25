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
    const rImgUrl = randomImage.largeImageURL;

    return NextResponse.json({ url: rImgUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while fetching the image" },
      { status: 500 }
    );
  }
}
