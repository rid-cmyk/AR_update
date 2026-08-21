import type { Metadata, Viewport } from "next";
import "./globals.css";
import LoaderWrapper from "./Loader";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App as AntdApp } from 'antd';
import AntdPatchProvider from "./AntdPatchProvider";
import PWARegistrar from "@/components/pwa/PWARegistrar";
import { Amiri, Amiri_Quran, Scheherazade_New, Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  preload: true,
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
  display: "swap",
  preload: true,
});

const amiriQuran = Amiri_Quran({
  weight: ["400"],
  subsets: ["arabic"],
  variable: "--font-amiri-quran",
  display: "swap",
  preload: false,
});

const scheherazade = Scheherazade_New({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-scheherazade",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "AR-Hafalan Apps - Monitoring Hafalan Quran",
  description: "Sistem Monitoring Hafalan Al-Quran Berbasis Progressive Web App (PWA)",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AR-Hafalan",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#219ebc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${amiri.variable} ${amiriQuran.variable} ${scheherazade.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">
        <AntdRegistry>
          <AntdPatchProvider>
            <AntdApp>
              <PWARegistrar />
              <LoaderWrapper>
                {children}
              </LoaderWrapper>
            </AntdApp>
          </AntdPatchProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

