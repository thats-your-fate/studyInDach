export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://studyindach.cc"

export function absoluteUrl(path = "/") {
	const cleanPath = path.startsWith("/") ? path : `/${path}`
	return `${SITE_URL.replace(/\/$/, "")}${cleanPath}`
}

export function organizationJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Study in DACH",
		url: SITE_URL,
		email: "y3591vy@gmail.com",
		description: "A discovery platform for degree programs in Germany, Austria, and Switzerland.",
	}
}
