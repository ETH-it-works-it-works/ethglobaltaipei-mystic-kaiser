"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useThirdWeb } from "@/hooks/useThirdWeb";
import { motion } from "framer-motion";
import Navigation from "@/components/landing-page/Navigation";
// Mock data for friend connections
const friendData = [
  {
    id: 1,
    address: "0x1234...5678",
    name: "Crypto Explorer",
    avatar: "/profile.png",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    address: "0xabcd...ef01",
    name: "NFT Hunter",
    avatar: "/profile.png",
    timestamp: "1 day ago",
  },
  {
    id: 3,
    address: "0x9876...5432",
    name: "Blockchain Wizard",
    avatar: "/profile.png",
    timestamp: "3 days ago",
  },
  {
    id: 4,
    address: "0xdefa...1234",
    name: "GameFi Pro",
    avatar: "/profile.png",
    timestamp: "1 week ago",
  },
];

// Milestone achievements data
const milestoneData = [
  {
    id: 1,
    title: "First Connection",
    description: "Connect with your first friend",
    requirement: 1,
    reward: "10 MK Tokens",
    image: "/dapp/quest-bg.png",
    completed: true,
  },
  {
    id: 2,
    title: "Social Butterfly",
    description: "Connect with 5 friends",
    requirement: 5,
    reward: "50 MK Tokens",
    image: "/dapp/battle-bg.png",
    completed: false,
  },
  {
    id: 3,
    title: "Community Builder",
    description: "Connect with 20 friends",
    requirement: 20,
    reward: "200 MK Tokens",
    image: "/dapp/event-bg.png",
    completed: false,
  },
  {
    id: 4,
    title: "Mystic Network",
    description: "Connect with 50 friends",
    requirement: 50,
    reward: "500 MK Tokens + Exclusive NFT",
    image: "/dapp/story-bg1.png",
    completed: false,
  },
];

export default function MilestonesPage() {
  const { account } = useThirdWeb();
  const [friendCount, setFriendCount] = useState(friendData.length);
  const [activeTab, setActiveTab] = useState("milestones");

  return (
    <div className="min-h-screen w-full bg-[url('/dapp/dapp-bg.png')] bg-cover bg-center text-white">
      {/* Main Content Area */}
      <div className="hidden">
            <Navigation />
        </div>
      <div className="container mx-auto pt-28 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Stats & Latest Friends */}
          <div className="w-full md:w-1/3">
            {/* User Stats Card */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 mb-8">
              <h2 className="text-3xl font-bold mb-4 font-dark-mystic">Friend Network</h2>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image 
                      src="/profile.png" 
                      alt="Player Avatar" 
                      width={60} 
                      height={60} 
                      className="rounded-full border-2 border-yellow-500"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
                    </h3>
                    <p className="text-purple-300">Mystic Explorer</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="bg-purple-900/50 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-lg">Total Friends</span>
                  <span className="text-2xl font-bold">{friendCount}</span>
                </div>
                
                <div className="bg-purple-900/50 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-lg">Milestones Achieved</span>
                  <span className="text-2xl font-bold">{milestoneData.filter(m => m.completed).length}/{milestoneData.length}</span>
                </div>
                
                <div className="bg-purple-900/50 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-lg">Rewards Earned</span>
                  <span className="text-2xl font-bold">260 MK</span>
                </div>
              </div>
            </div>
            
            {/* Recent Friends Card */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 font-dark-mystic">Recent Connections</h2>
              
              <div className="flex flex-col gap-4">
                {friendData.map((friend) => (
                  <motion.div 
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-purple-900/30 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Image 
                        src={friend.avatar} 
                        alt={friend.name} 
                        width={40} 
                        height={40} 
                        className="rounded-full border border-purple-500"
                      />
                      <div>
                        <p className="font-semibold">{friend.name}</p>
                        <p className="text-sm text-gray-300">{friend.address}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{friend.timestamp}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right column - Milestones */}
          <div className="w-full md:w-2/3">
            {/* Tab Navigation */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 mb-6">
              <div className="flex gap-4">
                <button 
                  className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors ${activeTab === 'milestones' ? 'bg-purple-800' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                  onClick={() => setActiveTab('milestones')}
                >
                  Milestones
                </button>
                <button 
                  className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors ${activeTab === 'leaderboard' ? 'bg-purple-800' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}
                  onClick={() => setActiveTab('leaderboard')}
                >
                  Leaderboard
                </button>
              </div>
            </div>
            
            {/* Milestones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {milestoneData.map((milestone) => (
                <motion.div 
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`relative overflow-hidden rounded-xl h-64 group ${milestone.completed ? 'border-2 border-yellow-500' : 'border border-gray-700'}`}
                >
                  <Image
                    src={milestone.image}
                    alt={milestone.title}
                    width={500}
                    height={300}
                    className="h-full w-full object-cover brightness-50 group-hover:brightness-75 transition-all duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 flex flex-col justify-end p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-2xl font-bold font-dark-mystic">{milestone.title}</h3>
                      {milestone.completed && (
                        <div className="bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full">
                          COMPLETED
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-300 mb-2">{milestone.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="bg-purple-900/70 rounded-full px-3 py-1 text-sm">
                        {friendCount}/{milestone.requirement} Friends
                      </div>
                      <div className="text-yellow-400 font-medium">
                        Reward: {milestone.reward}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (friendCount/milestone.requirement) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
