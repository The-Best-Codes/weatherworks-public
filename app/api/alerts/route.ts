import { NextResponse } from "next/server";
import { listAllAlerts, handleExpiredAlerts } from "@/utils/alerts/database";

interface Alert {
  id: string;
  timestamp: number;
  directDelete: boolean;
  expires: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  alertData: any;
}

export const revalidate = 0;

export async function GET() {
  try {
    await handleExpiredAlerts();

    let alerts = (await listAllAlerts()) as Alert[];

    alerts = alerts.map((alert: Alert) => ({
      id: alert.id,
      timestamp: alert.timestamp,
      directDelete: alert.directDelete,
      expires: alert.expires,
      alertData: alert.alertData,
    }));

    alerts = alerts.reverse();

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
