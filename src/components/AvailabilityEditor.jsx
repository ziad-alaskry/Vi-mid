"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useStore } from "@/lib/store";
import { Header, Button, Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { dayLabels, slotsForDay, fmtTime, clampSlot } from "@/lib/slots";

export default function AvailabilityEditor() {
  const t = useTranslations("availability");
  const locale = useLocale();
  const DAY_LABELS = dayLabels(locale);
  const { currentUser, state, setAvailability } = useStore();
  const base = state.availabilityOverrides[currentUser.id] || currentUser.availability;

  const [days, setDays] = useState(base.days);
  const [startH, setStartH] = useState(base.startH);
  const [endH, setEndH] = useState(base.endH);
  const [slotMinutes, setSlotMinutes] = useState(base.slotMinutes);
  const [fixedWeekly, setFixedWeekly] = useState(base.fixedWeekly);
  const [saved, setSaved] = useState(false);

  const availability = { days, startH, endH, slotMinutes, fixedWeekly };
  const slots = useMemo(() => slotsForDay(availability, locale), [startH, endH, slotMinutes, locale]);

  function toggleDay(d) {
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]).sort());
    setSaved(false);
  }
  function save() {
    setAvailability(currentUser.id, { ...availability, days: [...days].sort() });
    setSaved(true);
  }

  return (
    <>
      <Header title={t("title")} subtitle={t("subtitle")} />
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[15px]">{t("repeatWeekly")}</p>
              <p className="text-xs text-ink-soft">{t("repeatWeeklyHint")}</p>
            </div>
            <button
              onClick={() => { setFixedWeekly((v) => !v); setSaved(false); }}
              className={`relative w-12 h-7 rounded-full transition ${fixedWeekly ? "bg-green-primary" : "bg-hairline"}`}
              aria-pressed={fixedWeekly}
              aria-label={t("repeatWeekly")}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${fixedWeekly ? "start-6" : "start-1"}`} />
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="font-medium text-[15px] mb-3">{t("dutyDays")}</p>
          <div className="flex gap-1.5">
            {DAY_LABELS.map((label, idx) => (
              <button
                key={idx}
                onClick={() => toggleDay(idx)}
                className={`flex-1 h-11 rounded-lg text-sm font-medium border transition ${
                  days.includes(idx)
                    ? "border-green-primary bg-green-tint text-green-pressed"
                    : "border-hairline text-ink-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <p className="font-medium text-[15px] mb-3">{t("dutyHours")}</p>
          <div className="flex items-center gap-3">
            <HourField label={t("from")} value={startH} min={6} max={endH - 1} locale={locale} onChange={(v) => { setStartH(v); setSaved(false); }} />
            <span className="text-ink-soft pt-5">—</span>
            <HourField label={t("to")} value={endH} min={startH + 1} max={22} locale={locale} onChange={(v) => { setEndH(v); setSaved(false); }} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-[15px]">{t("slotLength")}</p>
            <span className="text-green-pressed font-semibold">{t("minutesShort", { count: slotMinutes })}</span>
          </div>
          <p className="text-xs text-ink-soft mb-3">{t("slotLengthHint")}</p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex-1"
              disabled={slotMinutes <= 5}
              onClick={() => { setSlotMinutes((m) => clampSlot(m - 5)); setSaved(false); }}
            >
              <Icon name="x" size={14} className="rotate-45" /> {t("minutesShort", { count: 5 })}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={slotMinutes >= 60}
              onClick={() => { setSlotMinutes((m) => clampSlot(m + 5)); setSaved(false); }}
            >
              <Icon name="plus" size={16} /> {t("minutesShort", { count: 5 })}
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="font-medium text-[15px] mb-1">{t("generatedSlots")}</p>
          <p className="text-xs text-ink-soft mb-3">
            {t("slotsPerDay", { count: slots.length, start: fmtTime(startH, 0, locale), end: fmtTime(endH, 0, locale) })}
          </p>
          {slots.length === 0 ? (
            <p className="text-sm text-danger">{t("widenHours")}</p>
          ) : (
            <div
              className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto no-scrollbar"
              tabIndex={0}
              role="region"
              aria-label={t("generatedSlots")}
            >
              {slots.map((s) => (
                <span key={s.label} className="h-9 grid place-items-center rounded-lg bg-green-tint text-green-pressed text-xs font-medium">
                  {s.label.replace(" ", "")}
                </span>
              ))}
            </div>
          )}
        </Card>

        <div className="h-2" />
      </div>

      <div className="px-4 py-3 border-t border-hairline bg-white">
        <Button variant={saved ? "soft" : "primary"} className="w-full" onClick={save}>
          {saved ? (<><Icon name="check" size={18} /> {t("saved")}</>) : t("save")}
        </Button>
      </div>
    </>
  );
}

function HourField({ label, value, min, max, locale, onChange }) {
  const t = useTranslations("availability");
  return (
    <div className="flex-1">
      <p className="text-xs text-ink-soft mb-1">{label}</p>
      <div className="flex items-center justify-between border border-hairline rounded-lg h-11 px-2">
        <button
          className="w-8 h-8 grid place-items-center rounded-md text-ink-soft disabled:opacity-30"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label={t("decrease", { label })}
        >
          <Icon name="chevronLeft" size={18} />
        </button>
        <span className="font-medium text-sm">{fmtTime(value, 0, locale)}</span>
        <button
          className="w-8 h-8 grid place-items-center rounded-md text-ink-soft disabled:opacity-30"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label={t("increase", { label })}
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </div>
  );
}
