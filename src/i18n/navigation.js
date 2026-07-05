import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link/router: every push/href is auto-prefixed with the
// current locale so app code never hardcodes "/ar" or "/en".
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
