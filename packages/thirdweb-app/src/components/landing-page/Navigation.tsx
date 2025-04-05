"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThirdWebConnectButton from "../ThirdWebConnectButton";
import LaunchButton from "../LaunchButton";
// import { useConnect, useDisconnect, useAddress } from "@thirdweb-dev/react";

export default function Navigation() {
//   const connect = useConnect();
//   const disconnect = useDisconnect();
//   const address = useAddress();
  const router = useRouter();

//   const handleConnect = async () => {
//     try {
//       await connect({
//         connector: "injected",
//       });
//     } catch (error) {
//       console.error("Failed to connect wallet:", error);
//     }
//   };

//   const handleDisconnect = async () => {
//     try {
//       await disconnect();
//     } catch (error) {
//       console.error("Failed to disconnect wallet:", error);
//     }
//   };

  return (
    <nav className="fixed w-full bg-transparent z-50 font-dark-mystic">
      <div className="mx-auto px-4 sm:px-12 h-24 flex items-center justify-center md:justify-between">
        <Link href="/">
          <Image
            src="/landing-page/white-title.svg"
            alt="Mystic Kaizer Logo"
            width={190}
            height={168}
          />
        </Link>
        <div className="hidden md:flex flex-row items-center gap-6 text-2xl text-white">
          <LaunchButton />
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center text-2xl text-white font-inter">
             <ThirdWebConnectButton />
        </div>
      </div>
    </nav>
  );
}