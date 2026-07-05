"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Icon } from "@/components/icons";

export default function TabBar() {
  const t = useTranslations("nav");
  const path = usePathname();
  const router = useRouter();

  const tabs = [
    { href: "/visits", label: t("visits"), icon: "calendar" },
    { href: "/new-visit", label: t("newVisit"), icon: "plus", center: true },
    { href: "/library", label: t("library"), icon: "book" },
    { href: "/profile", label: t("profile"), icon: "user" },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-hairline" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="grid grid-cols-4 h-[62px]">
        {tabs.map((tab) => {
          const active = path === tab.href || path.startsWith(tab.href + "/");
          if (tab.center) {
            return (
              <li key={tab.href} className="relative">
                <button
                  onClick={() => router.push(tab.href)}
                  aria-label={tab.label}
                  className="absolute start-1/2 -translate-x-1/2 -top-5 grid place-items-center w-14 h-14 rounded-full bg-green-primary text-white shadow-soft active:scale-95 transition"
                >
                  <Icon name="plus" size={26} strokeWidth={2} />
                </button>
                <span className="absolute start-1/2 -translate-x-1/2 bottom-2 text-[11px] text-ink-soft">{tab.label}</span>
              </li>
            );
          }
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-1 h-full text-[11px] ${
                  active ? "text-green-primary" : "text-ink-soft"
                }`}
              >
                <Icon name={tab.icon} size={22} strokeWidth={active ? 2 : 1.7} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
