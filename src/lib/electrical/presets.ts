import type { CalcInput } from "./types";

export interface Preset {
  id: string;
  name: string;
  icon: string;
  description: string;
  input: Partial<CalcInput>;
}

export const PRESETS: Preset[] = [
  {
    id: "uuni",
    name: "Uuni / liesi",
    icon: "🍳",
    description: "Sähköliesi tai uuni, tyypillisesti 7–10 kW",
    input: {
      powerW: 9000,
      phase: "3-phase",
      cosPhi: 1.0,
      installMethod: "A2",
      cableLengthM: 15,
      loadType: "general",
      protectionType: "MCB-C",
    },
  },
  {
    id: "kiuas",
    name: "Kiuas",
    icon: "🧖",
    description: "Sähkökiuas, tyypillisesti 6–10,5 kW",
    input: {
      powerW: 9000,
      phase: "3-phase",
      cosPhi: 1.0,
      installMethod: "C",
      cableLengthM: 20,
      loadType: "general",
      protectionType: "MCB-C",
    },
  },
  {
    id: "ev",
    name: "EV-lataus",
    icon: "🔌",
    description: "Sähköauton lataus, 3.7–22 kW",
    input: {
      powerW: 11000,
      phase: "3-phase",
      cosPhi: 1.0,
      installMethod: "C",
      cableLengthM: 25,
      loadType: "general",
      protectionType: "MCB-C",
    },
  },
  {
    id: "pistorasia",
    name: "Pistorasiapiiri",
    icon: "🔲",
    description: "Yleispistorasiat, max 16 A",
    input: {
      powerW: 3680,
      phase: "1-phase",
      cosPhi: 1.0,
      installMethod: "A2",
      cableLengthM: 20,
      loadType: "general",
      protectionType: "MCB-B",
    },
  },
  {
    id: "valaistus",
    name: "Valaistus",
    icon: "💡",
    description: "Valaistuspiiri, 10 A",
    input: {
      powerW: 1500,
      phase: "1-phase",
      cosPhi: 0.95,
      installMethod: "A1",
      cableLengthM: 25,
      loadType: "lighting",
      protectionType: "MCB-B",
    },
  },
  {
    id: "lattialammitys",
    name: "Lattialämmitys",
    icon: "🌡️",
    description: "Sähköinen lattialämmitys, 1–6 kW",
    input: {
      powerW: 3000,
      phase: "1-phase",
      cosPhi: 1.0,
      installMethod: "A1",
      cableLengthM: 15,
      loadType: "general",
      protectionType: "MCB-B",
    },
  },
  {
    id: "lamminvesivaraaja",
    name: "Lämminvesivaraaja",
    icon: "🚿",
    description: "Varaajan vastus, 3–6 kW",
    input: {
      powerW: 3000,
      phase: "1-phase",
      cosPhi: 1.0,
      installMethod: "C",
      cableLengthM: 10,
      loadType: "general",
      protectionType: "MCB-B",
    },
  },
  {
    id: "ilmalampopumppu",
    name: "Ilmalämpöpumppu",
    icon: "❄️",
    description: "ILP ulkoyksikkö, 1–3 kW",
    input: {
      powerW: 2500,
      phase: "1-phase",
      cosPhi: 0.85,
      installMethod: "C",
      cableLengthM: 15,
      loadType: "general",
      protectionType: "MCB-C",
    },
  },
];
