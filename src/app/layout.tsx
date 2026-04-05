import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SähköAI — Kaapelimitoitus | SFS 6000",
  description:
    "Laske sulakekoko ja kaapelipoikkipinta SFS 6000 -standardin mukaan. Suomalainen ammattilaisten työkalu.",
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
