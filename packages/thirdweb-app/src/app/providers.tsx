"use client";

import { ReactNode } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/custom/navbar";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      {/* <Navbar /> */}
      {children}
      <Toaster />
    </ThirdwebProvider>
  );
}
