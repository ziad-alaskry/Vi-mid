"use client";

import { useStore } from "@/lib/store";
import { Header, Card, Badge, Button } from "@/components/ui";
import { Icon } from "@/components/icons";

const PARTNERS = [
  {
    name: "Jarir", wordmark: "Jarir", color: "#0B5FA5", tint: "#E6F0F9",
    url: "https://www.jarir.com",
    offers: [{ label: "SAR 50 voucher", cost: 500 }, { label: "SAR 150 voucher", cost: 1400 }],
  },
  {
    name: "extra", wordmark: "eXtra", color: "#E2231A", tint: "#FBE9E8",
    url: "https://www.extra.com/en-sa/",
    offers: [{ label: "SAR 75 e-card", cost: 700 }, { label: "SAR 200 e-card", cost: 1800 }],
  },
];

export default function LoyaltyPage() {
  const { state } = useStore();
  const points = state.loyaltyPoints;

  return (
    <>
      <Header title="Loyalty" subtitle="Earn points, redeem rewards" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        {/* points hero */}
        <Card className="p-5 bg-green-primary border-green-primary text-white overflow-hidden relative">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <p className="text-sm text-white/80">Your balance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-semibold tabular-nums">{points.toLocaleString()}</span>
            <span className="text-white/80">points</span>
          </div>
          <p className="text-xs text-white/70 mt-2">+15 points for each completed visit</p>
        </Card>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-2 px-1">Redeem with partners</p>
          <div className="space-y-3">
            {PARTNERS.map((p) => (
              <Card key={p.name} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="inline-grid place-items-center h-9 px-3 rounded-lg font-semibold tracking-tight"
                    style={{ background: p.tint, color: p.color }}
                  >
                    {p.wordmark}
                  </span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-ink-soft inline-flex items-center gap-1"
                  >
                    Visit store <Icon name="chevronRight" size={14} />
                  </a>
                </div>
                <div className="space-y-2">
                  {p.offers.map((o) => {
                    const can = points >= o.cost;
                    return (
                      <div key={o.label} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon name="gift" size={18} className="text-green-primary shrink-0" />
                          <span className="text-sm truncate">{o.label}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge tone="soft">{o.cost.toLocaleString()} pts</Badge>
                          <Button variant={can ? "soft" : "ghost"} className="h-8 px-3 text-xs" disabled={!can}>
                            Redeem
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
          <p className="text-[11px] text-ink-soft mt-3 px-1">
            Partner logos shown as placeholders. Official assets and live redemption go live once partnerships are signed.
          </p>
        </div>
      </div>
    </>
  );
}
