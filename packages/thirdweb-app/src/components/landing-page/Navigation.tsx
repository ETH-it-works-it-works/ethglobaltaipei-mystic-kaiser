"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navigation() {
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
          <Link href="/dapp" className="flex flex-row items-center gap-2 hover:scale-105 transition-all duration-300">
            <Image
              src="/landing-page/launch-left.png"
              alt="Mystic Kaizer Logo"
              width={80}
              height={50}
            />
            <div className="py-3 text-3xl">
              Launch
            </div>
            <Image
              src="/landing-page/launch-right.png"
              alt="Mystic Kaizer Logo"
              width={80}
              height={50}
            />
          </Link>
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center text-2xl text-white">
          <button>Connect Wallet</button>
        </div>
      </div>
    </nav>
  );
}