import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/vitrion/bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vitrion — AI 個人化營養管家",
  description:
    "透過 RPG 遊戲化介面，追蹤你的補給品攝取並視覺化身體狀態變化。你的專屬營養冒險從這裡開始。",
  keywords: ["nutrition", "supplements", "health", "gamification", "RPG", "biometrics"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vitrion",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans">
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              {children}
              <BottomNav />
              <PwaInstallPrompt />
              <Toaster position="top-center" richColors />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
