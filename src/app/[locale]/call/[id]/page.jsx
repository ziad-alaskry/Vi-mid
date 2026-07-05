"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useStore } from "@/lib/store";
import { hcpById, repById } from "@/lib/seed";
import { Button, Avatar, Stars } from "@/components/ui";
import { Icon } from "@/components/icons";
import { CALL } from "@/lib/config";

const BASE_SECONDS = CALL.BASE_SECONDS;
const MAX_EXTENSIONS = CALL.MAX_EXTENSIONS;
const PROMPT_THRESHOLD = CALL.EXTEND_PROMPT_THRESHOLD;
const MAX_PROMPTS = CALL.MAX_EXTEND_PROMPTS;

export default function CallPage() {
  const t = useTranslations("call");
  const { id } = useParams();
  const router = useRouter();
  const { state, currentUser, isHcp, completeBooking, updateBooking } = useStore();

  const booking = state.bookings.find((b) => b.id === id);
  const [phase, setPhase] = useState("live"); // live | rating
  const [seconds, setSeconds] = useState(BASE_SECONDS);
  const [total, setTotal] = useState(BASE_SECONDS);
  const [extensions, setExtensions] = useState(0);
  const [promptsShown, setPromptsShown] = useState(0);
  const [promptOpen, setPromptOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const endCall = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach((tr) => tr.stop());
    setPhase("rating");
  }, []);

  // camera self-view
  useEffect(() => {
    let active = true;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (!active) { stream.getTracks().forEach((tr) => tr.stop()); return; }
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
          setCamReady(true);
        })
        .catch(() => setCamReady(false));
    }
    return () => { active = false; if (streamRef.current) streamRef.current.getTracks().forEach((tr) => tr.stop()); };
  }, []);

  // countdown
  useEffect(() => {
    if (phase !== "live") return;
    if (seconds <= 0) { endCall(); return; }
    const tmr = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(tmr);
  }, [seconds, phase, endCall]);

  // HCP-only extend prompt: appears at most MAX_PROMPTS times, near call-end
  useEffect(() => {
    if (phase !== "live" || !isHcp || promptOpen) return;
    if (extensions >= MAX_EXTENSIONS || promptsShown >= MAX_PROMPTS) return;
    if (seconds === PROMPT_THRESHOLD) {
      setPromptOpen(true);
      setPromptsShown((n) => n + 1);
    }
  }, [seconds, phase, isHcp, extensions, promptsShown, promptOpen]);

  if (!booking) {
    return (
      <div className="flex-1 grid place-items-center bg-ink text-white">
        <div className="text-center">
          <p className="mb-3">{t("visitUnavailable")}</p>
          <Button variant="soft" onClick={() => router.replace("/visits")}>{t("backToVisits")}</Button>
        </div>
      </div>
    );
  }

  const hcp = hcpById(booking.hcpId);
  const rep = repById(booking.repId);
  const counterpart = isHcp ? rep : hcp;

  function extend() {
    if (extensions >= MAX_EXTENSIONS) return;
    setSeconds((s) => s + CALL.EXTEND_SECONDS);
    setTotal((tt) => tt + CALL.EXTEND_SECONDS);
    setExtensions((e) => e + 1);
    setPromptOpen(false);
  }

  function dismissPrompt() {
    setPromptOpen(false);
  }

  if (phase === "rating") {
    return (
      <RatingView
        counterpart={counterpart}
        onSubmit={(rating, comment) => {
          updateBooking(booking.id, isHcp ? { hcpRating: rating, hcpComment: comment } : { repRating: rating, repComment: comment });
          completeBooking(booking.id);
          router.replace("/visits");
        }}
        onSkip={() => { completeBooking(booking.id); router.replace("/visits"); }}
      />
    );
  }

  const pct = total > 0 ? seconds / total : 0;
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");
  const low = seconds <= 15;

  return (
    <div className="flex-1 flex flex-col bg-ink text-white relative overflow-hidden">
      {/* remote (simulated) */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center opacity-80">
          <Avatar name={counterpart?.name || "—"} size={92} tone={isHcp ? "blue" : "green"} />
          <p className="mt-3 font-medium" dir="rtl">{counterpart?.name}</p>
          <p className="text-sm text-white/60">
            {isHcp ? `${rep?.role} · ${booking.company}` : `${hcp?.specialty || hcp?.role}`}
          </p>
          <p className="text-xs text-white/40 mt-2">{t("connected", { duration: booking.durationMin })}</p>
        </div>
      </div>

      {/* self view */}
      <div className="absolute top-4 end-4 w-24 h-32 rounded-xl overflow-hidden bg-black/60 border border-white/15">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
        {!camReady && (
          <div className="absolute inset-0 grid place-items-center text-[10px] text-white/60 text-center px-1">
            {t("cameraUnavailable")}
          </div>
        )}
        {muted && (
          <div className="absolute bottom-1 start-1 bg-black/60 rounded-full p-1">
            <Icon name="micOff" size={12} />
          </div>
        )}
      </div>

      {/* countdown ring */}
      <div className="absolute top-6 start-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke={low ? "#F0A6A6" : "#7FD3B6"} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - pct)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className={`text-lg font-semibold tabular-nums ${low ? "text-[#F0A6A6]" : "text-white"}`}>{mm}:{ss}</span>
          </div>
        </div>
        {extensions > 0 && (
          <span className="mt-1 text-[11px] text-white/60">{t("extendedTimes", { count: extensions })}</span>
        )}
      </div>

      {/* HCP-only extend prompt (shown at most twice, near call-end) */}
      {promptOpen && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/50 px-6">
          <div className="w-full max-w-xs rounded-2xl bg-white text-ink p-4 text-center shadow-soft">
            <p className="font-semibold text-[15px]">{t("extendPromptTitle")}</p>
            <p className="text-sm text-ink-soft mt-1">{t("extendPromptBody")}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" className="flex-1" onClick={dismissPrompt}>{t("noThanks")}</Button>
              <Button variant="primary" className="flex-1" onClick={extend}>{t("extend")}</Button>
            </div>
          </div>
        </div>
      )}

      {/* controls */}
      <div className="mt-auto relative z-10 pb-8 pt-6 px-6 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => setMuted((m) => !m)}
            className={`w-14 h-14 rounded-full grid place-items-center transition ${muted ? "bg-white text-ink" : "bg-white/12 text-white"}`}
            aria-label={muted ? t("unmute") : t("mute")}
          >
            <Icon name={muted ? "micOff" : "mic"} size={22} />
          </button>
          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full grid place-items-center bg-danger text-white active:scale-95 transition"
            aria-label={t("endCall")}
          >
            <Icon name="x" size={26} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RatingView({ counterpart, onSubmit, onSkip }) {
  const t = useTranslations("call");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white">
      <span className="grid place-items-center w-14 h-14 rounded-full bg-green-tint text-green-pressed mb-4">
        <Icon name="check" size={28} strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">{t("visitComplete")}</h1>
      <p className="text-sm text-ink-soft mt-1 text-center">
        {t.rich("howWasCall", {
          personName: counterpart?.name,
          bidi: (chunks) => <span dir="rtl" className="font-medium text-ink">{chunks}</span>,
        })}
      </p>

      <div className="flex items-center gap-2 my-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} onClick={() => setRating(i)} aria-label={t("starsLabel", { count: i })} className="active:scale-90 transition">
            <span style={{ color: i <= rating ? "#E8A93C" : "#D8DEDB" }}>
              <Icon name="star" size={36} strokeWidth={1.3} />
            </span>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t("addComment")}
        rows={3}
        className="w-full max-w-app bg-surface rounded-card p-3 text-sm outline-none resize-none placeholder:text-ink-soft"
      />

      <div className="w-full max-w-app mt-4 space-y-2">
        <Button variant="primary" className="w-full" disabled={rating === 0} onClick={() => onSubmit(rating, comment)}>
          {t("submitRating")}
        </Button>
        <button onClick={onSkip} className="w-full h-11 text-sm text-ink-soft">{t("skipForNow")}</button>
      </div>
    </div>
  );
}
