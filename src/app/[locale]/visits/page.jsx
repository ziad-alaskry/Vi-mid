"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useStore } from "@/lib/store";
import { hcpById, repById } from "@/lib/seed";
import { prettyDate, slotsForDay, upcomingDatesFor } from "@/lib/slots";
import { Header, Card, Badge, Button, EmptyState, Avatar, Stars, Sheet, Tabs } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function VisitsPage() {
  const t = useTranslations("visits");
  const { currentUser, isHcp, state, cancelBooking } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState("upcoming");
  const [reschedId, setReschedId] = useState(null);

  const mine = useMemo(() => {
    if (!currentUser) return [];
    return state.bookings
      .filter((b) => (isHcp ? b.hcpId === currentUser.id : b.repId === currentUser.id))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [state.bookings, currentUser, isHcp]);

  const upcoming = mine.filter((b) => b.status === "upcoming");
  const history = mine.filter((b) => b.status !== "upcoming");
  const list = tab === "upcoming" ? upcoming : history;

  return (
    <>
      <Header
        title={t("title")}
        subtitle={isHcp ? t("subtitleHcp") : t("subtitleRep")}
        right={
          <Button variant="soft" className="h-9 px-3" onClick={() => router.push("/new-visit")}>
            <Icon name="plus" size={18} /> {isHcp ? t("availability") : t("book")}
          </Button>
        }
      />

      <div className="px-4 pt-3">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            {
              key: "upcoming",
              label: t("upcoming"),
              badge: upcoming.length > 0 && <span className="ms-1.5 text-xs text-green-primary">{upcoming.length}</span>,
            },
            { key: "history", label: t("history") },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 no-scrollbar">
        {list.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={tab === "upcoming" ? t("noUpcoming") : t("noHistory")}
            hint={isHcp ? t("hintHcp") : t("hintRep")}
          />
        ) : (
          list.map((b) => (
            <VisitCard
              key={b.id}
              booking={b}
              isHcp={isHcp}
              onStart={() => router.push(`/call/${b.id}`)}
              onCancel={() => cancelBooking(b.id)}
              onReschedule={() => setReschedId(b.id)}
            />
          ))
        )}
      </div>

      {reschedId && (
        <RescheduleSheet bookingId={reschedId} onClose={() => setReschedId(null)} />
      )}
    </>
  );
}

function VisitCard({ booking, isHcp, onStart, onCancel, onReschedule }) {
  const t = useTranslations("visits");
  const locale = useLocale();
  const hcp = hcpById(booking.hcpId);
  const rep = repById(booking.repId);
  const counterpart = isHcp ? rep : hcp;
  const myRatingGiven = isHcp ? booking.hcpRating : booking.repRating;

  return (
    <Card className="p-3.5">
      <div className="flex items-start gap-3">
        <Avatar name={counterpart?.name || "—"} tone={isHcp ? "blue" : "green"} size={42} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium truncate" dir="rtl">{counterpart?.name}</span>
            {booking.status === "cancelled" && <Badge tone="danger">{t("cancelled")}</Badge>}
            {booking.status === "done" && <Badge tone="soft">{t("done")}</Badge>}
          </div>
          <p className="text-sm text-ink-soft truncate">
            {isHcp
              ? `${rep?.role} · ${booking.company}`
              : `${hcp?.specialty || hcp?.role} · ${hcp?.center}`}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-sm">
            <span className="inline-flex items-center gap-1 text-green-pressed">
              <Icon name="calendar" size={15} /> {prettyDate(booking.date, locale)}
            </span>
            <span className="inline-flex items-center gap-1 text-green-pressed">
              <Icon name="clock" size={15} /> {booking.time}
            </span>
          </div>
          {!isHcp && booking.product && (
            <p className="text-xs text-ink-soft mt-1">{t("detailing")}: {booking.product}</p>
          )}
        </div>
      </div>

      {booking.status === "upcoming" && (
        <div className="flex items-center gap-2 mt-3">
          <Button variant="primary" className="flex-1" onClick={onStart}>
            <Icon name="video" size={18} /> {t("startCall")}
          </Button>
          <Button variant="ghost" className="px-3" onClick={onReschedule} aria-label={t("reschedule")}>
            <Icon name="calendar" size={18} />
          </Button>
          <Button variant="danger" className="px-3" onClick={onCancel} aria-label={t("cancel")}>
            <Icon name="x" size={18} />
          </Button>
        </div>
      )}

      {booking.status === "done" && (
        <div className="mt-3 pt-3 border-t border-hairline flex items-center justify-between">
          <span className="text-xs text-ink-soft">
            {myRatingGiven ? t("youRated") : t("ratingSkipped")}
          </span>
          {myRatingGiven ? <Stars value={myRatingGiven} /> : <Badge tone="soft">—</Badge>}
        </div>
      )}
    </Card>
  );
}

function RescheduleSheet({ bookingId, onClose }) {
  const t = useTranslations("visits");
  const locale = useLocale();
  const { state, rescheduleBooking } = useStore();
  const booking = state.bookings.find((b) => b.id === bookingId);
  const hcp = hcpById(booking.hcpId);
  const [date, setDate] = useState(booking.date);
  const [time, setTime] = useState(booking.time);
  const [conflict, setConflict] = useState(false);

  // simple slot list from the hcp availability window
  const dates = upcomingDatesFor(hcp.availability, 8);
  const slots = slotsForDay(hcp.availability, locale);

  const taken = (d, tm) =>
    state.bookings.some((b) => b.id !== bookingId && b.hcpId === hcp.id && b.date === d && b.time === tm && b.status === "upcoming");

  function confirm() {
    const ok = rescheduleBooking(bookingId, { date, time });
    if (ok) onClose();
    else setConflict(true);
  }

  return (
    <Sheet onClose={onClose} className="p-4 pb-6">
      <h2 className="font-semibold text-[15px] mb-3">{t("rescheduleTitle")}</h2>
      <p className="text-xs text-ink-soft mb-2">{t("pickDay")}</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => { setDate(d); setConflict(false); }}
            className={`shrink-0 px-3 h-10 rounded-lg text-sm border ${date === d ? "border-green-primary bg-green-tint text-green-pressed" : "border-hairline text-ink-soft"}`}
          >
            {prettyDate(d, locale)}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink-soft mt-3 mb-2">{t("pickTime")}</p>
      {slots.length === 0 ? (
        <p className="text-sm text-ink-soft">{t("noAvailableSlots")}</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto no-scrollbar">
          {slots.map((s) => {
            const isTaken = taken(date, s.label);
            return (
              <button
                key={s.label}
                disabled={isTaken}
                onClick={() => { setTime(s.label); setConflict(false); }}
                className={`h-10 rounded-lg text-sm border ${
                  isTaken
                    ? "border-hairline text-ink-soft/40 line-through"
                    : time === s.label
                    ? "border-green-primary bg-green-tint text-green-pressed"
                    : "border-hairline text-ink-soft"
                }`}
              >
                {s.label.replace(" ", "")}
              </button>
            );
          })}
        </div>
      )}
      {conflict && <p className="text-xs text-danger mt-2">{t("rescheduleConflict")}</p>}
      <div className="flex gap-2 mt-4">
        <Button variant="ghost" className="flex-1" onClick={onClose}>{t("cancel")}</Button>
        <Button variant="primary" className="flex-1" disabled={taken(date, time)} onClick={confirm}>
          {t("confirm")}
        </Button>
      </div>
    </Sheet>
  );
}
