import { NextResponse } from "next/server";
import { getLatest } from "@/utils/installed/IndoorSensor/database";

export async function GET() {
  try {
    const data = await getLatest();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching latest indoor data:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest indoor data" },
      { status: 500 }
    );
  }
}
