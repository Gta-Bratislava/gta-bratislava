import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://gta-bratislava.pages.dev"),
  title: { default: "GTA_Bratislava", template: "%s · GTA_Bratislava" },
  description: "Predaj, výber, kontrola a financovanie automobilov v Bratislave.",
  applicationName: "GTA_Bratislava",
  openGraph: { type: "website", siteName: "GTA_Bratislava", locale: "sk_SK" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html suppressHydrationWarning><body>{children}</body></html>;
}
