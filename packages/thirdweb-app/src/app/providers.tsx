"use client";

import { ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/custom/navbar";
import { NFTProvider } from "@/contexts/NFTContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      <NFTProvider>
        <Navbar />
        {children}
        <Toaster />
      </NFTProvider>
    </ThirdwebProvider>
  );
}
