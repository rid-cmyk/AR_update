import type { Metadata } from "next";
import "./globals.css";
import LoaderWrapper from "./Loader";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import AntdPatchProvider from "./AntdPatchProvider";

export const metadata: Metadata = {
  title: "ArHapalan Apps",
  description: "Developed by Hendri Sudianto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-background text-foreground font-sans antialiased"
      >
        <AntdRegistry>
          <AntdPatchProvider>
            <LoaderWrapper >
            {children}
            </LoaderWrapper>
          </AntdPatchProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
