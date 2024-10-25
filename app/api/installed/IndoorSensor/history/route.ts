import { NextResponse } from "next/server";
import { getHistory } from "@/utils/installed/IndoorSensor/database";

export async function GET() {
  try {
    const data = await getHistory();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching history indoor data:", error);
    return NextResponse.json(
      { error: "Failed to fetch history indoor data" },
      { status: 500 }
    );
  }
}
