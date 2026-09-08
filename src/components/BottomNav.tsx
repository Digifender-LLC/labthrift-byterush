"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, LayoutGrid, User } from "lucide-react";
import { bootstrapAuth } from "@/lib/authClient";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Feed", icon: Flame },
  { href: "/topics", label: "Topics", icon: LayoutGrid },
  { href: "/profile", label: "You", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  // The nav is on every screen, so it doubles as the one-time session check.
  useEffect(() => {
    bootstrapAuth();
  }, []);
  return (
    <nav className="absolute bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn("size-5 transition-transform", active && "scale-110")}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
