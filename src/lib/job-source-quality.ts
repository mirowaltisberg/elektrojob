import { cleanJobText } from "./job-text-clean";
import { parseSwissJobAddress } from "./job-schema";
import { SWISS_POSTAL_CODES } from "./swiss-postal-codes";

interface SourceJob {
  title: string;
  company: string;
  location: string;
  fullDescription: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

const NUMBER = "(?:100|[1-9]\\d?)";
const WORKLOAD_VALUE = new RegExp(`(?<![\\d.])(${NUMBER})(?:\\s*%?\\s*[-–—]\\s*(${NUMBER}))?\\s*%(?!\\d)`);
const WORKLOAD_LABEL = /(?:Pensum|Arbeitspensum|Beschäftigungsgrad)[:\s]*(?:von\s+|beträgt\s+)?([\d\s%–—-]+)/iu;

function parseWorkload(value: string): string {
  const match = value.match(WORKLOAD_VALUE);
  if (!match) return "";
  const low = Number(match[1]);
  const high = match[2] ? Number(match[2]) : null;
  if (high !== null) return low <= high ? `${low}-${high}%` : "";
  if (/\d+\s*%?\s*[-–—]\s*\d+\s*%/u.test(value)) return "";
  return `${low}%`;
}

export function getVerifiedWorkload(title: string, description: string): string {
  // The role title and an explicitly labelled workload outrank unrelated body
  // percentages such as employee discounts, commissions or pension benefits.
  if (/%/u.test(title)) return parseWorkload(title);
  const labelled = description.slice(0, 1500).match(WORKLOAD_LABEL)?.[1];
  return labelled ? parseWorkload(labelled) : "";
}

export function getVerifiedEmploymentType(title: string, description: string): string {
  const labelled = description.match(/(?:Anstellungsart|Vertragsart|Beschäftigungsart)[:\s]*([^\n.!?]{1,80})/iu)?.[1];
  const value = labelled || title;
  if (/\b(?:kein\w*|nicht|ohne)\b/iu.test(value)) return "";
  const possibilities = [
    { pattern: /\bteilzeit\b/iu, type: "Teilzeit" },
    { pattern: /\bvollzeit\b/iu, type: "Vollzeit" },
    { pattern: /\b(?:temporär|befristet)\b/iu, type: "Temporär" },
    { pattern: /\b(?:festanstellung|unbefristet)\b/iu, type: "Festanstellung" },
    { pattern: /\bpraktikum\b/iu, type: "Praktikum" },
  ].filter((entry) => entry.pattern.test(value));
  return possibilities.length === 1 ? possibilities[0].type : "";
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("de-CH");
}

function localityKey(value: string): string {
  return normalize(value.replace(/\([^)]*\)/g, "").replace(/\s+[A-Z]{2}$/u, "")).trim();
}

export function isElectricalSourceRole(title: string): boolean {
  const normalized = normalize(title);
  const electrical = /elektr(?:o|i)|automatiker|automatikmonteur|telematik|schaltanlag|schaltschrank|photovoltaik|gebaudeautomat|gebaeudeautomat|mechatron|solarteur/u;
  const anotherTrade = /e-business|ecommerce|e-commerce|source.to.pay|beschaffung|procurement|rechnungsprozess|software|holzfeuer|fernwarme|warmeprojekt|heizung|heizungs|\bhlk\b/u;
  return electrical.test(normalized) && !anotherTrade.test(normalized);
}

function isCompleteSourceItem(item: string): boolean {
  if (/^[a-zäöü]/u.test(item)) return false;
  if (/[-–—:]\s*$/u.test(item)) return false;
  if (/\b(?:und|oder|sowie|mit|bei|von|zu|zur|zum|der|die|das|den|dem|des|einer|einem|einen|unser(?:e[rmns]?)?|auf|im|in|für|bis|als|auch|bzw)\s*\.?$/iu.test(item)) return false;
  if (/\b[A-ZÄÖÜ][a-zäöü]$/u.test(item)) return false;
  if (/\b[A-ZÄÖÜ]?[a-zäöü]{1,3}-[a-zäöü]{4,}\b/u.test(item)) return false;
  if ((item.match(/\(/g)?.length ?? 0) !== (item.match(/\)/g)?.length ?? 0)) return false;
  return true;
}

function isTaskItem(item: string): boolean {
  return /install|konfigur|wart|unterhalt|störung|stoerung|fehlersuch|beheb|prüf|pruef|mess|montage|montier|aufbau|inbetrieb|verdraht|verleg|anschliess|anschließ|plan|projekt|umsetz|ausführ|ausfuehr|dokument|schema|sicherstell|kontroll|koordin|überwach|ueberwach|verantwort|betreu|analys|optimier|erstell|fertig|lehr|lernend|ausbild|anleit|führ|fuehr|erkenn|nachführ|nachfuehr|berechn|entwickl/iu.test(item);
}

function isRequirementItem(item: string): boolean {
  if (/^(?:Persönlichkeit\s*&\s*Arbeitsweise|Fachkompetenz|Dein Profil|Ihr Profil|Das bringst du mit)\s*:?$/iu.test(item)) return false;
  if (/abwechslungsreich|ferientag|personalrestaurant|rabatt|entlohnung|gehalt|lohn|sozialleistung|wir bieten/iu.test(item)) return false;
  return /abgeschlossen|ausbildung|berufslehre|\befz\b|\beba\b|diplom|abschluss|studium|bachelor|master|erfahrung|kenntnis|qualifikation|fähigkeit|fahrausweis|führerschein|deutsch|französisch|englisch|teamfähigkeit|teamgeist|arbeitsweise|bereitschaft|selbstständig|selbständig|zuverlässig|verantwortungs|qualitätsbewusstsein|belastbar|sorgfältig|lernfreude|interesse|verständnis/iu.test(item);
}

const PUBLIC_LOCATIONS = new Map<string, string>();
for (const entry of Object.values(SWISS_POSTAL_CODES)) {
  const region = parseSwissJobAddress(`${entry.canton}, Schweiz`).addressRegion;
  if (!region) continue;
  for (const municipality of entry.municipality.split(",")) {
    const cleanMunicipality = municipality.trim();
    PUBLIC_LOCATIONS.set(`${localityKey(cleanMunicipality)}@${region}`,
      cleanMunicipality === entry.canton ? cleanMunicipality : `${cleanMunicipality}, ${entry.canton}`);
  }
}

export function getPublicJobLocation(location: string): string {
  const address = parseSwissJobAddress(location);
  if (!address.addressLocality || !address.addressRegion) return "Schweiz";
  return PUBLIC_LOCATIONS.get(`${localityKey(address.addressLocality)}@${address.addressRegion}`) ?? "Schweiz";
}

// Drop whole source items containing identifying/contact material rather than
// replacing fragments and risking a changed meaning or leaking a source link.
export function sanitizeSourceItems(items: string[], company: string, sourceDescription?: string): string[] {
  const genericEmployerWords = new Set(["elektro", "elektrotechnik", "technik", "personal", "services", "service", "schweiz", "swiss", "gmbh", "holding", "group"]);
  const employer = normalize(cleanJobText(company));
  const employerTokens = employer.split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 3 && !genericEmployerWords.has(token));
  const normalizedSource = sourceDescription === undefined ? null : normalize(cleanJobText(sourceDescription));
  const unique = new Set<string>();
  for (const raw of Array.isArray(items) ? items : []) {
    if (typeof raw !== "string") continue;
    if (/@|https?:|www\.|\[[^\]]+\]\(|<\/?\w|\b(?:tel|telefon|kontakt|ansprech\w*|bewerb\w*|unterlagen|dossier|sende\w*|fragen|informationen|personalabteilung|personaldienstleister|kandidaten|recruiting|recruiter|herr|frau|freuen|benefits|freiheitsgrad)\b/iu.test(raw)) continue;
    const item = cleanJobText(raw);
    if (/(?:[\p{L}\d-]+\.)+[\p{L}]{2,}(?=$|[^\p{L}])|(?:\[|\()(?:at|dot)(?:\]|\))|&#?\w+;/iu.test(item)) continue;
    if (normalizedSource !== null && !normalizedSource.includes(normalize(item))) continue;
    if (item.length < 25 || item.length > 500) continue;
    if (!isCompleteSourceItem(item)) continue;
    if (/(?:\+\s*\d|\b0\d{2}[\s/.-]?\d|\b\d{3}[\s/.-]\d{2}[\s/.-]\d{2}\b)|\b(?:AG|GmbH|SA|Sàrl|Ltd|Inc)\b/iu.test(item)) continue;
    if (/\b\S*(?:strasse|str\.|weg|gasse)\s+\d+/iu.test(item)) continue;
    if (/\b(?:bei|mit|von|durch|an)\s+[A-ZÄÖÜ][a-zäöü]{2,}\s+[A-ZÄÖÜ][a-zäöü]{2,}\b/u.test(item)) continue;
    if (/^[A-ZÄÖÜ][a-zäöü]{2,}\s+[A-ZÄÖÜ][a-zäöü]{2,}(?:,|\s+(?:steht|begleitet|unterstützt|freut|hilft|ist|beantwortet|zeigt|führt))/u.test(item)) continue;
    if ((employer && normalize(item).includes(employer)) || employerTokens.some((token) => normalize(item).includes(token))) continue;
    unique.add(item);
  }
  return [...unique].slice(0, 6);
}

export function getVerifiedJobDetails(job: SourceJob, publicTitle: string) {
  const sourceDescription = job.fullDescription || job.description;
  const workload = getVerifiedWorkload(job.title, sourceDescription);
  const type = getVerifiedEmploymentType(job.title, sourceDescription);
  const responsibilities = sanitizeSourceItems(job.responsibilities, job.company, sourceDescription).filter(isTaskItem);
  const requirements = sanitizeSourceItems(job.requirements, job.company, sourceDescription).filter(isRequirementItem);
  const publicLocation = getPublicJobLocation(job.location);
  const address = parseSwissJobAddress(publicLocation);
  const specificLocation = Boolean(address.addressLocality && address.addressRegion &&
    !/\b(?:region|schweiz|ganze|diverse|verschiedene)\b/iu.test(job.location));
  const hasVerifiedDetails = Boolean(
    isElectricalSourceRole(job.title) && publicTitle !== "Elektro-Fachkraft" && specificLocation && workload &&
    sourceDescription.length >= 300 && responsibilities.length >= 2 && requirements.length >= 2
  );
  return { workload, type, responsibilities, requirements, hasVerifiedDetails, location: publicLocation };
}
