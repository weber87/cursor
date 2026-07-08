"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, TrendingUp, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Today", icon: Home },
  { href: "/log", label: "Log", icon: PlusCircle },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 2}
                className={active ? "text-primary" : ""}
              />
              <span className={`text-[10px] font-medium ${active ? "text-primary" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
