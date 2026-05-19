export type InquiryAttribution = {
	sourcePath: string | null
	referrer: string | null
	utmSource: string | null
	utmMedium: string | null
	utmCampaign: string | null
	landingPath: string | null
}

export function inquiryAttributionFromForm(formData: FormData, fallbackPath: string, requestReferrer?: string | null): InquiryAttribution {
	const referrer = cleanText(field(formData, "referrer") || requestReferrer || "", 1000)
	const sourcePath = cleanPath(field(formData, "sourcePath")) || fallbackPath
	const landingPath = cleanPath(field(formData, "landingPath")) || pathFromReferrer(referrer) || sourcePath

	return {
		sourcePath,
		referrer: referrer || null,
		utmSource: cleanText(field(formData, "utmSource"), 120),
		utmMedium: cleanText(field(formData, "utmMedium"), 120),
		utmCampaign: cleanText(field(formData, "utmCampaign"), 180),
		landingPath,
	}
}

function field(formData: FormData, name: string) {
	return String(formData.get(name) || "").trim()
}

function cleanText(value: string, max: number) {
	const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max)
	return cleaned || null
}

function cleanPath(value: string) {
	const trimmed = cleanText(value, 500)
	if (!trimmed) return null
	if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
		return trimmed
	}
	try {
		const parsed = new URL(trimmed)
		return `${parsed.pathname}${parsed.search}`.slice(0, 500)
	} catch {
		return null
	}
}

function pathFromReferrer(value: string | null) {
	if (!value) return null
	try {
		const parsed = new URL(value)
		return `${parsed.pathname}${parsed.search}`.slice(0, 500)
	} catch {
		return cleanPath(value)
	}
}
