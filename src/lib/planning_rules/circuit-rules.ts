import type { CircuitType } from "@/lib/planning_model/types";

/**
 * Ryhmäjakosäännöt — SFS 6000 + ST 51.22
 */

export interface CircuitTemplate {
  type: CircuitType;
  /** Sulakekoko A */
  fuseA: number;
  /** Suojalaitetyyppi */
  protectionType: "MCB-B" | "MCB-C" | "gG";
  /** Kaapelityyppi */
  cableType: string;
  /** Poikkipinta mm² */
  crossSectionMm2: number;
  /** Max laitteiden määrä per piiri */
  maxDevices: number;
  /** Max kuorma W per piiri */
  maxLoadW: number;
  /** Vikavirtasuoja vaaditaan */
  rcdRequired: boolean;
  /** Vikavirtasuojan laukaisuvirta mA */
  rcdMa?: number;
}

/** Valaistuspiiri — max 10 valaisinta per piiri */
export const LIGHTING_CIRCUIT: CircuitTemplate = {
  type: "lighting",
  fuseA: 10,
  protectionType: "MCB-B",
  cableType: "MMJ",
  crossSectionMm2: 1.5,
  maxDevices: 10,
  maxLoadW: 2300,
  rcdRequired: false,
};

/** Pistorasiapiiri — max 10 pistorasiaa per piiri */
export const OUTLET_CIRCUIT: CircuitTemplate = {
  type: "outlet",
  fuseA: 16,
  protectionType: "MCB-B",
  cableType: "MMJ",
  crossSectionMm2: 2.5,
  maxDevices: 10,
  maxLoadW: 3680,
  rcdRequired: true,
  rcdMa: 30,
};

/** Liesipistoke — 3-vaihe, oma piiri */
export const STOVE_CIRCUIT: CircuitTemplate = {
  type: "dedicated",
  fuseA: 16,
  protectionType: "MCB-C",
  cableType: "MMJ",
  crossSectionMm2: 2.5,
  maxDevices: 1,
  maxLoadW: 11000,
  rcdRequired: false,
};

/** Pesukone/kuivausrumpu — oma piiri */
export const APPLIANCE_CIRCUIT: CircuitTemplate = {
  type: "dedicated",
  fuseA: 16,
  protectionType: "MCB-B",
  cableType: "MMJ",
  crossSectionMm2: 2.5,
  maxDevices: 1,
  maxLoadW: 3680,
  rcdRequired: true,
  rcdMa: 30,
};

/** Lattialämmitys — oma piiri */
export const FLOOR_HEATING_CIRCUIT: CircuitTemplate = {
  type: "heating",
  fuseA: 16,
  protectionType: "MCB-B",
  cableType: "MMJ",
  crossSectionMm2: 2.5,
  maxDevices: 1,
  maxLoadW: 3680,
  rcdRequired: true,
  rcdMa: 30,
};

/** Kiuas — 3-vaihe, oma piiri */
export const SAUNA_HEATER_CIRCUIT: CircuitTemplate = {
  type: "dedicated",
  fuseA: 16,
  protectionType: "MCB-C",
  cableType: "MMJ",
  crossSectionMm2: 2.5,
  maxDevices: 1,
  maxLoadW: 11000,
  rcdRequired: false,
};

/** EV-lataus — 3-vaihe, oma piiri */
export const EV_CHARGER_CIRCUIT: CircuitTemplate = {
  type: "ev",
  fuseA: 20,
  protectionType: "MCB-C",
  cableType: "MMJ",
  crossSectionMm2: 4,
  maxDevices: 1,
  maxLoadW: 11000,
  rcdRequired: true,
  rcdMa: 30,
};

/** Kosteustilan pistorasiapiiri */
export const WET_ROOM_OUTLET_CIRCUIT: CircuitTemplate = {
  type: "outlet",
  fuseA: 16,
  protectionType: "MCB-B",
  cableType: "MMJ",
  crossSectionMm2: 2.5,
  maxDevices: 5,
  maxLoadW: 3680,
  rcdRequired: true,
  rcdMa: 30,
};

/** Ulkopisteet — vikavirtasuoja pakollinen */
export const EXTERIOR_CIRCUIT: CircuitTemplate = {
  type: "outlet",
  fuseA: 16,
  protectionType: "MCB-B",
  cableType: "MMJ",
  crossSectionMm2: 2.5,
  maxDevices: 5,
  maxLoadW: 3680,
  rcdRequired: true,
  rcdMa: 30,
};
