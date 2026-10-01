import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import AssistantChat from "@/components/AssistantChat";
import Footer from "@/components/SiteFooter";
import Nav from "@/components/MainNav";
import { ToastProvider } from "@/components/ToastSystem";
import TravelBackdrop from "@/components/TravelBackdrop";

export const metadata: Metadata = {
  title: "Wanderly — AI Travel Planner",
  description:
    "Explore the world, plan smarter with AI. Personalized itineraries, budget estimates, interactive maps, packing lists and a friendly AI travel assistant.",
};

export const viewport: Viewport = {
  themeColor: "#04060f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("lo.theme")==="light"){document.documentElement.dataset.theme="light";}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans text-ink antialiased">
        <TravelBackdrop />
        <Nav />
        <ToastProvider>{children}</ToastProvider>
        <AssistantChat />
        <Footer />
      </body>
    </html>
  );
}
