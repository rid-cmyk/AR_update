import type { Metadata, Viewport } from "next";
import "./globals.css";
import LoaderWrapper from "./Loader";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import AntdPatchProvider from "./AntdPatchProvider";
import PWARegistrar from "@/components/pwa/PWARegistrar";
import { Amiri, Amiri_Quran, Scheherazade_New } from "next/font/google";

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
  display: "swap",
});

const amiriQuran = Amiri_Quran({
  weight: ["400"],
  subsets: ["arabic"],
  variable: "--font-amiri-quran",
  display: "swap",
});

const scheherazade = Scheherazade_New({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-scheherazade",
  display: "swap",
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
  themeColor: "#1890ff",
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
    <html lang="id" className={`${amiri.variable} ${amiriQuran.variable} ${scheherazade.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">
        <AntdRegistry>
          <AntdPatchProvider>
            <PWARegistrar />
            <LoaderWrapper>
              {children}
            </LoaderWrapper>
          </AntdPatchProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

