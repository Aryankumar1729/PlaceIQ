import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ChatDrawer from "@/components/chat/ChatDrawer";
import { ThemeProvider } from "@/components/providers/ThemeContext";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlaceIQ — Campus Placement Intelligence",
  description:
    "Real placement data, company-specific PYQs, and AI-powered interview prep for Indian college students.",
  keywords: ["placement", "internship", "campus", "TCS", "Infosys", "interview prep", "PYQ"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        <ThemeProvider>
          <div className="fixed inset-0 bg-hero-glow pointer-events-none z-0" />
          <Navbar />
          <div className="flex min-h-[calc(100vh-65px)] relative z-10">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
          <ChatDrawer />
        </ThemeProvider>
      </body>
    </html>
  );
}
