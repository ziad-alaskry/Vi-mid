import { Icon } from "@/components/icons";

export function Logo({ className = "" }) {
  // dir="ltr" pins the wordmark's letter order — a brand name must not
  // mirror with the page direction the way navigational content does.
  return (
    <span dir="ltr" className={`inline-flex items-baseline font-semibold tracking-tight ${className}`}>
      <span className="text-green-primary">Vi</span>
      <span className="text-ink">Med</span>
    </span>
  );
}

export function Avatar({ name = "", size = 44, tone = "green" }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  const tones = {
    green: "bg-green-tint text-green-pressed",
    blue: "bg-blue-tint text-blue-pressed",
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
    blue: "bg-blue-tint text-blue-pressed",
    soft: "bg-surface text-ink-soft",
    danger: "bg-danger-tint text-danger",
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
    soft: "bg-green-tint text-green-pressed hover:bg-green-tintHover",
    ghost: "bg-surface text-ink hover:bg-surfaceHover",
    danger: "bg-danger-tint text-danger hover:bg-danger-tintHover",
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

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`flex-1 bg-transparent outline-none text-sm placeholder:text-ink-soft ${className}`}
      {...props}
    />
  );
}

// Bottom sheet: shared backdrop + drag handle + rounded container.
// className controls the sheet's own layout (padding, max-height, flex).
export function Sheet({ onClose, className = "", children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className={`w-full max-w-app bg-white rounded-t-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-hairline mx-auto mt-3 mb-2 shrink-0" />
        {children}
      </div>
    </div>
  );
}

// Segmented tab switcher: tabs = [{ key, label, badge? }]
export function Tabs({ tabs, active, onChange, textClassName = "text-sm" }) {
  return (
    <div
      className={`grid bg-surface rounded-lg p-1 font-medium ${textClassName}`}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`h-9 rounded-md transition ${active === tab.key ? "bg-white text-green-pressed shadow-sm" : "text-ink-soft"}`}
        >
          {tab.label}
          {tab.badge}
        </button>
      ))}
    </div>
  );
}
