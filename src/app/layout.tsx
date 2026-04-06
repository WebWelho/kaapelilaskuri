import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SähköAI — Kaapelimitoitus | SFS 6000",
  description:
    "Laske sulakekoko ja kaapelipoikkipinta SFS 6000 -standardin mukaan. Suomalainen ammattilaisten työkalu.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kaapelimitoitus",
  },
};

export const viewport: Viewport = {
  themeColor: "#22d3ee",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
