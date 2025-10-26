import type { Metadata } from "next";
import "./globals.css";
import LoaderWrapper from "./Loader";
import { AntdRegistry } from '@ant-design/nextjs-registry';

// Import React 19 compatibility patch for Ant Design
import '@ant-design/v5-patch-for-react-19';


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
          <LoaderWrapper >
          {children}
          </LoaderWrapper>
        </AntdRegistry>
      </body>
    </html>
  );
}
