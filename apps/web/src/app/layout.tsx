import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import RecaptchaProvider from "./components/RecaptchaProvider";
import I18nProvider from "./components/I18nProvider";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import CookieConsent from "./components/CookieConsent";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Almez | Medical Care",
    template: "%s | Almez",
  },
  description:
    "Discover Almez medical services, explore our medical sections, and request a consultation with our team.",
  applicationName: "Almez",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <I18nProvider>
          <SiteHeader />

          <RecaptchaProvider>{children}</RecaptchaProvider>

          <SiteFooter />
          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  );
}
