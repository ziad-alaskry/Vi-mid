import { Icon } from "@/components/icons";

export function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-baseline font-semibold tracking-tight ${className}`}>
      <span className="text-green-primary">Vi</span>
      <span className="text-ink">Med</span>
    </span>
  );
}

export function Avatar({ name = "", size = 44, tone = "green" }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  const tones = {
    green: "bg-green-tint text-green-pressed",
    blue: "bg-[#E2F0F8] text-[#2C6488]",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${tones[tone]}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      dir="rtl"
    >
      {initials}
    </span>
  );
}

export function Stars({ value = 0, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-star">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= Math.round(value) ? 1 : 0.25 }}>
          <Icon name="star" size={size} strokeWidth={1.4} />
        </span>
      ))}
    </span>
  );
}

export function Badge({ children, tone = "tint" }) {
  const tones = {
    tint: "bg-green-tint text-green-pressed",
    blue: "bg-[#E2F0F8] text-[#2C6488]",
    soft: "bg-surface text-ink-soft",
    danger: "bg-[#F7E6E1] text-danger",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Header({ title, subtitle, right, back }) {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-hairline">
      <div className="flex items-center gap-3 px-4 h-14">
        {back}
        <div className="min-w-0 flex-1">
          <h1 className="text-[17px] font-semibold leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-ink-soft truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm h-11 px-4 transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100";
  const variants = {
    primary: "bg-green-primary text-white hover:bg-green-pressed",
    soft: "bg-green-tint text-green-pressed hover:bg-[#d7ebe2]",
    ghost: "bg-surface text-ink hover:bg-[#eaefec]",
    danger: "bg-[#F7E6E1] text-danger hover:bg-[#f1d8d1]",
    outline: "border border-hairline text-ink hover:bg-surface",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function EmptyState({ icon = "calendar", title, hint }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-8">
      <span className="grid place-items-center w-14 h-14 rounded-full bg-surface text-ink-soft mb-3">
        <Icon name={icon} size={26} />
      </span>
      <p className="font-medium text-ink">{title}</p>
      {hint && <p className="text-sm text-ink-soft mt-1 max-w-[260px]">{hint}</p>}
    </div>
  );
}

export function Card({ children, className = "", as = "div", ...props }) {
  const Tag = as;
  return (
    <Tag className={`bg-white border border-hairline rounded-card ${className}`} {...props}>
      {children}
    </Tag>
  );
}
