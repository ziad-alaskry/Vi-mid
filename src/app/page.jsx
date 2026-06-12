"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { pickerPersonas } from "@/lib/seed";
import { Logo, Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function LoginPage() {
  const { login, currentUser } = useStore();
  const router = useRouter();
  const personas = pickerPersonas();

  function choose(id) {
    login(id);
    router.push("/visits");
  }

  return (
    <main className="flex-1 flex flex-col px-6 pt-16 pb-10">
      <div className="flex flex-col items-center text-center">
        <Logo className="text-4xl" />
        <p className="mt-3 text-ink-soft text-[15px] max-w-[280px]">
          Pre-scheduled 120-second video visits between healthcare professionals and pharma reps.
        </p>
      </div>

      <div className="mt-10">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-3">
          Choose a demo profile to sign in
        </p>
        <ul className="space-y-2.5">
          {personas.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => choose(p.id)}
                className="w-full flex items-center gap-3 bg-white border border-hairline rounded-card p-3.5 text-left hover:border-green-primary hover:bg-green-tint/30 transition active:scale-[0.99]"
              >
                <Avatar name={p.name} tone={p.kind === "Rep" ? "blue" : "green"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate" dir="rtl">{p.name}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${p.kind === "Rep" ? "bg-[#E2F0F8] text-[#2C6488]" : "bg-green-tint text-green-pressed"}`}>
                      {p.kind}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft truncate">{p.blurb}</p>
                </div>
                <Icon name="chevronRight" size={18} className="text-ink-soft shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-auto pt-8 text-center text-xs text-ink-soft">
        Demo build · mock data · no real accounts. State is saved in your browser only.
      </p>
    </main>
  );
}
