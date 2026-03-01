"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import ChatDrawer from "@/components/chat/ChatDrawer";

const authRoutes = ["/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = authRoutes.includes(pathname);

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 mesh-gradient min-h-screen">
          <Navbar />
          <main className="max-w-7xl mx-auto px-6 md:px-12 py-8">{children}</main>
        </div>
      </div>
      <ChatDrawer />
    </>
  );
}
