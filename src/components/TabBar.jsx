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
    <nav
      className="sticky bottom-0 z-30 bg-white border-t border-hairline
                 md:sticky md:top-0 md:h-full md:w-20 md:shrink-0 md:border-t-0 md:border-e md:py-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4 h-[62px] md:flex md:flex-col md:h-auto md:gap-1 md:px-2">
        {tabs.map((tab) => {
          const active = path === tab.href || path.startsWith(tab.href + "/");
          if (tab.center) {
            return (
              <li key={tab.href} className="relative md:static md:mb-2">
                <button
                  onClick={() => router.push(tab.href)}
                  aria-label={tab.label}
                  className="absolute start-1/2 -translate-x-1/2 -top-5 grid place-items-center w-14 h-14 rounded-full bg-green-primary text-white shadow-soft active:scale-95 transition
                             md:static md:translate-x-0 md:mx-auto md:w-12 md:h-12"
                >
                  <Icon name="plus" size={26} strokeWidth={2} />
                </button>
                <span
                  className="absolute start-1/2 -translate-x-1/2 bottom-2 text-[11px] text-ink-soft whitespace-nowrap
                             md:static md:translate-x-0 md:block md:text-center md:mt-1 md:whitespace-normal md:leading-tight"
                >
                  {tab.label}
                </span>
              </li>
            );
          }
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-1 h-full text-[11px]
                            md:h-auto md:py-2.5 md:rounded-lg md:transition ${
                  active ? "text-green-primary md:bg-green-tint" : "text-ink-soft md:hover:bg-surface"
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
