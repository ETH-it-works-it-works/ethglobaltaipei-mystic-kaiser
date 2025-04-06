"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import SelfQRcodeWrapper, { SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface VerifiedUser {
  name: string;
  timestamp: number;
}

export default function TestingPage() {
  const [showQR, setShowQR] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [verifiedUsers, setVerifiedUsers] = useState<VerifiedUser[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Generate a user ID when the component mounts
    setUserId(uuidv4());
    // Load verified users from session storage
    if (typeof window !== 'undefined') {
      const storedUsers = sessionStorage.getItem('verifiedUsers');
      if (storedUsers) {
        setVerifiedUsers(JSON.parse(storedUsers));
      }
    }
  }, []);

  if (!userId) return null;

  // Create the SelfApp configuration with name disclosure
  const selfApp = new SelfAppBuilder({
    appName: "Mystic Kaizer",
    scope: "mystic-kaizer",
    endpoint: "https://justanendpoint.vercel.app/api/verify",
    userId,
    disclosures: {
      name: true
    }
  }).build();

  const handleVerificationSuccess = () => {
    // Magic happens here @zhehong @sean
  };

  return (
    <main className="p-6 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-10">
        <h1 className="text-4xl font-extrabold mb-12 text-center text-gray-800">
          Verify yourself and mint your NFT!
        </h1>
        
        {/* Error Message */}
        {errorMessage && (
          <div className="text-center mb-4">
            <p className="text-lg text-red-600">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Current User Status */}
        {currentUserName && !errorMessage && (
          <div className="text-center mb-4">
            <p className="text-lg text-green-600">
              Welcome, {currentUserName}!
            </p>
          </div>
        )}

        {/* Verified Users List */}
        {verifiedUsers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-center">Verified Users</h2>
            <div className="max-h-40 overflow-y-auto">
              {verifiedUsers.map((user, index) => (
                <div key={index} className="text-center text-gray-600">
                  {user.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code Dialog */}
        <div className="flex justify-center">
          <Dialog open={showQR} onOpenChange={setShowQR}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setErrorMessage(null)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Verify with Self
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md flex flex-col items-center">
              <DialogHeader>
                <DialogTitle className="text-center">Scan QR Code to Verify</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center py-4">
                <SelfQRcodeWrapper
                  selfApp={selfApp}
                  onSuccess={handleVerificationSuccess}
                  size={350}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </main>
  );
}
