"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FileText, TrendingUp, Layers, Settings } from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",             icon: Home,       label: "首頁" },
  { href: "/checkin",      icon: FileText,   label: "紀錄" },
  { href: "/insights",     icon: TrendingUp, label: "分析" },
  { href: "/stack",        icon: Layers,     label: "營養品" },
  { href: "/settings",     icon: Settings,   label: "設定" },
];

export function BottomNav() {
  const pathname = usePathname();

  const hiddenPaths = ["/auth", "/landing", "/onboarding", "/login"];
  if (hiddenPaths.some((p) => pathname?.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur-xl safe-area-pb">
      <div className="mx-auto max-w-2xl flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex flex-col items-center gap-1 px-4 py-2.5 transition-colors
                ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active-bg"
                  className="absolute inset-0 border-t-2 border-foreground"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="relative z-10 text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
