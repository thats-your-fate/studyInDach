import { optionLabel, type PublicLocale } from "@/lib/i18n"
import { normalizeLanguageBuckets } from "@/lib/filter-buckets"

export function joinMetaSegments(values: Array<string | null | undefined>) {
	return values
		.map((value) => cleanDisplayValue(value))
		.filter(Boolean)
		.join(" · ")
}

export function displayLanguageCombination(value: string | null | undefined, locale: PublicLocale, fallbackSeparator = " + ") {
	const raw = cleanDisplayValue(value)
	if (!raw) return ""
	const separator = raw.includes("/") ? " / " : raw.includes("+") ? " + " : fallbackSeparator
	const languages = normalizeLanguageBuckets(raw)
	if (languages.includes("English + German")) return optionLabel("English + German", locale)
	return languages.map((language) => optionLabel(language, locale)).join(separator)
}

export function displayAcademicDegree(value: string | null | undefined) {
	const raw = cleanDisplayValue(value)
	if (!raw) return ""
	const parenthetical = raw.match(/\(([A-Z][A-Za-z. ]{1,12})\)/)?.[1]?.replace(/\s+/g, "")
	if (parenthetical) return parenthetical
	const normalized = normalize(raw)
	if (normalized.includes("master of science")) return "M.Sc."
	if (normalized.includes("bachelor of science")) return "B.Sc."
	if (normalized.includes("master of arts")) return "M.A."
	if (normalized.includes("bachelor of arts")) return "B.A."
	if (normalized.includes("doctor") || normalized.includes("phd")) return "Dr."
	return raw
}

export function displayLocalizedValue(value: string | null | undefined, locale: PublicLocale) {
	const raw = cleanDisplayValue(value)
	return raw ? optionLabel(raw, locale) : ""
}

export function cleanProgramTitleForLocale(value: string, locale: PublicLocale) {
	if (locale === "pt-br") return value.replace(/^Mestre em\s+/i, "Mestrado em ")
	return value
}

export function titleStartsWithDegree(value: string, locale: PublicLocale) {
	const normalized = normalize(value)
	if (!normalized) return false
	const prefixes: Record<PublicLocale, string[]> = {
		en: ["bachelor", "master", "doctorate", "doctoral", "phd", "certificate", "state examination"],
		"pt-br": ["bacharelado", "mestrado", "mestre", "doutorado", "doutoramento", "certificado", "exame estatal"],
		es: ["licenciatura", "maestria", "master", "máster", "doctorado", "certificado", "examen estatal"],
	}
	return prefixes[locale].some((prefix) => normalized === normalize(prefix) || normalized.startsWith(`${normalize(prefix)} `))
}

export function cleanDisplayValue(value: string | null | undefined) {
	const raw = String(value || "").trim()
	if (!raw) return ""
	const normalized = normalize(raw)
	if (!normalized || ["unknown", "n a", "na", "null", "undefined"].includes(normalized)) return ""
	return raw
}

function normalize(value: string) {
	return String(value || "")
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
}
