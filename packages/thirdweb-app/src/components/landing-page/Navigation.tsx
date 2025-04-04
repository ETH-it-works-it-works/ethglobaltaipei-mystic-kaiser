"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navigation() {
  // Define a consistent width for all navigation items
  const navItemClass = "w-40 text-center flex justify-center items-center";

  // Hard-coded navigation data
  const navigationLinks = [
    { label: "About", href: "about" },
    { label: "Communities", href: "communities" },
    { label: "Launch", href: "dapp" },
    { label: "Marketplace", href: "marketplace" },
    { label: "Mint", href: "mint" }
  ];

  const renderNavLink = (link: any) => {
    if (link.label === "Launch") {
      return (
        <Link href="/dapp" key={link.label} className="flex flex-row items-center gap-2 hover:scale-105 transition-all duration-300">
          <Image
            src="/landing-page/launch-left.png"
            alt="Mystic Kaizer Logo"
            width={80}
            height={50}
          />
          <div className="py-3 text-3xl">
            {link.label}
          </div>
          <Image
            src="/landing-page/launch-right.png"
            alt="Mystic Kaizer Logo"
            width={80}
            height={50}
          />
        </Link>
      );
    }

    return (
      <div key={link.label} className={`group ${navItemClass}`}>
        <a
          href={link.href}
          className="pointer-events-auto cursor-pointer px-4 py-2 z-[100] flex items-center justify-center rounded-md w-full text-white group-hover:bg-black/10 group-hover:backdrop-blur-md"
        >
          {link.label}
        </a>
      </div>
    );
  };

  return (
    <nav className="fixed w-full bg-transparent z-50 font-dark-mystic">
      <div className="mx-auto px-4 sm:px-12 h-24 flex items-center justify-center md:justify-between">
        <Link href="/">
          <Image
            src="/white-title.svg"
            alt="Mystic Kaizer Logo"
            width={190}
            height={168}
          />
        </Link>
        <div className="hidden md:flex flex-row items-center gap-6 text-2xl text-white">
          {navigationLinks.map(renderNavLink)}
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center text-2xl">
          <button>Connect Wallet</button>
        </div>
      </div>
    </nav>
  );
}