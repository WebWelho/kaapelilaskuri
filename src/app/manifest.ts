import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TPCore — Sähkötyökalut",
    short_name: "Sähkötyökalut",
    description:
      "SFS 6000 sähkötyökalut: kaapelimitoitus, sähkösuunnittelu. Sähköalan ammattilaisen apuväline.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f1a",
    theme_color: "#22d3ee",
    orientation: "portrait-primary",
    categories: ["utilities", "productivity"],
    lang: "fi",
    icons: [
      {
        src: "/icon_electric_192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon_electric_512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon_electric_512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
