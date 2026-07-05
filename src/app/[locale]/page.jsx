"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useStore } from "@/lib/store";
import { pickerPersonas } from "@/lib/seed";
import { Logo, Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const t = useTranslations("login");
  const { login } = useStore();
  const router = useRouter();
  const personas = pickerPersonas();

  function choose(id, kind) {
    login(id);
    router.push(kind === "Admin" ? "/admin" : "/visits");
  }

  return (
    <main className="flex-1 flex flex-col px-6 pt-16 pb-10">
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-col items-center text-center mt-6">
        <Logo className="text-4xl" />
        <p className="mt-3 text-ink-soft text-[15px] max-w-[280px]">{t("tagline")}</p>
      </div>

      <div className="mt-10">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-3">
          {t("chooseProfile")}
        </p>
        <ul className="space-y-2.5">
          {personas.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => choose(p.id, p.kind)}
                className="w-full flex items-center gap-3 bg-white border border-hairline rounded-card p-3.5 text-start hover:border-green-primary hover:bg-green-tint/30 transition active:scale-[0.99]"
              >
                <Avatar name={p.name} tone={p.kind === "Rep" ? "blue" : p.kind === "Admin" ? "neutral" : "green"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate" dir="rtl">{p.name}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${p.kind === "Rep" ? "bg-blue-tint text-blue-pressed" : p.kind === "Admin" ? "bg-surface text-ink-soft" : "bg-green-tint text-green-pressed"}`}>
                      {p.kind === "Rep" ? t("rep") : p.kind === "Admin" ? t("admin") : t("hcp")}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft truncate">{p.blurb}</p>
                </div>
                <Icon name="chevronRight" size={18} className="text-ink-soft shrink-0 mirror-rtl" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-auto pt-8 text-center text-xs text-ink-soft">{t("demoNote")}</p>
    </main>
  );
}
