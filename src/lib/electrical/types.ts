/** Vaihejärjestelmä */
export type Phase = "1-phase" | "3-phase";

/** SFS 6000 asennustavat */
export type InstallMethod =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C"
  | "D1"
  | "D2"
  | "E"
  | "F"
  | "G";

/** Kaapelin poikkipinta mm² */
export type CrossSection =
  | 1.5
  | 2.5
  | 4
  | 6
  | 10
  | 16
  | 25
  | 35
  | 50
  | 70
  | 95
  | 120
  | 150
  | 185
  | 240;

/** Kaapelityypit */
export type CableType = "MMJ" | "MCMK" | "AXMK" | "MK";

/** Kuormatyyppi (vaikuttaa jännitteenalenemarajaan) */
export type LoadType = "general" | "lighting";

/** Laskurin syötteet */
export interface CalcInput {
  /** Teho watteina */
  powerW: number;
  /** Vaihejärjestelmä */
  phase: Phase;
  /** Tehokerroin (0.1–1.0) */
  cosPhi: number;
  /** Asennustapa */
  installMethod: InstallMethod;
  /** Kaapelin pituus metreinä */
  cableLengthM: number;
  /** Ympäristölämpötila °C */
  ambientTempC: number;
  /** Vierekkäisten piirien lukumäärä */
  groupedCircuits: number;
  /** Kuormatyyppi */
  loadType: LoadType;
}

/** Laskurin tulos */
export interface CalcResult {
  /** Kuormitusvirta (A) */
  currentA: number;
  /** Sulakekoko (A) */
  fuseA: number;
  /** Kaapelin poikkipinta (mm²) */
  crossSectionMm2: CrossSection;
  /** Suositeltu kaapelityyppi */
  cableType: CableType;
  /** Kaapelin kuvaus */
  cableDescription: string;
  /** Jännitteenalenema (%) */
  voltageDropPercent: number;
  /** Jännitteenaleneman raja (%) */
  voltageDropLimit: number;
  /** Onko jännitteenalenema ok */
  voltageDropOk: boolean;
  /** Korjattu kuormitettavuusvaatimus (A) */
  correctedCapacityA: number;
  /** Kaapelin todellinen kuormitettavuus (A) */
  actualCapacityA: number;
  /** Lämpötilakerroin */
  tempCorrectionFactor: number;
  /** Ryhmityskerroin */
  groupCorrectionFactor: number;
  /** Varoitukset */
  warnings: string[];
}
