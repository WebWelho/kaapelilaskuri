import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SähköAI — Kaapelimitoituslaskuri",
    short_name: "Kaapelimitoitus",
    description:
      "SFS 6000 kaapelimitoituslaskuri sähköurakoitsijoille. Sulake, kaapeli, jännitteenalenema, oikosulkuvirta.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f1a",
    theme_color: "#22d3ee",
    orientation: "portrait-primary",
    categories: ["utilities", "productivity"],
    lang: "fi",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
