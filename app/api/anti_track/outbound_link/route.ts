import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing URL parameter" },
      { status: 400 }
    );
  }

  try {
    new URL(url);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid URL", message: error },
      { status: 400 }
    );
  }

  // Create an HTML page with a meta refresh to redirect
  const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="refresh" content="0; url=${url}">
        <title>Redirecting...</title>
      </head>
      <body>
        <p>Redirecting to external site...</p>
        <br>
        <a href="${url}">${url}</a>
        <br>
        <p>If you are not redirected automatically, please click the link above.</p>
        <legend><span>This page prevents websites from tracking you by removing the referrer and caching headers.</span></legend>
      </body>
      </html>
    `;

  // Create the response with the HTML content
  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  return response;
}
