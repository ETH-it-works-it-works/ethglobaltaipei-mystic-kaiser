import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const darkMystic = localFont({
  src: "../../public/font/darkmystic.otf",
  variable: "--font-dark-mystic",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Mystic Kaizer",
  description:
    "The unique pvp game where you fight your friends to become the best mystic in the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${darkMystic.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
