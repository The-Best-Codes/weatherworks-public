import { NextRequest, NextResponse } from "next/server";
import { parse } from "rss-to-json";
import { decode } from "html-entities";

// Helper function to decode HTML entities and strip HTML tags
function decodeAndStripHtml(text: string): string {
  if (!text) return "";
  const decoded = decode(text);
  return decoded.replace(/<[^>]*>?/gm, ""); // Strip HTML tags
}

interface UrlItem {
  link: string;
  name?: string;
}

interface NewsItem {
  title: string;
  description: string;
  link: string;
  published: string;
  source: string;
  imageUrl: string | null;
}

interface FeedItem {
  enclosures: { url: string; type: string }[];
  media: { thumbnail: { url: string } };
  title: string;
  description: string;
  published: string;
  link: string;
  "media:content": { url: string };
}

interface FeedData {
  title: string;
  items: FeedItem[];
}

export async function POST(req: NextRequest) {
  const { urls } = await req.json();

  if (!urls || !Array.isArray(urls)) {
    return NextResponse.json(
      { message: "Invalid input: urls must be an array" },
      { status: 400 }
    );
  }

  try {
    const feedPromises = urls.map(({ link }: UrlItem) =>
      parse(link).catch((error) => {
        console.error(`Error fetching RSS feed from ${link}:`, error);
        return null; // Return null for failed fetches
      })
    );

    const feeds = await Promise.all(feedPromises);

    const successfulFeeds = feeds
      .map((feed, index) => ({
        feed,
        name: urls[index].name,
      }))
      .filter(({ feed }) => feed !== null);

    const combinedItems: NewsItem[] = successfulFeeds.flatMap(
      ({ feed, name }: { feed: FeedData | null; name?: string }) => {
        if (feed === null) {
          return [];
        }
        return feed.items.map((item: FeedItem) => {
          let imageUrl = null;
          if (item.enclosures && item.enclosures.length > 0) {
            imageUrl = item.enclosures[0].url;
          } else if (item.media && item.media.thumbnail) {
            imageUrl = item.media.thumbnail.url;
          } else if (item["media:content"] && item["media:content"].url) {
            imageUrl = item["media:content"].url;
          } else {
            const imageEnclosure = item.enclosures.find(
              (e) => e.type && e.type.startsWith("image/")
            );
            if (imageEnclosure) {
              imageUrl = imageEnclosure.url;
            }
          }

          const title = decodeAndStripHtml(item.title).slice(0, 100);
          const description = decodeAndStripHtml(item.description).slice(
            0,
            255
          );

          return {
            title,
            description,
            link: item.link,
            published: item.published,
            source: name || feed.title,
            imageUrl,
          };
        });
      }
    );

    combinedItems.sort(
      (a, b) =>
        new Date(b.published).getTime() - new Date(a.published).getTime()
    );

    return NextResponse.json(combinedItems, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("Error processing RSS feeds:", error);
    return NextResponse.json(
      { message: "Error processing RSS feeds" },
      { status: 500 }
    );
  }
}
