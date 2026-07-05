import "./globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { StoreProvider } from "@/lib/store";
import AppChrome from "@/components/AppChrome";

export const metadata = {
  title: "ViMed — connect with HCPs in 120 seconds",
  description: "Scheduled short video visits between healthcare professionals and pharma reps.",
};

export const viewport = {
  // Browser chrome color for the address bar; must match --green-primary in globals.css.
  // The metadata API requires a literal here — CSS custom properties aren't resolvable at this layer.
  themeColor: "#3E7C6A",
  width: "device-width",
  initialScale: 1,
  // No maximumScale/userScalable lock — disabling pinch-zoom fails WCAG 1.4.4
  // (Resize Text) and blocks low-vision users from zooming in.
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for this locale in child Server Components.
  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={locale === "ar" ? "font-arabic" : "font-sans"}>
        <NextIntlClientProvider>
          <StoreProvider>
            <AppChrome>{children}</AppChrome>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
