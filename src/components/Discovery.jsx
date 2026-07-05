"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useStore } from "@/lib/store";
import { directory, allHcps } from "@/lib/seed";
import { Header, Card, Badge, Button, Avatar, Stars, EmptyState, Input, Sheet } from "@/components/ui";
import { Icon } from "@/components/icons";
import { slotsForDay, upcomingDatesFor, prettyDate } from "@/lib/slots";

const SECTORS = ["All", "MOH", "Private", "Retail"];

export default function Discovery() {
  const t = useTranslations("discovery");
  const tc = useTranslations("common");
  const { currentUser, state, book } = useStore();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [territory, setTerritory] = useState("All");
  const [sector, setSector] = useState("All");
  const [specialty, setSpecialty] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const hcps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allHcps().filter((h) => {
      if (territory !== "All" && h.city !== territory) return false;
      if (sector !== "All" && h.sector !== sector) return false;
      if (specialty !== "All" && h.specialty !== specialty) return false;
      if (q && !(`${h.name} ${h.center}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [query, territory, sector, specialty]);

  const activeFilters = [territory, sector, specialty].filter((f) => f !== "All").length;

  return (
    <>
      <Header title={t("title")} subtitle={t("subtitle")} />

      <div className="px-4 pt-3 space-y-2.5">
        <div className="flex items-center gap-2 bg-surface rounded-lg h-11 px-3">
          <Icon name="search" size={18} className="text-ink-soft" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label={tc("clear")}>
              <Icon name="x" size={16} className="text-ink-soft" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 text-sm text-green-pressed font-medium"
        >
          <Icon name="filter" size={16} /> {t("filters")}
          {activeFilters > 0 && <Badge tone="tint">{activeFilters}</Badge>}
        </button>

        {showFilters && (
          <div className="space-y-2 pb-1">
            <FilterRow label={t("territory")} value={territory} setValue={setTerritory} options={["All", ...directory.cities]} />
            <FilterRow label={t("sector")} value={sector} setValue={setSector} options={SECTORS} />
            <FilterRow label={t("specialty")} value={specialty} setValue={setSpecialty} options={["All", ...directory.specialties]} />
          </div>
        )}
      </div>

      <div className="px-4 py-1 text-xs text-ink-soft">{t("resultsCount", { count: hcps.length })}</div>

      <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-2.5 no-scrollbar">
        {hcps.length === 0 ? (
          <EmptyState icon="search" title={t("noMatches")} hint={t("noMatchesHint")} />
        ) : (
          hcps.slice(0, 40).map((h) => (
            <button key={h.id} onClick={() => setSelected(h)} className="w-full text-start">
              <Card className="p-3.5 hover:border-green-primary transition">
                <div className="flex items-center gap-3">
                  <Avatar name={h.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate" dir="rtl">{h.name}</span>
                    </div>
                    <p className="text-sm text-ink-soft truncate">
                      {h.specialty || h.role} · {h.center}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Stars value={h.rating} size={13} />
                      <span className="text-xs text-ink-soft">{h.rating}</span>
                      <Badge tone="soft">{h.city}</Badge>
                    </div>
                  </div>
                  <Icon name="chevronRight" size={18} className="text-ink-soft shrink-0 mirror-rtl" />
                </div>
              </Card>
            </button>
          ))
        )}
      </div>

      {selected && (
        <BookingSheet
          hcp={selected}
          rep={currentUser}
          existing={state.bookings}
          onClose={() => setSelected(null)}
          onBook={(payload) => { book(payload); setSelected(null); router.push("/visits"); }}
        />
      )}
    </>
  );
}

function FilterRow({ label, value, setValue, options }) {
  return (
    <div>
      <p className="text-xs text-ink-soft mb-1">{label}</p>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => setValue(o)}
            className={`shrink-0 px-3 h-9 rounded-lg text-sm border transition ${
              value === o ? "border-green-primary bg-green-tint text-green-pressed" : "border-hairline text-ink-soft"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingSheet({ hcp, rep, existing, onClose, onBook }) {
  const t = useTranslations("discovery");
  const locale = useLocale();
  const dates = upcomingDatesFor(hcp.availability, 8);
  const slots = slotsForDay(hcp.availability, locale);
  const [date, setDate] = useState(dates[0]);
  const [time, setTime] = useState(null);

  const taken = (d, tm) =>
    existing.some((b) => b.hcpId === hcp.id && b.date === d && b.time === tm && b.status === "upcoming");

  return (
    <Sheet onClose={onClose} className="max-h-[88vh] flex flex-col">
      <div className="px-4 pb-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <Avatar name={hcp.name} size={48} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate" dir="rtl">{hcp.name}</p>
            <p className="text-sm text-ink-soft truncate">{hcp.specialty || hcp.role} · {hcp.center}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Stars value={hcp.rating} size={13} /><span className="text-xs text-ink-soft">{hcp.rating} · {hcp.city}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <p className="text-xs text-ink-soft mb-2">{t("availableDays")}</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {dates.map((d) => (
            <button
              key={d}
              onClick={() => { setDate(d); setTime(null); }}
              className={`shrink-0 px-3 h-11 rounded-lg text-sm border ${date === d ? "border-green-primary bg-green-tint text-green-pressed" : "border-hairline text-ink-soft"}`}
            >
              {prettyDate(d, locale)}
            </button>
          ))}
        </div>

        <p className="text-xs text-ink-soft mt-4 mb-2">{t("availableSlots")}</p>
        <div className="grid grid-cols-4 gap-2">
          {slots.map((s) => {
            const isTaken = taken(date, s.label);
            const isSel = time === s.label;
            return (
              <button
                key={s.label}
                disabled={isTaken}
                onClick={() => setTime(s.label)}
                className={`h-10 rounded-lg text-xs font-medium border transition ${
                  isTaken
                    ? "border-hairline text-ink-soft/40 line-through"
                    : isSel
                    ? "border-green-primary bg-green-primary text-white"
                    : "border-hairline text-green-pressed bg-green-tint/40"
                }`}
              >
                {s.label.replace(" ", "")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-hairline">
        <Button
          variant="primary"
          className="w-full"
          disabled={!time}
          onClick={() =>
            onBook({
              hcpId: hcp.id, repId: rep.id, date, time,
              durationMin: hcp.availability.slotMinutes,
              product: rep.product, company: rep.company,
            })
          }
        >
          {time ? t("bookAt", { date: prettyDate(date, locale), time }) : t("pickSlot")}
        </Button>
      </div>
    </Sheet>
  );
}
