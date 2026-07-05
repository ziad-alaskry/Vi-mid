"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import TabBar from "@/components/TabBar";

const TAB_ROUTES = ["/visits", "/new-visit", "/library", "/profile"];

export default function AppChrome({ children }) {
  const { ready, currentUser } = useStore();
  const path = usePathname();
  const router = useRouter();

  const isLogin = path === "/";
  const isCall = path.startsWith("/call/");
  const showTabs = !isLogin && !isCall;

  useEffect(() => {
    if (!ready) return;
    if (!currentUser && !isLogin) router.replace("/");
  }, [ready, currentUser, isLogin, router]);

  if (!ready) {
    return (
      <div className="app-frame grid place-items-center">
        <div className="text-ink-soft text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="app-frame flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
      {showTabs && currentUser && <TabBar />}
    </div>
  );
}
