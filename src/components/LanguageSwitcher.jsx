"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher({ className = "" }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const other = locale === "ar" ? "en" : "ar";

  return (
    <button
      onClick={() => router.replace(pathname, { locale: other })}
      className={`inline-flex items-center justify-center h-9 px-3 rounded-lg border border-hairline text-sm font-medium text-ink-soft hover:bg-surface transition ${className}`}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {locale === "ar" ? "EN" : "ع"}
    </button>
  );
}
