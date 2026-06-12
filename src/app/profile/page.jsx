"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Header, Card, Badge, Button, Avatar, Stars } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function ProfilePage() {
  const { currentUser, isHcp, state, logout, reset } = useStore();
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);

  const received = useMemo(() => {
    if (!currentUser) return { avg: null, count: 0 };
    const rs = state.bookings
      .filter((b) => b.status === "done")
      .map((b) => (isHcp ? b.repRating : b.hcpRating))
      .filter(Boolean);
    if (rs.length === 0) return { avg: isHcp ? currentUser.rating : null, count: 0 };
    return { avg: Math.round((rs.reduce((a, c) => a + c, 0) / rs.length) * 10) / 10, count: rs.length };
  }, [state.bookings, currentUser, isHcp]);

  if (!currentUser) return null;

  const fields = isHcp
    ? [
        ["Role", currentUser.role],
        ["Specialty", currentUser.specialty || currentUser.setting || currentUser.sector || "—"],
        ["Center", currentUser.center],
        ["City", currentUser.city],
        ["Sector", currentUser.sector || "—"],
      ]
    : [
        ["Role", currentUser.role],
        ["Company", currentUser.company],
        ["Territory", currentUser.territory],
        ["Detailing", currentUser.product],
        ["Specialties", (currentUser.specialties || []).join(", ")],
      ];

  function signOut() { logout(); router.replace("/"); }
  function doReset() { reset(); router.replace("/"); }

  return (
    <>
      <Header
        title="Profile"
        right={<Button variant="ghost" className="h-9 px-3" aria-label="Edit"><Icon name="pencil" size={18} /></Button>}
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        <div className="flex flex-col items-center text-center pt-2">
          <Avatar name={currentUser.name} size={76} tone={isHcp ? "green" : "blue"} />
          <p className="font-semibold text-lg mt-3" dir="rtl">{currentUser.name}</p>
          <div className="mt-1">
            <Badge tone={isHcp ? "tint" : "blue"}>{isHcp ? "Healthcare professional" : "Sales rep"}</Badge>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-soft">Rating received</p>
              {received.avg ? (
                <div className="flex items-center gap-2 mt-1">
                  <Stars value={received.avg} />
                  <span className="font-medium">{received.avg}</span>
                </div>
              ) : (
                <p className="font-medium mt-1">No ratings yet</p>
              )}
            </div>
            <span className="text-xs text-ink-soft">{received.count} rated visit{received.count === 1 ? "" : "s"}</span>
          </div>
        </Card>

        <Card className="p-1 overflow-hidden">
          {fields.map(([k, v], i) => (
            <div key={k} className={`flex items-center justify-between gap-3 px-3 py-3 ${i < fields.length - 1 ? "border-b border-hairline" : ""}`}>
              <span className="text-sm text-ink-soft">{k}</span>
              <span className="text-sm font-medium text-right truncate max-w-[60%]">{v}</span>
            </div>
          ))}
        </Card>

        <div className="space-y-2 pt-1">
          <Button variant="outline" className="w-full" onClick={signOut}>
            <Icon name="logout" size={18} /> Sign out
          </Button>

          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="w-full h-10 text-sm text-ink-soft inline-flex items-center justify-center gap-2">
              <Icon name="refresh" size={16} /> Reset demo data
            </button>
          ) : (
            <Card className="p-3">
              <p className="text-sm font-medium mb-1">Reset all demo data?</p>
              <p className="text-xs text-ink-soft mb-3">Clears every booking, rating, availability change, and loyalty point on this device.</p>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setConfirmReset(false)}>Keep data</Button>
                <Button variant="danger" className="flex-1" onClick={doReset}>Reset</Button>
              </div>
            </Card>
          )}
        </div>

        <p className="text-center text-[11px] text-ink-soft pt-2">ViMed demo · v0.1 · saved in your browser only</p>
      </div>
    </>
  );
}
