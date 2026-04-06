import type { RoomType, DeviceType } from "@/lib/planning_model/types";

/**
 * Huonekohtaiset sähköpisteiden minimivaatimukset.
 * Perustuu SFS 6000, ST-kortit (ST 51.22, ST 51.71) ja yleiseen käytäntöön.
 */

export interface DeviceRequirement {
  type: DeviceType;
  /** Vähimmäismäärä */
  minCount: number;
  /** Suositeltu lisämäärä per m² (0 = kiinteä määrä) */
  perM2?: number;
  /** Asennuskorkeus mm */
  heightMm: number;
  /** IP-luokka (kosteustilat) */
  ipRating?: "IP20" | "IP44" | "IP65";
  /** Tarvitseeko oman piirin */
  dedicatedCircuit: boolean;
  /** Teho W (kiinteät laitteet) */
  powerW?: number;
  /** Selite */
  label: string;
}

export interface RoomRequirements {
  roomType: RoomType;
  /** Suomenkielinen nimi */
  nameFi: string;
  /** Vähimmäisvaatimukset */
  devices: DeviceRequirement[];
  /** Kosteustilaluokka (SFS 6000-7-701) */
  moistureZone?: 0 | 1 | 2;
  /** Lattialämmitys oletuksena */
  defaultFloorHeating: boolean;
  /** Huomiot */
  notes: string[];
}

export const ROOM_REQUIREMENTS: Record<RoomType, RoomRequirements> = {
  kitchen: {
    roomType: "kitchen",
    nameFi: "Keittiö",
    devices: [
      {
        type: "outlet",
        minCount: 5,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Pistorasiat (työtaso + yleinen)",
      },
      {
        type: "outlet_dedicated",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: true,
        powerW: 9000,
        label: "Liesipistoke",
      },
      {
        type: "outlet_dedicated",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: true,
        powerW: 2500,
        label: "Astianpesukone",
      },
      {
        type: "outlet_dedicated",
        minCount: 1,
        heightMm: 1100,
        dedicatedCircuit: true,
        powerW: 2000,
        label: "Jääkaappi/pakastin",
      },
      {
        type: "outlet",
        minCount: 1,
        heightMm: 1100,
        dedicatedCircuit: false,
        label: "Mikroaaltouuni",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Yleisvalaistus",
      },
      {
        type: "light_strip",
        minCount: 1,
        heightMm: 1600,
        dedicatedCircuit: false,
        label: "Työtasovalaistus",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin",
      },
      {
        type: "smoke_detector",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Palovaroitin",
      },
    ],
    defaultFloorHeating: false,
    notes: [
      "Liesipistoke aina omalla piirillä (3-vaihe)",
      "Astianpesukone omalla piirillä, vikavirtasuoja 30mA",
      "Työtason pistorasiat vähintään 300mm työtasosta",
    ],
  },

  living_room: {
    roomType: "living_room",
    nameFi: "Olohuone",
    devices: [
      {
        type: "outlet",
        minCount: 4,
        perM2: 0.2,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Pistorasiat",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Kattovalaisin",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin",
      },
      {
        type: "tv_outlet",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Antennirasia",
      },
      {
        type: "data_outlet",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Tietoliikennerasia",
      },
      {
        type: "smoke_detector",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Palovaroitin",
      },
    ],
    defaultFloorHeating: false,
    notes: ["Pistorasioita riittävästi jokaiselle seinälle"],
  },

  bedroom: {
    roomType: "bedroom",
    nameFi: "Makuuhuone",
    devices: [
      {
        type: "outlet",
        minCount: 4,
        perM2: 0.15,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Pistorasiat",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Kattovalaisin",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin (ovi)",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 800,
        dedicatedCircuit: false,
        label: "Yökytkin (sängyn vieressä)",
      },
      {
        type: "data_outlet",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Tietoliikennerasia",
      },
      {
        type: "smoke_detector",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Palovaroitin",
      },
    ],
    defaultFloorHeating: false,
    notes: [
      "Pistorasiat sängyn molemmin puolin",
      "Himmennin makuuhuoneeseen suositeltava",
    ],
  },

  bathroom: {
    roomType: "bathroom",
    nameFi: "Kylpyhuone",
    moistureZone: 1,
    devices: [
      {
        type: "outlet",
        minCount: 1,
        heightMm: 1100,
        ipRating: "IP44",
        dedicatedCircuit: false,
        label: "Pistorasia (peilikaapin yhteys)",
      },
      {
        type: "outlet_dedicated",
        minCount: 1,
        heightMm: 200,
        ipRating: "IP44",
        dedicatedCircuit: true,
        powerW: 2000,
        label: "Pesukone",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        ipRating: "IP44",
        dedicatedCircuit: false,
        label: "Kattovalaisin IP44",
      },
      {
        type: "light_wall",
        minCount: 1,
        heightMm: 1800,
        ipRating: "IP44",
        dedicatedCircuit: false,
        label: "Peili-/seinävalaisin",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin (oven ulkop.)",
      },
      {
        type: "floor_heating",
        minCount: 1,
        heightMm: 1500,
        dedicatedCircuit: true,
        label: "Lattialämmitys",
      },
      {
        type: "ventilation",
        minCount: 1,
        heightMm: 2300,
        dedicatedCircuit: false,
        label: "Poistoilmaventtiili",
      },
    ],
    defaultFloorHeating: true,
    notes: [
      "Kosteustilaluokka 1 — IP44 vähintään",
      "Pistorasiat vähintään 600mm suihkusta (alue 2)",
      "Vikavirtasuoja 30mA kaikissa piireissä",
      "Lattialämmitys omalla termostaatilla ja piirillä",
      "Kytkin oven ulkopuolelle",
    ],
  },

  wc: {
    roomType: "wc",
    nameFi: "WC",
    moistureZone: 2,
    devices: [
      {
        type: "outlet",
        minCount: 1,
        heightMm: 1100,
        dedicatedCircuit: false,
        label: "Pistorasia",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Kattovalaisin",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin",
      },
    ],
    defaultFloorHeating: false,
    notes: ["Jos pesuallas — peili-/seinävalaisin suositeltava"],
  },

  sauna: {
    roomType: "sauna",
    nameFi: "Sauna",
    moistureZone: 1,
    devices: [
      {
        type: "sauna_heater",
        minCount: 1,
        heightMm: 1700,
        ipRating: "IP44",
        dedicatedCircuit: true,
        powerW: 9000,
        label: "Kiuas (3-vaihe)",
      },
      {
        type: "light_wall",
        minCount: 1,
        heightMm: 2000,
        ipRating: "IP44",
        dedicatedCircuit: false,
        label: "Saunavalaisin IP44",
      },
      {
        type: "thermostat",
        minCount: 1,
        heightMm: 1700,
        dedicatedCircuit: false,
        label: "Kiuasohjain (löylyhuoneen ulkop.)",
      },
    ],
    defaultFloorHeating: false,
    notes: [
      "Kiuas AINA omalla piirillä, 3-vaihe",
      "Valaisimet lämpöä kestävät, IP44+",
      "Ei pistorasioita löylyhuoneeseen",
      "Kiuasohjain löylyhuoneen ulkopuolelle",
    ],
  },

  utility: {
    roomType: "utility",
    nameFi: "Kodinhoitohuone",
    devices: [
      {
        type: "outlet",
        minCount: 3,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Pistorasiat",
      },
      {
        type: "outlet_dedicated",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: true,
        powerW: 2500,
        label: "Kuivausrumpu",
      },
      {
        type: "outlet_dedicated",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: true,
        powerW: 2000,
        label: "Pesukone",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Kattovalaisin",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin",
      },
    ],
    defaultFloorHeating: false,
    notes: ["Vikavirtasuoja pesukoneen ja kuivausrummun piireissä"],
  },

  hallway: {
    roomType: "hallway",
    nameFi: "Eteinen/käytävä",
    devices: [
      {
        type: "outlet",
        minCount: 2,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Pistorasiat",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Kattovalaisin",
      },
      {
        type: "switch",
        minCount: 2,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Vaihtokytkin (molemmat päät)",
      },
      {
        type: "smoke_detector",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Palovaroitin",
      },
      {
        type: "doorbell",
        minCount: 1,
        heightMm: 1500,
        dedicatedCircuit: false,
        label: "Ovikello (ulko-ovi)",
      },
    ],
    defaultFloorHeating: false,
    notes: ["Pitkissä käytävissä vaihtokytkimet molempiin päihin"],
  },

  storage: {
    roomType: "storage",
    nameFi: "Varasto",
    devices: [
      {
        type: "outlet",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Pistorasia",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Kattovalaisin",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin",
      },
    ],
    defaultFloorHeating: false,
    notes: [],
  },

  garage: {
    roomType: "garage",
    nameFi: "Autotalli",
    devices: [
      {
        type: "outlet",
        minCount: 2,
        heightMm: 1100,
        ipRating: "IP44",
        dedicatedCircuit: false,
        label: "Pistorasiat IP44",
      },
      {
        type: "outlet_dedicated",
        minCount: 1,
        heightMm: 500,
        dedicatedCircuit: true,
        powerW: 2000,
        label: "Lohkolämmitin (auton)",
      },
      {
        type: "ev_charger",
        minCount: 1,
        heightMm: 1200,
        dedicatedCircuit: true,
        powerW: 11000,
        label: "EV-lataus (varaus)",
      },
      {
        type: "light_ceiling",
        minCount: 2,
        heightMm: 2500,
        ipRating: "IP44",
        dedicatedCircuit: false,
        label: "Loisteputki/LED IP44",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin",
      },
      {
        type: "smoke_detector",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Palovaroitin",
      },
    ],
    defaultFloorHeating: false,
    notes: [
      "EV-latausvaraus suositeltava uudisrakentamisessa (EU-velvoite)",
      "IP44 kaikissa pisteissä (pöly + kosteus)",
    ],
  },

  laundry: {
    roomType: "laundry",
    nameFi: "Pesutupa",
    moistureZone: 2,
    devices: [
      {
        type: "outlet_dedicated",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: true,
        powerW: 2000,
        label: "Pesukone",
      },
      {
        type: "outlet_dedicated",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: true,
        powerW: 2500,
        label: "Kuivausrumpu",
      },
      {
        type: "outlet",
        minCount: 2,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Yleispistorasiat",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Kattovalaisin",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin",
      },
    ],
    defaultFloorHeating: false,
    notes: ["Vikavirtasuoja 30mA kaikissa piireissä"],
  },

  office: {
    roomType: "office",
    nameFi: "Työhuone",
    devices: [
      {
        type: "outlet",
        minCount: 4,
        perM2: 0.3,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Pistorasiat",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Kattovalaisin",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin",
      },
      {
        type: "data_outlet",
        minCount: 2,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Tietoliikennerasiat",
      },
    ],
    defaultFloorHeating: false,
    notes: [
      "Riittävästi pistorasioita työpisteelle (tietokone, näytöt, tulostin)",
    ],
  },

  balcony: {
    roomType: "balcony",
    nameFi: "Parveke/terassi",
    devices: [
      {
        type: "outlet",
        minCount: 1,
        heightMm: 300,
        ipRating: "IP44",
        dedicatedCircuit: false,
        label: "Ulkopistorasia IP44",
      },
      {
        type: "light_wall",
        minCount: 1,
        heightMm: 2200,
        ipRating: "IP44",
        dedicatedCircuit: false,
        label: "Ulkovalaisin IP44",
      },
    ],
    defaultFloorHeating: false,
    notes: ["IP44 vähintään kaikille ulkopisteille", "Vikavirtasuoja 30mA"],
  },

  technical: {
    roomType: "technical",
    nameFi: "Tekninen tila",
    devices: [
      {
        type: "outlet",
        minCount: 2,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Pistorasiat",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Kattovalaisin",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin",
      },
      {
        type: "fuse_box",
        minCount: 1,
        heightMm: 1500,
        dedicatedCircuit: false,
        label: "Ryhmäkeskus",
      },
    ],
    defaultFloorHeating: false,
    notes: [
      "Ryhmäkeskuksen edessä vähintään 800mm vapaata tilaa",
      "Huomio ilmanvaihtokoneen sähköliitäntä",
    ],
  },

  other: {
    roomType: "other",
    nameFi: "Muu tila",
    devices: [
      {
        type: "outlet",
        minCount: 1,
        heightMm: 200,
        dedicatedCircuit: false,
        label: "Pistorasia",
      },
      {
        type: "light_ceiling",
        minCount: 1,
        heightMm: 2500,
        dedicatedCircuit: false,
        label: "Kattovalaisin",
      },
      {
        type: "switch",
        minCount: 1,
        heightMm: 1000,
        dedicatedCircuit: false,
        label: "Valaistuskytkin",
      },
    ],
    defaultFloorHeating: false,
    notes: [],
  },
};
