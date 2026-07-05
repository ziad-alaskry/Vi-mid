import { notFound } from "next/navigation";

// Catches any unmatched path under a valid locale prefix (e.g. /ar/typo) and
// routes it through this segment's not-found.jsx instead of falling through
// to Next's unstyled, untranslated root 404.
export default function CatchAll() {
  notFound();
}
