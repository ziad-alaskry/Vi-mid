"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Header, Card, Badge, Button } from "@/components/ui";
import { Icon } from "@/components/icons";

const UPDATES = [
  { tag: "Drug launch", title: "Long-acting GLP-1 receives SFDA approval", source: "Regulatory desk", time: "2h" },
  { tag: "Guideline", title: "Updated hypertension targets for adults over 60", source: "Cardiology brief", time: "1d" },
  { tag: "News", title: "MOH expands biosimilar coverage across tertiary centers", source: "Market access", time: "2d" },
  { tag: "Article", title: "Inhaler technique and adherence in pediatric asthma", source: "Respiratory review", time: "4d" },
];

const CATEGORIES = [
  { name: "Cardiology", icon: "dot", count: 18 },
  { name: "Endocrinology", icon: "dot", count: 14 },
  { name: "Respiratory", icon: "dot", count: 11 },
  { name: "Dermatology", icon: "dot", count: 9 },
  { name: "Infectious disease", icon: "dot", count: 16 },
  { name: "Oncology", icon: "dot", count: 12 },
];

const PROTOCOLS = [
  { disease: "Type 2 diabetes", cat: "Endocrinology", body: "First-line metformin; add GLP-1 or SGLT2 per CV risk." },
  { disease: "Hypertension", cat: "Cardiology", body: "Lifestyle + ACE/ARB or CCB; target per age and comorbidity." },
  { disease: "Asthma", cat: "Respiratory", body: "Stepwise ICS-based control; review inhaler technique each visit." },
  { disease: "Atopic dermatitis", cat: "Dermatology", body: "Emollients + topical steroids; escalate to systemic if severe." },
  { disease: "Community pneumonia", cat: "Infectious disease", body: "Risk-stratify (CURB-65); empirical antibiotics per setting." },
  { disease: "Heart failure", cat: "Cardiology", body: "Guideline-directed quadruple therapy; titrate to tolerance." },
  { disease: "Hypothyroidism", cat: "Endocrinology", body: "Levothyroxine; recheck TSH at 6–8 weeks." },
  { disease: "COPD", cat: "Respiratory", body: "LABA/LAMA bronchodilation; add ICS for frequent exacerbators." },
];

export default function LibraryPage() {
  const [tab, setTab] = useState("updates");
  return (
    <>
      <Header title="Library" subtitle="Updates, protocols & companion" />
      <div className="px-4 pt-3">
        <div className="grid grid-cols-3 bg-surface rounded-lg p-1 text-[13px] font-medium">
          {[["updates", "Updates"], ["treatment", "Treatment"], ["companion", "Companion"]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`h-9 rounded-md transition ${tab === k ? "bg-white text-green-pressed shadow-sm" : "text-ink-soft"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {tab === "updates" && <Updates />}
      {tab === "treatment" && <Treatment />}
      {tab === "companion" && <Companion />}
    </>
  );
}

function Updates() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 no-scrollbar">
      <p className="text-xs text-ink-soft px-1">
        Curated by ViMed. In production this feed is posted by an admin or an AI agent that fetches from defined trusted resources.
      </p>
      {UPDATES.map((u, i) => (
        <Card key={i} className="p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge tone={u.tag === "Drug launch" ? "tint" : "blue"}>{u.tag}</Badge>
            <span className="text-xs text-ink-soft ml-auto">{u.time} ago</span>
          </div>
          <p className="font-medium leading-snug">{u.title}</p>
          <p className="text-xs text-ink-soft mt-1">{u.source}</p>
        </Card>
      ))}
    </div>
  );
}

function Treatment() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PROTOCOLS.filter((p) => {
      if (cat && p.cat !== cat) return false;
      if (term && !(`${p.disease} ${p.body} ${p.cat}`.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [q, cat]);

  const searching = q.trim() || cat;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 no-scrollbar">
      <div className="flex items-center gap-2 bg-white border border-green-primary/40 rounded-card h-12 px-3 shadow-soft">
        <Icon name="search" size={20} className="text-green-primary" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search treatment protocols & guidelines"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-soft"
        />
        {q && <button onClick={() => setQ("")} aria-label="Clear"><Icon name="x" size={16} className="text-ink-soft" /></button>}
      </div>

      {!searching && (
        <>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft mt-5 mb-2">Browse by disease area</p>
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map((c) => (
              <button key={c.name} onClick={() => setCat(c.name === "Infectious disease" || c.name === "Oncology" ? null : c.name)}>
                <Card className="p-3.5 text-left hover:border-green-primary transition h-full">
                  <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-green-tint text-green-pressed mb-2">
                    <Icon name="book" size={16} />
                  </span>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-ink-soft">{c.count} protocols</p>
                </Card>
              </button>
            ))}
          </div>
        </>
      )}

      {searching && (
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-soft">{results.length} protocols</span>
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
          {results.length === 0 && <p className="text-sm text-ink-soft text-center py-8">No protocols match that search.</p>}
        </div>
      )}
    </div>
  );
}

function Companion() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi — I'm your ViMed health companion. My answers draw only from [trusted source] and are for information, not medical advice. What would you like to look up?" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, {
        from: "bot",
        text: "Here's a general summary based on [trusted source]. In the production build this connects to the live source of truth and returns sourced answers. For clinical decisions, please confirm against the full guideline.",
      }]);
    }, 500);
  }

  const suggestions = ["First-line for T2DM?", "Asthma step-up therapy", "Hypertension targets"];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            {m.from === "bot" && (
              <span className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-green-tint text-green-pressed mr-2 self-end">
                <Icon name="sparkle" size={16} />
              </span>
            )}
            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.from === "user" ? "bg-green-primary text-white rounded-br-md" : "bg-surface text-ink rounded-bl-md"
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
        <div className="flex items-center gap-2 bg-surface rounded-full h-11 pl-4 pr-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about a condition or protocol"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-soft"
          />
          <button onClick={send} disabled={!input.trim()} className="w-9 h-9 rounded-full grid place-items-center bg-green-primary text-white disabled:opacity-40" aria-label="Send">
            <Icon name="send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
