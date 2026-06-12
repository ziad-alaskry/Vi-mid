"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Header, Button, Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { DAY_LABELS, slotsForDay, fmtTime, clampSlot } from "@/lib/slots";

export default function AvailabilityEditor() {
  const { currentUser, state, setAvailability } = useStore();
  const base = state.availabilityOverrides[currentUser.id] || currentUser.availability;

  const [days, setDays] = useState(base.days);
  const [startH, setStartH] = useState(base.startH);
  const [endH, setEndH] = useState(base.endH);
  const [slotMinutes, setSlotMinutes] = useState(base.slotMinutes);
  const [fixedWeekly, setFixedWeekly] = useState(base.fixedWeekly);
  const [saved, setSaved] = useState(false);

  const availability = { days, startH, endH, slotMinutes, fixedWeekly };
  const slots = useMemo(() => slotsForDay(availability), [startH, endH, slotMinutes]);

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
      <Header title="My availability" subtitle="Publish when reps can book you" />
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[15px]">Repeat weekly</p>
              <p className="text-xs text-ink-soft">Selected days repeat every week</p>
            </div>
            <button
              onClick={() => { setFixedWeekly((v) => !v); setSaved(false); }}
              className={`relative w-12 h-7 rounded-full transition ${fixedWeekly ? "bg-green-primary" : "bg-hairline"}`}
              aria-pressed={fixedWeekly}
              aria-label="Repeat weekly"
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${fixedWeekly ? "left-6" : "left-1"}`} />
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="font-medium text-[15px] mb-3">Duty days</p>
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
          <p className="font-medium text-[15px] mb-3">Duty hours</p>
          <div className="flex items-center gap-3">
            <HourField label="From" value={startH} min={6} max={endH - 1} onChange={(v) => { setStartH(v); setSaved(false); }} />
            <span className="text-ink-soft pt-5">—</span>
            <HourField label="To" value={endH} min={startH + 1} max={22} onChange={(v) => { setEndH(v); setSaved(false); }} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-[15px]">Slot length</p>
            <span className="text-green-pressed font-semibold">{slotMinutes} min</span>
          </div>
          <p className="text-xs text-ink-soft mb-3">Default 15 min · adjust between 5 and 60</p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex-1"
              disabled={slotMinutes <= 5}
              onClick={() => { setSlotMinutes((m) => clampSlot(m - 5)); setSaved(false); }}
            >
              <Icon name="x" size={14} className="rotate-45" /> 5 min
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={slotMinutes >= 60}
              onClick={() => { setSlotMinutes((m) => clampSlot(m + 5)); setSaved(false); }}
            >
              <Icon name="plus" size={16} /> 5 min
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="font-medium text-[15px] mb-1">Generated slots</p>
          <p className="text-xs text-ink-soft mb-3">
            {slots.length} slots per duty day · {fmtTime(startH, 0)} to {fmtTime(endH, 0)}
          </p>
          {slots.length === 0 ? (
            <p className="text-sm text-danger">Widen your hours to generate slots.</p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto no-scrollbar">
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
          {saved ? (<><Icon name="check" size={18} /> Availability saved</>) : "Save availability"}
        </Button>
      </div>
    </>
  );
}

function HourField({ label, value, min, max, onChange }) {
  return (
    <div className="flex-1">
      <p className="text-xs text-ink-soft mb-1">{label}</p>
      <div className="flex items-center justify-between border border-hairline rounded-lg h-11 px-2">
        <button
          className="w-8 h-8 grid place-items-center rounded-md text-ink-soft disabled:opacity-30"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label={`Decrease ${label}`}
        >
          <Icon name="chevronLeft" size={18} />
        </button>
        <span className="font-medium text-sm">{fmtTime(value, 0)}</span>
        <button
          className="w-8 h-8 grid place-items-center rounded-md text-ink-soft disabled:opacity-30"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </div>
  );
}
