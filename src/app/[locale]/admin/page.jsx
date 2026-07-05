"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useStore } from "@/lib/store";
import { hcpById } from "@/lib/seed";
import { Header, Card } from "@/components/ui";

export default function AdminPage() {
  const t = useTranslations("admin");
  const { state } = useStore();

  const metrics = useMemo(() => {
    const bookings = state.bookings;
    const total = bookings.length;
    const done = bookings.filter((b) => b.status === "done");
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const completionRate = total > 0 ? Math.round((done.length / total) * 100) : 0;

    const ratings = done.flatMap((b) => [b.hcpRating, b.repRating].filter(Boolean));
    const avgRating = ratings.length
      ? Math.round((ratings.reduce((a, c) => a + c, 0) / ratings.length) * 10) / 10
      : null;

    const byCity = {};
    const bySpecialty = {};
    for (const b of bookings) {
      const hcp = hcpById(b.hcpId);
      if (!hcp) continue;
      byCity[hcp.city] = (byCity[hcp.city] || 0) + 1;
      const specialty = hcp.specialty || hcp.role;
      bySpecialty[specialty] = (bySpecialty[specialty] || 0) + 1;
    }

    return {
      total,
      completed: done.length,
      cancelled,
      completionRate,
      avgRating,
      byCity: Object.entries(byCity).sort((a, b) => b[1] - a[1]),
      bySpecialty: Object.entries(bySpecialty).sort((a, b) => b[1] - a[1]),
    };
  }, [state.bookings]);

  return (
    <>
      <Header title={t("title")} subtitle={t("subtitle")} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label={t("totalVisits")} value={metrics.total} />
          <KpiCard label={t("completed")} value={metrics.completed} />
          <KpiCard label={t("cancelled")} value={metrics.cancelled} />
          <KpiCard label={t("completionRate")} value={`${metrics.completionRate}%`} />
        </div>

        <Card className="p-4">
          <p className="text-sm text-ink-soft">{t("avgRating")}</p>
          <p className="text-2xl font-semibold mt-1">{metrics.avgRating ?? t("noRatingsYet")}</p>
        </Card>

        {metrics.total === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-ink-soft text-center">{t("noData")}</p>
          </Card>
        ) : (
          <>
            <BreakdownCard title={t("byCity")} rows={metrics.byCity} />
            <BreakdownCard title={t("bySpecialty")} rows={metrics.bySpecialty} />
          </>
        )}

        <Card className="p-4">
          <p className="text-sm font-medium mb-3">{t("surveyClicks")}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">{t("hcpClicks")}</span>
            <span className="font-semibold tabular-nums">{state.surveyClicks.hcp}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-ink-soft">{t("repClicks")}</span>
            <span className="font-semibold tabular-nums">{state.surveyClicks.rep}</span>
          </div>
        </Card>
      </div>
    </>
  );
}

function KpiCard({ label, value }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="text-2xl font-semibold mt-1 tabular-nums">{value}</p>
    </Card>
  );
}

function BreakdownCard({ title, rows }) {
  const total = rows.reduce((sum, [, count]) => sum + count, 0) || 1;
  return (
    <Card className="p-4">
      <p className="text-sm font-medium mb-3">{title}</p>
      <div className="space-y-2.5">
        {rows.slice(0, 6).map(([label, count]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-ink">{label}</span>
              <span className="text-ink-soft">{count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
              <div className="h-full bg-green-primary rounded-full" style={{ width: `${(count / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
