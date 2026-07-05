"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useStore } from "@/lib/store";
import { Header, Card, Badge, Button, Avatar, Stars } from "@/components/ui";
import { Icon } from "@/components/icons";
import { SURVEY } from "@/lib/config";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tf = useTranslations("fields");
  const { currentUser, isHcp, isAdmin, state, logout, reset, trackSurveyClick } = useStore();
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
        [tf("role"), currentUser.role],
        [tf("specialty"), currentUser.specialty || currentUser.setting || currentUser.sector || "—"],
        [tf("center"), currentUser.center],
        [tf("city"), currentUser.city],
        [tf("sector"), currentUser.sector || "—"],
      ]
    : isAdmin
    ? []
    : [
        [tf("role"), currentUser.role],
        [tf("company"), currentUser.company],
        [tf("territory"), currentUser.territory],
        [tf("detailing"), currentUser.product],
        [tf("specialties"), (currentUser.specialties || []).join(", ")],
      ];

  function signOut() { logout(); router.replace("/"); }
  function doReset() { reset(); router.replace("/"); }
  function giveFeedback() {
    trackSurveyClick(isHcp ? "hcp" : "rep");
    window.open(isHcp ? SURVEY.urlHcp : SURVEY.urlRep, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <Header
        title={t("title")}
        right={
          !isAdmin && (
            <Button variant="ghost" className="h-9 px-3" aria-label={t("edit")}><Icon name="pencil" size={18} /></Button>
          )
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        <div className="flex flex-col items-center text-center pt-2">
          <Avatar name={currentUser.name} size={76} tone={isAdmin ? "neutral" : isHcp ? "green" : "blue"} />
          <p className="font-semibold text-lg mt-3" dir="rtl">{currentUser.name}</p>
          <div className="mt-1">
            <Badge tone={isAdmin ? "soft" : isHcp ? "tint" : "blue"}>
              {isAdmin ? t("administrator") : isHcp ? t("healthcareProfessional") : t("salesRep")}
            </Badge>
          </div>
        </div>

        {!isAdmin && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-soft">{t("ratingReceived")}</p>
                {received.avg ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Stars value={received.avg} />
                    <span className="font-medium">{received.avg}</span>
                  </div>
                ) : (
                  <p className="font-medium mt-1">{t("noRatingsYet")}</p>
                )}
              </div>
              <span className="text-xs text-ink-soft">{t("ratedVisits", { count: received.count })}</span>
            </div>
          </Card>
        )}

        {fields.length > 0 && (
          <Card className="p-1 overflow-hidden">
            {fields.map(([k, v], i) => (
              <div key={k} className={`flex items-center justify-between gap-3 px-3 py-3 ${i < fields.length - 1 ? "border-b border-hairline" : ""}`}>
                <span className="text-sm text-ink-soft">{k}</span>
                <span className="text-sm font-medium text-end truncate max-w-[60%]">{v}</span>
              </div>
            ))}
          </Card>
        )}

        {!isAdmin && (
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{t("giveFeedback")}</p>
                <p className="text-xs text-ink-soft mt-0.5">{t("giveFeedbackHint")}</p>
              </div>
              <Button variant="soft" className="shrink-0 h-9 px-3" onClick={giveFeedback}>{t("giveFeedback")}</Button>
            </div>
          </Card>
        )}

        <div className="space-y-2 pt-1">
          <Button variant="outline" className="w-full" onClick={signOut}>
            <Icon name="logout" size={18} /> {t("signOut")}
          </Button>

          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="w-full h-10 text-sm text-ink-soft inline-flex items-center justify-center gap-2">
              <Icon name="refresh" size={16} /> {t("resetData")}
            </button>
          ) : (
            <Card className="p-3">
              <p className="text-sm font-medium mb-1">{t("resetConfirmTitle")}</p>
              <p className="text-xs text-ink-soft mb-3">{t("resetConfirmBody")}</p>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setConfirmReset(false)}>{t("keepData")}</Button>
                <Button variant="danger" className="flex-1" onClick={doReset}>{t("reset")}</Button>
              </div>
            </Card>
          )}
        </div>

        <p className="text-center text-[11px] text-ink-soft pt-2">{t("footer")}</p>
      </div>
    </>
  );
}
