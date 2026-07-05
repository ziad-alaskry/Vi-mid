"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Header, Card, Badge, Button, Tabs, Input } from "@/components/ui";
import { Icon } from "@/components/icons";
import { contentProvider } from "@/lib/content";

export default function LibraryPage() {
  const t = useTranslations("library");
  const [tab, setTab] = useState("updates");
  return (
    <>
      <Header title={t("title")} subtitle={t("subtitle")} />
      <div className="px-4 pt-3">
        <Tabs
          active={tab}
          onChange={setTab}
          textClassName="text-[13px]"
          tabs={[
            { key: "updates", label: t("tabUpdates") },
            { key: "treatment", label: t("tabTreatment") },
            { key: "companion", label: t("tabCompanion") },
          ]}
        />
      </div>
      {tab === "updates" && <Updates />}
      {tab === "treatment" && <Treatment />}
      {tab === "companion" && <Companion />}
    </>
  );
}

function Updates() {
  const t = useTranslations("library");
  const locale = useLocale();
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    let active = true;
    contentProvider.getUpdates(t.raw("updates")).then((data) => {
      if (active) setUpdates(data);
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 no-scrollbar">
      <p className="text-xs text-ink-soft px-1">{t("updatesCaption")}</p>
      {updates.map((u, i) => (
        <Card key={i} className="p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge tone={u.tone}>{u.tag}</Badge>
            <span className="text-xs text-ink-soft ms-auto">{t("timeAgo", { time: u.time })}</span>
          </div>
          <p className="font-medium leading-snug">{u.title}</p>
          <p className="text-xs text-ink-soft mt-1">{u.source}</p>
        </Card>
      ))}
    </div>
  );
}

function Treatment() {
  const t = useTranslations("library");
  const tc = useTranslations("common");
  const categories = t.raw("categories");
  const protocols = t.raw("protocols");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return protocols.filter((p) => {
      if (cat && p.cat !== cat) return false;
      if (term && !(`${p.disease} ${p.body} ${p.cat}`.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [q, cat, protocols]);

  const searching = q.trim() || cat;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 no-scrollbar">
      <div className="flex items-center gap-2 bg-white border border-green-primary/40 rounded-card h-12 px-3 shadow-soft">
        <Icon name="search" size={20} className="text-green-primary" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchTreatment")} />
        {q && <button onClick={() => setQ("")} aria-label={tc("clear")}><Icon name="x" size={16} className="text-ink-soft" /></button>}
      </div>

      {!searching && (
        <>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft mt-5 mb-2">{t("browseByDisease")}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((c) => (
              <button key={c.name} onClick={() => setCat((cur) => (cur === c.name ? null : c.name))}>
                <Card className="p-3.5 text-start hover:border-green-primary transition h-full">
                  <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-green-tint text-green-pressed mb-2">
                    <Icon name="book" size={16} />
                  </span>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-ink-soft">{t("protocolsCount", { count: c.count })}</p>
                </Card>
              </button>
            ))}
          </div>
        </>
      )}

      {searching && (
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-soft">{t("protocolsCount", { count: results.length })}</span>
            {cat && (
              <button onClick={() => setCat(null)} className="text-xs text-green-pressed font-medium inline-flex items-center gap-1">
                <Icon name="x" size={13} /> {cat}
              </button>
            )}
          </div>
          {results.map((p, i) => (
            <Card key={i} className="p-3.5">
              <div className="flex items-center justify-between">
                <p className="font-medium">{p.disease}</p>
                <Badge tone="soft">{p.cat}</Badge>
              </div>
              <p className="text-sm text-ink-soft mt-1">{p.body}</p>
            </Card>
          ))}
          {results.length === 0 && <p className="text-sm text-ink-soft text-center py-8">{t("noProtocols")}</p>}
        </div>
      )}
    </div>
  );
}

function Companion() {
  const t = useTranslations("library");
  const tc = useTranslations("common");
  const [messages, setMessages] = useState([{ from: "bot", text: t("companionGreeting") }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setSending(true);
    const reply = await contentProvider.getCompanionReply(text, t("companionReply"));
    setMessages((m) => [...m, { from: "bot", text: reply }]);
    setSending(false);
  }

  const suggestions = t.raw("suggestions");

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            {m.from === "bot" && (
              <span className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-green-tint text-green-pressed me-2 self-end">
                <Icon name="sparkle" size={16} />
              </span>
            )}
            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.from === "user" ? "bg-green-primary text-white rounded-ee-md" : "bg-surface text-ink rounded-ss-md"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((s) => (
              <button key={s} onClick={() => setInput(s)} className="text-xs px-3 h-8 rounded-full bg-white border border-hairline text-green-pressed">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="px-3 py-3 border-t border-hairline bg-white">
        <div className="flex items-center gap-2 bg-surface rounded-full h-11 ps-4 pe-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={t("askPlaceholder")}
          />
          <button onClick={send} disabled={!input.trim() || sending} className="w-9 h-9 rounded-full grid place-items-center bg-green-primary text-white disabled:opacity-40" aria-label={tc("send")}>
            <Icon name="send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
