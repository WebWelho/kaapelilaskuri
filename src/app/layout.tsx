import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sähkötyökalut — SFS 6000",
  description:
    "Kaapelimitoitus ja sähkösuunnittelu SFS 6000 -standardin mukaan. Sähköalan ammattilaisten apuväline.",
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
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Poista vanha Service Worker + tyhjennä cachet
              // Tämä ajetaan KERRAN jokaisella käyttäjällä
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  regs.forEach(function(r) { r.unregister(); });
                });
              }
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  names.forEach(function(n) { caches.delete(n); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
