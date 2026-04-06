import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";

export const maxDuration = 60;

const PROMPT = `Analysoi tämä pohjapiirros tai rakennuskuva. Tunnista huoneet ja arvioi niiden pinta-alat.

Palauta JSON-vastaus TARKASTI tässä muodossa (ei muuta tekstiä):

{
  "rooms": [
    { "type": "kitchen", "name": "Keittiö", "areaM2": 10 },
    { "type": "living_room", "name": "Olohuone", "areaM2": 22 }
  ]
}

Sallitut huonetyypit:
- kitchen (keittiö)
- living_room (olohuone)
- bedroom (makuuhuone)
- bathroom (kylpyhuone)
- wc
- sauna
- utility (kodinhoitohuone)
- hallway (eteinen/käytävä)
- storage (varasto)
- garage (autotalli)
- laundry (pesutupa)
- office (työhuone)
- balcony (parveke/terassi)
- technical (tekninen tila)
- other (muu)

Jos kuvasta ei voi tunnistaa huoneita, palauta tyhjä lista:
{ "rooms": [] }

Arvioi pinta-alat neliömetreinä. Käytä suomenkielisiä nimiä.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json({ error: "Kuva puuttuu" }, { status: 400 });
    }

    // Tarkista onko Vertex AI konfiguroitu
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return NextResponse.json({
        rooms: [],
        confidence: 0,
        message:
          "Vertex AI ei ole konfiguroitu. Lisää GOOGLE_SERVICE_ACCOUNT_KEY ympäristömuuttujiin.",
      });
    }

    const text = await generateContent([
      { text: PROMPT },
      { inlineData: { data: image, mimeType: mimeType || "image/jpeg" } },
    ]);

    // Parsitaan JSON vastauksesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        rooms: [],
        confidence: 0,
        message: "AI ei tunnistanut huoneita kuvasta.",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const rooms = Array.isArray(parsed.rooms) ? parsed.rooms : [];

    return NextResponse.json({
      rooms,
      confidence: rooms.length > 0 ? 0.7 : 0,
      message:
        rooms.length > 0
          ? `Tunnistettu ${rooms.length} huonetta. Tarkista ja muokkaa tarvittaessa.`
          : "AI ei tunnistanut huoneita kuvasta. Kokeile selkeämpää pohjapiirrosta.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Tuntematon virhe";

    // Vertex AI credential -virhe → selkeä viesti
    if (msg.includes("GOOGLE_SERVICE_ACCOUNT_KEY")) {
      return NextResponse.json({
        rooms: [],
        confidence: 0,
        message:
          "Vertex AI ei ole konfiguroitu. Lisää GOOGLE_SERVICE_ACCOUNT_KEY ympäristömuuttujiin.",
      });
    }

    return NextResponse.json(
      { error: `Kuvan analysointi epäonnistui: ${msg}` },
      { status: 500 },
    );
  }
}
