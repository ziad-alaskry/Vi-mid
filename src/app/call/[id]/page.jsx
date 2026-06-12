"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { hcpById, repById } from "@/lib/seed";
import { Button, Avatar, Stars } from "@/components/ui";
import { Icon } from "@/components/icons";

const BASE_SECONDS = 120;
const MAX_EXTENSIONS = 2;

export default function CallPage() {
  const { id } = useParams();
  const router = useRouter();
  const { state, currentUser, isHcp, completeBooking, updateBooking } = useStore();

  const booking = state.bookings.find((b) => b.id === id);
  const [phase, setPhase] = useState("live"); // live | rating
  const [seconds, setSeconds] = useState(BASE_SECONDS);
  const [total, setTotal] = useState(BASE_SECONDS);
  const [extensions, setExtensions] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const endCall = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    setPhase("rating");
  }, []);

  // camera self-view
  useEffect(() => {
    let active = true;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
          setCamReady(true);
        })
        .catch(() => setCamReady(false));
    }
    return () => { active = false; if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); };
  }, []);

  // countdown
  useEffect(() => {
    if (phase !== "live") return;
    if (seconds <= 0) { endCall(); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, phase, endCall]);

  if (!booking) {
    return (
      <div className="flex-1 grid place-items-center bg-ink text-white">
        <div className="text-center">
          <p className="mb-3">This visit is no longer available.</p>
          <Button variant="soft" onClick={() => router.replace("/visits")}>Back to visits</Button>
        </div>
      </div>
    );
  }

  const hcp = hcpById(booking.hcpId);
  const rep = repById(booking.repId);
  const counterpart = isHcp ? rep : hcp;

  function extend() {
    if (extensions >= MAX_EXTENSIONS) return;
    setSeconds((s) => s + 60);
    setTotal((t) => t + 60);
    setExtensions((e) => e + 1);
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
          <p className="text-xs text-white/40 mt-2">Connected · {booking.durationMin}-min slot</p>
        </div>
      </div>

      {/* self view */}
      <div className="absolute top-4 right-4 w-24 h-32 rounded-xl overflow-hidden bg-black/60 border border-white/15">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
        {!camReady && (
          <div className="absolute inset-0 grid place-items-center text-[10px] text-white/60 text-center px-1">
            Camera preview unavailable
          </div>
        )}
        {muted && (
          <div className="absolute bottom-1 left-1 bg-black/60 rounded-full p-1">
            <Icon name="micOff" size={12} />
          </div>
        )}
      </div>

      {/* countdown ring */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
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
          <span className="mt-1 text-[11px] text-white/60">Extended ×{extensions}</span>
        )}
      </div>

      {/* controls */}
      <div className="mt-auto relative z-10 pb-8 pt-6 px-6 bg-gradient-to-t from-black/50 to-transparent">
        {isHcp && (
          <div className="flex justify-center mb-4">
            <button
              onClick={extend}
              disabled={extensions >= MAX_EXTENSIONS}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white/10 border border-white/20 text-sm font-medium disabled:opacity-40 active:scale-95 transition"
            >
              <Icon name="plus" size={16} />
              {extensions >= MAX_EXTENSIONS ? "No extensions left" : `Extend +60s (${MAX_EXTENSIONS - extensions} left)`}
            </button>
          </div>
        )}
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => setMuted((m) => !m)}
            className={`w-14 h-14 rounded-full grid place-items-center transition ${muted ? "bg-white text-ink" : "bg-white/12 text-white"}`}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            <Icon name={muted ? "micOff" : "mic"} size={22} />
          </button>
          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full grid place-items-center bg-danger text-white active:scale-95 transition"
            aria-label="End call"
          >
            <Icon name="x" size={26} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RatingView({ counterpart, onSubmit, onSkip }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white">
      <span className="grid place-items-center w-14 h-14 rounded-full bg-green-tint text-green-pressed mb-4">
        <Icon name="check" size={28} strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Visit complete</h1>
      <p className="text-sm text-ink-soft mt-1 text-center">
        How was your call with <span dir="rtl" className="font-medium text-ink">{counterpart?.name}</span>?
      </p>

      <div className="flex items-center gap-2 my-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} onClick={() => setRating(i)} aria-label={`${i} stars`} className="active:scale-90 transition">
            <span style={{ color: i <= rating ? "#E8A93C" : "#D8DEDB" }}>
              <Icon name="star" size={36} strokeWidth={1.3} />
            </span>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment (optional)"
        rows={3}
        className="w-full max-w-app bg-surface rounded-card p-3 text-sm outline-none resize-none placeholder:text-ink-soft"
      />

      <div className="w-full max-w-app mt-4 space-y-2">
        <Button variant="primary" className="w-full" disabled={rating === 0} onClick={() => onSubmit(rating, comment)}>
          Submit rating
        </Button>
        <button onClick={onSkip} className="w-full h-11 text-sm text-ink-soft">Skip for now</button>
      </div>
    </div>
  );
}
