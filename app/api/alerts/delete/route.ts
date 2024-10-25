import { NextRequest, NextResponse } from "next/server";
import { deleteAlert } from "@/utils/alerts/database";

export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const alertId = body.id;
    await deleteAlert(alertId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
