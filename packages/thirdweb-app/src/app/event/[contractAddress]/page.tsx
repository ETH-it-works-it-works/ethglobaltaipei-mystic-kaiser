"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import Image from "next/image";
import Link from "next/link";
import useMultiBaasWithThirdweb from "@/hooks/useMultiBaas";
import { Event, EventField } from "@curvegrid/multibaas-sdk";

interface EventData {
  eventId: string | undefined;
  name: string | undefined;
  description: string | undefined;
  startDate: string | undefined;
  organizer: string | undefined;
  eventContract: string | undefined;
}

export default function ContractAddressPage() {
  const { contractAddress } = useParams();
  const [supabase] = useState(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  // State for events and pagination
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(false);


  if (loading) {
    return <p className="text-white text-center">Loading Events...</p>;
  }

  return (
    <div className="min-h-screen flex items-center flex-col justify-center p-6">
      {eventData ? (
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">{eventData.name}</h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-gray-600">{eventData.description}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Start Date</h2>
              <p className="text-gray-600">{eventData.startDate}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Organizer</h2>
              <p className="text-gray-600">{eventData.organizer}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Event Contract</h2>
              <Link
                href={`https://alfajores.celoscan.io/address/${eventData.eventContract}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
              >
                {eventData.eventContract}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-white text-center">No event data found.</p>
      )}
    </div>
  );
}
