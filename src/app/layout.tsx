import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const montserrat = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bandwagmag.com"),
  title: "Concert Map: Live Music in Colorado & Wyoming | BandWagon Magazine",
  description:
    "Interactive map of upcoming concerts across 60+ venues in Colorado and Wyoming. From Red Rocks to Lost Lake Lounge, find live music near you.",
  openGraph: {
    type: "website",
    siteName: "BandWagon Magazine",
    title: "Concert Map: Live Music in Colorado & Wyoming",
    description:
      "Interactive map of upcoming concerts across 60+ venues in Colorado and Wyoming.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="h-full bg-black text-white">{children}</body>
    </html>
  );
}
