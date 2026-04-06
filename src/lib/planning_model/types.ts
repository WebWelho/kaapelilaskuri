// ── Pohjapiirros ──

export interface FloorPlan {
  id: string;
  name: string;
  rooms: Room[];
  /** Kokonaispinta-ala m² */
  totalAreaM2: number;
}

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  /** Pinta-ala m² */
  areaM2: number;
  /** Huoneen sijainti (vasen yläkulma) */
  x: number;
  y: number;
  /** Leveys mm */
  widthMm: number;
  /** Korkeus/syvyys mm */
  depthMm: number;
  /** Seinät */
  walls: Wall[];
  /** Ovet */
  doors: Door[];
  /** Ikkunat */
  windows: WindowOpening[];
}

export type RoomType =
  | "kitchen" // keittiö
  | "living_room" // olohuone
  | "bedroom" // makuuhuone
  | "bathroom" // kylpyhuone
  | "wc" // WC
  | "sauna" // sauna
  | "utility" // kodinhoitohuone
  | "hallway" // eteinen/käytävä
  | "storage" // varasto
  | "garage" // autotalli
  | "laundry" // pesutupa
  | "office" // työhuone
  | "balcony" // parveke/terassi
  | "technical" // tekninen tila
  | "other";

export interface Wall {
  /** Seinän suunta */
  side: "north" | "south" | "east" | "west";
  /** Onko ulkoseinä */
  isExterior: boolean;
  /** Pituus mm */
  lengthMm: number;
}

export interface Door {
  wall: "north" | "south" | "east" | "west";
  /** Etäisyys seinän alusta mm */
  positionMm: number;
  /** Leveys mm */
  widthMm: number;
}

export interface WindowOpening {
  wall: "north" | "south" | "east" | "west";
  positionMm: number;
  widthMm: number;
}

// ── Sähköpisteet ──

export type DeviceType =
  | "outlet" // pistorasia
  | "outlet_dedicated" // oma piiri (liesi, astianpesukone, jne.)
  | "switch" // kytkin
  | "dimmer" // himmennin
  | "light_ceiling" // kattovalaisin
  | "light_wall" // seinävalaisin
  | "light_spot" // spottivalo
  | "light_strip" // LED-nauha
  | "smoke_detector" // palovaroitin
  | "motion_sensor" // liiketunnistin
  | "thermostat" // termostaatti
  | "floor_heating" // lattialämmityksen termostaatti
  | "ev_charger" // EV-lataus
  | "sauna_heater" // kiuasohjain
  | "ventilation" // ilmanvaihdon ohjaus
  | "doorbell" // ovikello
  | "data_outlet" // tietoliikennerasia
  | "tv_outlet" // antennirasia
  | "fuse_box" // ryhmäkeskus
  | "main_fuse_box"; // pääkeskus

export interface ElectricalDevice {
  id: string;
  type: DeviceType;
  roomId: string;
  /** Asennuskorkeus lattiasta mm */
  heightMm: number;
  /** Sijainti huoneessa (suhteellinen 0-1) */
  posX: number;
  posY: number;
  /** Seinäasennus: mikä seinä */
  wall?: "north" | "south" | "east" | "west";
  /** Teho W (valaisimet, kiuas, jne.) */
  powerW?: number;
  /** Piirin tunnus */
  circuitId?: string;
  /** Lisätiedot */
  label: string;
  /** Kosteustila (kylpyhuone/sauna) */
  ipRating?: "IP20" | "IP44" | "IP65";
}

// ── Piirit ja ryhmäjako ──

export type CircuitType =
  | "lighting" // valaistus
  | "outlet" // pistorasiat
  | "dedicated" // oma piiri (liesi, kiuas, ILP, jne.)
  | "heating" // lämmitys
  | "ev"; // EV-lataus

export interface Circuit {
  id: string;
  name: string;
  type: CircuitType;
  /** Ryhmänumero (esim. 1, 2, 3...) */
  groupNumber: number;
  /** Sulakekoko A */
  fuseA: number;
  /** Suojalaitetyyppi */
  protectionType: "gG" | "MCB-B" | "MCB-C";
  /** Kaapelityyppi */
  cableType: string;
  /** Kaapelin poikkipinta mm² */
  crossSectionMm2: number;
  /** Laitteet tässä piirissä */
  deviceIds: string[];
  /** Arvioitu kokonaiskuorma W */
  totalLoadW: number;
}

// ── Sähkösuunnitelma ──

export interface ElectricalPlan {
  id: string;
  floorPlan: FloorPlan;
  devices: ElectricalDevice[];
  circuits: Circuit[];
  /** Pääsulake A */
  mainFuseA: number;
  /** Arvioitu kokonaiskuorma W */
  totalLoadW: number;
  /** Varoitukset */
  warnings: string[];
  /** Huomautukset */
  notes: string[];
}
