import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ChatDrawer from "@/components/chat/ChatDrawer";
import { ThemeProvider } from "@/components/providers/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
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
    <html lang="en" className={`dark ${inter.variable} ${jakarta.variable}`}>
      <body className="bg-background-dark text-slate-100 antialiased min-h-screen">
        <ThemeProvider>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 mesh-gradient min-h-screen">
              <Navbar />
              <main className="max-w-7xl mx-auto px-6 md:px-12 py-8">{children}</main>
            </div>
          </div>
          <ChatDrawer />
        </ThemeProvider>
      </body>
    </html>
  );
}
