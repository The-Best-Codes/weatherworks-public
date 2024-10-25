import { NextResponse } from "next/server";
import { addHistory } from "@/utils/installed/IndoorSensor/database";

export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sensorData = {
      ...body,
      timestamp: body.timestamp * 1000,
      received: Date.now(),
    };
    await addHistory(sensorData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving indoor data:", error);
    return NextResponse.json(
      { error: "Failed to save indoor data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
