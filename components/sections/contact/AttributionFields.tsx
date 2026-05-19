"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

type AttributionFieldsProps = {
	initialSourcePath: string
}

export default function AttributionFields({ initialSourcePath }: AttributionFieldsProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [referrer, setReferrer] = useState("")

	useEffect(() => {
		setReferrer(document.referrer || "")
	}, [])

	const sourcePath = useMemo(() => {
		const query = searchParams.toString()
		return `${pathname || initialSourcePath}${query ? `?${query}` : ""}`
	}, [initialSourcePath, pathname, searchParams])

	const landingPath = searchParams.get("landingPath") || inferLandingPath(referrer) || sourcePath

	return (
		<>
			<input type="hidden" name="sourcePath" value={sourcePath} />
			<input type="hidden" name="referrer" value={referrer} />
			<input type="hidden" name="utmSource" value={searchParams.get("utm_source") || ""} />
			<input type="hidden" name="utmMedium" value={searchParams.get("utm_medium") || ""} />
			<input type="hidden" name="utmCampaign" value={searchParams.get("utm_campaign") || ""} />
			<input type="hidden" name="landingPath" value={landingPath} />
		</>
	)
}

function inferLandingPath(referrer: string) {
	if (!referrer) return ""
	try {
		const url = new URL(referrer)
		if (url.pathname.includes("/contato") || url.pathname.includes("/contacto") || url.pathname.includes("/contact")) {
			return ""
		}
		return `${url.pathname}${url.search}`
	} catch {
		return ""
	}
}
