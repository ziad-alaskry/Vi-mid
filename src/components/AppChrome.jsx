"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useStore } from "@/lib/store";
import TabBar from "@/components/TabBar";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AppChrome({ children }) {
  const t = useTranslations("common");
  const { ready, currentUser, isAdmin } = useStore();
  const path = usePathname();
  const router = useRouter();

  const isLogin = path === "/";
  const isCall = path.startsWith("/call/");
  const isAdminArea = path.startsWith("/admin");
  const showTabs = !isLogin && !isCall;

  useEffect(() => {
    if (!ready) return;
    if (!currentUser && !isLogin) { router.replace("/"); return; }
    if (!currentUser) return;
    // Admin has no bookings/availability/library — confine it to its own area;
    // everyone else is confined away from the admin area.
    if (isAdmin && !isAdminArea && !path.startsWith("/profile")) router.replace("/admin");
    if (!isAdmin && isAdminArea) router.replace("/visits");
  }, [ready, currentUser, isAdmin, isLogin, isAdminArea, path, router]);

  if (!ready) {
    return (
      <div className="app-frame grid place-items-center">
        <div className="text-ink-soft text-sm">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="app-frame flex flex-col md:flex-row">
      {/* fixed, present on every screen (including login/call, which have no
          per-page Header) — main reserves matching top padding below */}
      <div className="fixed top-0 start-0 end-0 max-w-app mx-auto md:max-w-[960px] z-30 flex justify-end px-3 py-2 pointer-events-none">
        <div className="pointer-events-auto">
          <LanguageSwitcher />
        </div>
      </div>

      <main className="flex-1 flex flex-col min-h-0 order-1 md:order-2 md:max-w-2xl md:mx-auto md:w-full pt-11 md:pt-0 pb-[calc(62px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      {showTabs && currentUser && (
        <div className="order-2 md:order-1">
          <TabBar />
        </div>
      )}
    </div>
  );
}
