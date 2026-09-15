import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hptf.org"
  ),
  title: {
    default: "Her Plate, Their Future Initiative — Nourishing Women. Nourishing Children.",
    template: "%s | Her Plate, Their Future Initiative",
  },
  description:
    "HPTF Initiative is a Nigerian non-profit improving nutrition, food security and wellbeing among women, girls and children in vulnerable and underserved communities.",
  openGraph: {
    siteName: "Her Plate, Their Future Initiative",
    type: "website",
    images: [
      {
        url: "/logo.jpeg",
        width: 1280,
        height: 1280,
        alt: "Her Plate, Their Future Initiative — Nourishing Women. Nourishing Children.",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-100 focus:top-3 focus:left-3 focus:bg-brand-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to main content
        </a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
