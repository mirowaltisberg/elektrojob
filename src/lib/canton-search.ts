const CANTONS: Record<string, string[]> = {
  ZH: ["Zürich", "Zuerich"], BE: ["Bern", "Berne"], LU: ["Luzern"], UR: ["Uri"],
  SZ: ["Schwyz"], OW: ["Obwalden"], NW: ["Nidwalden"], GL: ["Glarus"], ZG: ["Zug"],
  FR: ["Freiburg", "Fribourg"], SO: ["Solothurn"], BS: ["Basel-Stadt"], BL: ["Basel-Landschaft", "Baselland"],
  SH: ["Schaffhausen"], AR: ["Appenzell Ausserrhoden"], AI: ["Appenzell Innerrhoden"],
  SG: ["St. Gallen", "Sankt Gallen"], GR: ["Graubünden", "Graubuenden"], AG: ["Aargau"],
  TG: ["Thurgau"], TI: ["Tessin", "Ticino"], VD: ["Waadt", "Vaud"], VS: ["Wallis", "Valais"],
  NE: ["Neuenburg", "Neuchâtel"], GE: ["Genf", "Genève"], JU: ["Jura"],
};

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/^kanton\s+/u, "").replace(/[.\s-]+/g, " ").trim();
}

const CANTON_CODES = new Map(Object.entries(CANTONS).flatMap(([code, names]) =>
  [code, ...names].map((name) => [normalize(name), code] as const)
));

/** Exact canton names/codes cover the canton; city suggestions include a comma. */
export function getCantonSearchCode(location: string): string | null {
  return CANTON_CODES.get(normalize(location)) ?? null;
}
