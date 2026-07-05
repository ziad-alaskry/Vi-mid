// Minimal inline icon set (stroke = currentColor)
export function Icon({ name, size = 22, className = "", strokeWidth = 1.7 }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
    className,
  };
  const P = paths[name] || paths.dot;
  return <svg {...common}>{P}</svg>;
}

const paths = {
  calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" /></>,
  gift: <><rect x="3.5" y="9" width="17" height="11.5" rx="1.5" /><path d="M2.5 9h19M12 9v11.5M12 9s-1.5-5-4.2-4.6C5.8 4.7 6 7.6 8.4 9M12 9s1.5-5 4.2-4.6C18.2 4.7 18 7.6 15.6 9" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M5 20c.8-3.6 3.7-5.4 7-5.4s6.2 1.8 7 5.4" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.6-3.6" /></>,
  star: <><path d="M12 3.5l2.6 5.3 5.9.86-4.25 4.14 1 5.86L12 17.1l-5.25 2.76 1-5.86L3.5 9.66l5.9-.86z" /></>,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  video: <><rect x="2.5" y="6" width="13" height="12" rx="2.5" /><path d="m15.5 10 6-3.2v10.4l-6-3.2z" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /></>,
  micOff: <><path d="M9 4.5A3 3 0 0 1 15 5v5M15 13.5a3 3 0 0 1-4.5 1.6M5.5 11.5a6.5 6.5 0 0 0 9.7 5.6M12 18v3M4 4l16 16" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8z" />,
  pin: <><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  refresh: <><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" /><path d="M21 4v4h-4M21 12a9 9 0 0 1-15.5 6.2L3 16" /><path d="M3 20v-4h4" /></>,
  send: <path d="M4 12 20 4l-6 16-3.5-6.5z" />,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M17.7 6.3l-2.5 2.5M8.8 15.2l-2.5 2.5" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  dot: <circle cx="12" cy="12" r="2" />,
  logout: <><path d="M9 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H9" /><path d="M15 12H9M17 8l4 4-4 4" /></>,
  pencil: <><path d="M4 20h4l10-10-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>,
  chart: <><path d="M4 20V10M12 20V4M20 20v-7" /><path d="M2.5 20h19" /></>,
};
