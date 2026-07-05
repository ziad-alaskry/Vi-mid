"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useStore } from "@/lib/store";
import { pickerPersonas, findByEmail } from "@/lib/seed";
import { DEMO_PASSWORD } from "@/lib/config";
import { Logo, Avatar, Input, Button, Sheet } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function LoginPage() {
  const t = useTranslations("login");
  const { login } = useStore();
  const router = useRouter();
  const personas = pickerPersonas();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  function choose(id, kind) {
    login(id);
    router.push(kind === "Admin" ? "/admin" : "/visits");
  }

  function submitLogin(e) {
    e.preventDefault();
    const person = findByEmail(email);
    if (!person || password !== DEMO_PASSWORD) {
      setError(true);
      return;
    }
    choose(person.id, person.role === "Admin" ? "Admin" : undefined);
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-8 pb-10">
      <div className="flex flex-col items-center text-center">
        <Logo className="text-4xl" />
        <p className="mt-3 text-ink-soft text-[15px] max-w-[280px]">{t("tagline")}</p>
      </div>

      <form onSubmit={submitLogin} className="mt-8 space-y-2.5">
        <div className="flex items-center gap-2 bg-surface rounded-lg h-11 px-3">
          <Icon name="user" size={18} className="text-ink-soft shrink-0" />
          <Input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(false); }}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
          />
        </div>
        <div className="flex items-center gap-2 bg-surface rounded-lg h-11 px-3">
          <Icon name="lock" size={18} className="text-ink-soft shrink-0" />
          <Input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder={t("passwordPlaceholder")}
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-xs text-danger px-1">{t("invalidCredentials")}</p>}
        <p className="text-xs text-ink-soft px-1">{t("demoPasswordHint", { password: DEMO_PASSWORD })}</p>
        <Button type="submit" variant="primary" className="w-full">{t("signIn")}</Button>
        <div className="flex items-center justify-between px-1 pt-1">
          <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-green-pressed font-medium">
            {t("forgotPassword")}
          </button>
          <button type="button" onClick={() => setShowRegister(true)} className="text-xs text-green-pressed font-medium">
            {t("registerCta")}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-hairline" />
        <span className="text-xs text-ink-soft">{t("or")}</span>
        <div className="flex-1 h-px bg-hairline" />
      </div>

      <div>
        <h1 className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-3">
          {t("chooseProfile")}
        </h1>
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

      {showRegister && <RegisterSheet onClose={() => setShowRegister(false)} />}
      {showForgot && <ForgotPasswordSheet onClose={() => setShowForgot(false)} />}
    </div>
  );
}

function RegisterSheet({ onClose }) {
  const t = useTranslations("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("hcp");
  const [submitted, setSubmitted] = useState(false);

  return (
    <Sheet onClose={onClose} className="p-4 pb-6">
      <h2 className="font-semibold text-[15px] mb-3">{t("registerTitle")}</h2>
      {submitted ? (
        <>
          <p className="text-sm text-ink-soft mb-4">{t("registerMockMessage")}</p>
          <Button variant="primary" className="w-full" onClick={onClose}>{t("backToSignIn")}</Button>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-2.5">
          <div className="flex items-center gap-2 bg-surface rounded-lg h-11 px-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} />
          </div>
          <div className="flex items-center gap-2 bg-surface rounded-lg h-11 px-3">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} />
          </div>
          <div className="flex items-center gap-2 bg-surface rounded-lg h-11 px-3">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("passwordPlaceholder")} />
          </div>
          <div>
            <p className="text-xs text-ink-soft mb-1.5 mt-1">{t("roleLabel")}</p>
            <div className="flex gap-1.5">
              {[["rep", t("rep")], ["hcp", t("hcp")], ["admin", t("admin")]].map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setRole(key)}
                  className={`flex-1 h-9 rounded-lg text-sm border transition ${role === key ? "border-green-primary bg-green-tint text-green-pressed" : "border-hairline text-ink-soft"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2">{t("registerSubmit")}</Button>
        </form>
      )}
    </Sheet>
  );
}

function ForgotPasswordSheet({ onClose }) {
  const t = useTranslations("login");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <Sheet onClose={onClose} className="p-4 pb-6">
      <h2 className="font-semibold text-[15px] mb-3">{t("forgotTitle")}</h2>
      {submitted ? (
        <>
          <p className="text-sm text-ink-soft mb-4">{t("forgotMockMessage")}</p>
          <Button variant="primary" className="w-full" onClick={onClose}>{t("backToSignIn")}</Button>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-2.5">
          <div className="flex items-center gap-2 bg-surface rounded-lg h-11 px-3">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} />
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2">{t("forgotSubmit")}</Button>
        </form>
      )}
    </Sheet>
  );
}
