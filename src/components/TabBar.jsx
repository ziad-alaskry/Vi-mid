"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

const tabs = [
  { href: "/visits", label: "Visits", icon: "calendar" },
  { href: "/new-visit", label: "New visit", icon: "plus", center: true },
  { href: "/library", label: "Library", icon: "book" },
  { href: "/profile", label: "Profile", icon: "user" },
];

export default function TabBar() {
  const path = usePathname();
  const router = useRouter();

  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-hairline" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="grid grid-cols-4 h-[62px]">
        {tabs.map((t) => {
          const active = path === t.href || path.startsWith(t.href + "/");
          if (t.center) {
            return (
              <li key={t.href} className="relative">
                <button
                  onClick={() => router.push(t.href)}
                  aria-label={t.label}
                  className="absolute left-1/2 -translate-x-1/2 -top-5 grid place-items-center w-14 h-14 rounded-full bg-green-primary text-white shadow-soft active:scale-95 transition"
                >
                  <Icon name="plus" size={26} strokeWidth={2} />
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-2 text-[11px] text-ink-soft">{t.label}</span>
              </li>
            );
          }
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex flex-col items-center justify-center gap-1 h-full text-[11px] ${
                  active ? "text-green-primary" : "text-ink-soft"
                }`}
              >
                <Icon name={t.icon} size={22} strokeWidth={active ? 2 : 1.7} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
