import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/analyze
 *
 * Ottaa vastaan kuvan (base64) ja palauttaa tunnistetut huoneet.
 * Käyttää Vertex AI Gemini 2.5 Pro:ta (europe-west4).
 *
 * Tämä on placeholder — Gemini-integraatio lisätään kun:
 * 1. Vertex AI credentials on konfiguroitu
 * 2. Gemini 2.5 Pro:n vision-kyky riittää pohjapiirrosten tunnistukseen
 *
 * Syöte: { image: string (base64), mimeType: string }
 * Tulos: { rooms: Array<{ type, name, areaM2 }>, confidence: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json({ error: "Kuva puuttuu" }, { status: 400 });
    }

    // TODO: Vertex AI Gemini 2.5 Pro -integraatio
    // const vertexResponse = await analyzeFloorPlan(image, mimeType);

    // Toistaiseksi palautetaan mock-data joka demonstroi formaattia
    const mockResult = {
      rooms: [
        { type: "kitchen", name: "Keittiö", areaM2: 10 },
        { type: "living_room", name: "Olohuone", areaM2: 22 },
        { type: "bedroom", name: "MH1", areaM2: 13 },
        { type: "bedroom", name: "MH2", areaM2: 10 },
        { type: "bathroom", name: "KPH", areaM2: 5 },
        { type: "hallway", name: "Eteinen", areaM2: 6 },
      ],
      confidence: 0,
      message:
        "Mock-data — Vertex AI Gemini -integraatio ei vielä aktiivinen. " +
        "Gemini 2.5 Pro (europe-west4) tukee pohjapiirrosten analysointia, " +
        "mutta tarkkuus vaihtelee. Gemini 3.x parantaa tuloksia merkittävästi " +
        "mutta ei ole vielä saatavilla EU:ssa.",
    };

    return NextResponse.json(mockResult);
  } catch {
    return NextResponse.json(
      { error: "Kuvan analysointi epäonnistui" },
      { status: 500 },
    );
  }
}
