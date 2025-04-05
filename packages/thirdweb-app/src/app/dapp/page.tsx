"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiOutlineSwap } from "react-icons/ai";

export default function Dapp() {
  const [selectedTab, setSelectedTab] = useState("home");
  const [isEventCreator, setIsEventCreator] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for activities
  const activities = isEventCreator ? [
    {
      id: "create",
      title: "Create Event",
      subtitle: "CREATE NEW EVENT",
      image: "/dapp/story-bg1.png",
      color: "bg-green-700"
    },
    {
      id: "manage",
      title: "Manage Event",
      subtitle: "MANAGE EXISTING EVENTS",
      image: "/dapp/event-bg.png",
      color: "bg-red-700"
    }
  ] : [
    {
      id: "event",
      title: "Event",
      subtitle: "Find Events",
      image: "/dapp/event-bg.png",
      color: "bg-amber-700"
    },
    {
      id: "battle",
      title: "Battle",
      subtitle: "PVP Arena",
      image: "/dapp/battle-bg.png",
      color: "bg-blue-700"
    },
    {
      id: "quest",
      title: "Quests",
      subtitle: "DAILY MISSIONS",
      image: "/dapp/quest-bg.png",
      color: "bg-purple-700"
    }
  ];

  // Main dapp content
  return (
    <div className="min-h-screen w-full bg-[url('/dapp/dapp-bg.png')] bg-cover bg-right text-white">
      {/* Main Content Area */}
      <div className="flex justify-between h-[calc(100vh-5rem)] p-6">
        {/* Left Sidebar - Character Info */}
        <div className="w-1/4 bg-black/40 backdrop-blur-sm rounded-xl p-4 flex flex-col">
          {/* Character Profile */}
          <div className="flex items-center gap-4 border-b border-gray-600 pb-4 px-5">
            <div className="relative">
              <Image 
                src="/profile.png" 
                alt="Player Avatar" 
                width={100} 
                height={100} 
                className="rounded-full border-2 border-yellow-500"
              />
            </div>
            
            <div className="flex flex-col w-full">
              <h2 className="text-2xl font-bold font-dark-mystic">
                0x1234...5678
              </h2>
              <p className="text-gray-300 text-sm">ID: 0x12345678</p>
            </div>

            <div className="flex flex-col items-center">
              <button 
                onClick={() => setIsEventCreator(!isEventCreator)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <AiOutlineSwap className="text-white text-3xl" />
              </button>
              <span className="text-sm text-gray-300">
                {isEventCreator ? "Event Creator" : "User"}
              </span>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex flex-col gap-2 mt-6 font-dark-mystic text-2xl">
            <button 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedTab === 'home' ? 'bg-purple-800' : 'hover:bg-gray-800'}`}
              onClick={() => setSelectedTab('home')}
            >
              <span className="font-medium">Home</span>
            </button>
            
            <button 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedTab === 'beasts' ? 'bg-purple-800' : 'hover:bg-gray-800'}`}
              onClick={() => setSelectedTab('beasts')}
            >
              <span className="font-medium">My Beasts</span>
            </button>
            
            <button 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedTab === 'shop' ? 'bg-purple-800' : 'hover:bg-gray-800'}`}
              onClick={() => setSelectedTab('shop')}
            >
              <span className="font-medium">Marketplace</span>
            </button>
            
            <button 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedTab === 'friends' ? 'bg-purple-800' : 'hover:bg-gray-800'}`}
              onClick={() => setSelectedTab('friends')}
            >
              <span className="font-medium">Friends</span>
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 ml-6">
          {/* Activities Grid */}
          <div className="flex flex-col justify-center items-end gap-6 h-[calc(100vh-10rem)]">
            {activities.map(activity => (
              <div
                key={activity.id}
                className={`relative overflow-hidden rounded-xl ${activity.color} group cursor-pointer w-1/2 h-72`}
              >
                <Image
                  src={activity.image}
                  alt={activity.title}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold mb-2 font-dark-mystic">{activity.title}</h3>
                  <p className="text-gray-300">{activity.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}