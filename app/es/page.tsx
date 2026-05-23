import Layout from "@/components/layout/Layout"
import Section1 from "@/components/sections/home1/Section1"
import Section2 from "@/components/sections/home1/Section2"
import Section3 from "@/components/sections/home1/Section3"
import { localizedStaticAlternates } from "@/lib/localized-static-urls"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Study in DACH - Programas de estudio en Alemania, Austria y Suiza",
	description: "Descubre programas de estudio en Alemania, Austria y Suiza.",
	alternates: {
		canonical: absoluteUrl("/es"),
		languages: Object.fromEntries(
			Object.entries(localizedStaticAlternates("home")).map(([locale, path]) => [locale, absoluteUrl(path)]),
		),
	},
}

export default function EsHome() {
	return (
		<Layout>
			<Section1 locale="es" />
			<Section2 locale="es" />
			<Section3 locale="es" />
		</Layout>
	)
}
