"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { CalendarIcon, MapPinIcon, UsersIcon, GiftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventId() {
  const { id } = useParams();

  // Mock data for demonstration
  const eventData = {
    id: "1",
    name: "ETHGlobal Taipei Hackathon",
    description:
      "Join us for an exciting blockchain hackathon where developers from around the world come together to build innovative solutions on Ethereum and related technologies.",
    location: "Taipei International Convention Center",
    participantLimit: 500,
    startDate: new Date("2024-03-21").getTime(),
    rewardCount: 10,
    baseUri:
      "ipfs://bafkreigqgsrf54dmwa6smykng3mef522e6ahorhgds7ofivza2pnjrpfv4",
  };

  return (
    <div className="flex flex-col justify-center items-center gap-y-10 max-w-4xl mx-auto mt-16 p-6">
      <h1 className="text-3xl font-bold mb-6">{eventData.name}</h1>

      <Image
        src={`https://ipfs.io/ipfs/${eventData.baseUri.replace("ipfs://", "")}`}
        alt="Event Image"
        className="w-full h-72 object-cover rounded-lg mb-4"
        width={300}
        height={300}
      />
      <div className="grid gap-6">
        {/* Description Card */}
        <Card>
          <CardHeader>
            <CardTitle>About the Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{eventData.description}</p>
          </CardContent>
        </Card>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <Card>
            <CardContent className="flex items-center p-4">
              <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-semibold">Location</p>
                <p className="text-gray-600">{eventData.location}</p>
              </div>
            </CardContent>
          </Card>

          {/* Date */}
          <Card>
            <CardContent className="flex items-center p-4">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-semibold">Start Date</p>
                <p className="text-gray-600">
                  {new Date(eventData.startDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Participant Limit */}
          <Card>
            <CardContent className="flex items-center p-4">
              <UsersIcon className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-semibold">Participant Limit</p>
                <p className="text-gray-600">
                  {eventData.participantLimit} attendees
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card>
            <CardContent className="flex items-center p-4">
              <GiftIcon className="h-5 w-5 mr-2 text-gray-500" />
              <div>
                <p className="font-semibold">Rewards</p>
                <p className="text-gray-600">
                  {eventData.rewardCount} rewards available
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Button className="w-1/3 h-16 text-2xl font-semibold ">Join event</Button>
    </div>
  );
}
