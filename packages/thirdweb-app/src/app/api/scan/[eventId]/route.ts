import { NextResponse } from "next/server";

// This is a temporary in-memory store. In a real application, this should be stored in a database
const scanCounts = new Map<string, number>();

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const eventId = params.eventId;
  // Get current count or initialize to 0
  const currentCount = scanCounts.get(eventId) || 0;

  // Increment count
  scanCounts.set(eventId, currentCount + 1);

  return NextResponse.json({
    success: true,
    eventId,
    scanCount: currentCount + 1,
  });
}
