import { optionLabel, type PublicLocale } from "@/lib/i18n"

export function formatUniversityProgramCount(count: number, locale: PublicLocale = "en") {
	if (locale === "pt-br") {
		return count === 1 ? "1 programa no banco de dados" : `${count} programas no banco de dados`
	}
	if (locale === "es") {
		return count === 1 ? "1 programa en la base de datos" : `${count} programas en la base de datos`
	}
	return count === 1 ? "1 program in database" : `${count} programs in database`
}

export function formatLocation(
	city: string | null | undefined,
	state: string | null | undefined,
	country: string | null | undefined,
	locale: PublicLocale = "en",
) {
	const localizedParts = [city, state, country]
		.map((part) => localizedLocationPart(part, locale))
		.filter(Boolean)

	const deduped: string[] = []
	for (const part of localizedParts) {
		if (!deduped.some((existing) => equivalentLocation(existing, part))) {
			deduped.push(part)
		}
	}

	return deduped.join(", ")
}

function localizedLocationPart(value: string | null | undefined, locale: PublicLocale) {
	const trimmed = String(value || "").trim()
	if (!trimmed) return ""
	return optionLabel(trimmed, locale)
}

function equivalentLocation(left: string, right: string) {
	return normalizeLocation(left) === normalizeLocation(right)
}

function normalizeLocation(value: string) {
	return value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}
