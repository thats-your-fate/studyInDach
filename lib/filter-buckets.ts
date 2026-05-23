export const publicLanguageOptions = ["English", "German", "English + German", "French", "Italian", "Spanish", "Other"]

export function normalizeLanguageBuckets(value: string) {
	const raw = String(value || "")
	const normalized = normalize(raw)
	if (!normalized) return []
	if (/\b(depending|chosen courses|e g|semester|modules? may|varies|various)\b/.test(normalized) && !/\b(english|englisch|ingles|anglais|german|deutsch|alemao|aleman|french|francais|italian|spanish)\b/.test(normalized)) {
		return []
	}
	const languages = uniqueInOrder(splitValues(raw).map(normalizeLanguage).filter(Boolean))
	if (!languages.length) {
		if (normalized.includes("english") || normalized.includes("englisch") || normalized.includes("ingles") || normalized.includes("anglais")) return ["English"]
		if (normalized.includes("german") || normalized.includes("deutsch") || normalized.includes("alemao") || normalized.includes("aleman")) return ["German"]
		return ["Other"]
	}
	const hasEnglish = languages.includes("English")
	const hasGerman = languages.includes("German")
	const buckets = [...languages.filter((language) => publicLanguageOptions.includes(language))]
	if (hasEnglish && hasGerman) buckets.unshift("English + German")
	return uniqueInOrder(buckets.length ? buckets : ["Other"])
}

function splitValues(value: string) {
	return value
		.split(/[;,/|+]+/)
		.map((item) => item.replace(/\s*\(.*?\)\s*/g, "").trim())
		.filter(Boolean)
}

function normalizeLanguage(value: string) {
	const normalized = normalize(value).replace("oe", "o")
	const aliases: Record<string, string> = {
		deutsch: "German",
		allemand: "German",
		german: "German",
		alemao: "German",
		aleman: "German",
		englisch: "English",
		anglais: "English",
		english: "English",
		ingles: "English",
		franzosisch: "French",
		franzoesisch: "French",
		french: "French",
		francais: "French",
		italian: "Italian",
		italiano: "Italian",
		spanish: "Spanish",
		spanisch: "Spanish",
	}
	return aliases[normalized] || ""
}

function uniqueInOrder(values: string[]) {
	const seen = new Set<string>()
	return values.filter((value) => {
		const key = normalize(value)
		if (!key || seen.has(key)) return false
		seen.add(key)
		return true
	})
}

function normalize(value: string) {
	return String(value || "")
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
}
