import "./globals.css";
import { StoreProvider } from "@/lib/store";
import AppChrome from "@/components/AppChrome";

export const metadata = {
  title: "ViMed — connect with HCPs in 120 seconds",
  description: "Scheduled short video visits between healthcare professionals and pharma reps.",
};

export const viewport = {
  themeColor: "#3E7C6A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <StoreProvider>
          <AppChrome>{children}</AppChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
