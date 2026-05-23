import Layout from "@/components/layout/Layout"
import Section1 from "@/components/sections/home1/Section1"
import Section2 from "@/components/sections/home1/Section2"
import Section3 from "@/components/sections/home1/Section3"
import { localizedStaticAlternates } from "@/lib/localized-static-urls"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Study in DACH - Programas de estudo na Alemanha, Áustria e Suíça",
	description: "Descubra programas de estudo na Alemanha, Áustria e Suíça.",
	alternates: {
		canonical: absoluteUrl("/pt-br"),
		languages: Object.fromEntries(
			Object.entries(localizedStaticAlternates("home")).map(([locale, path]) => [locale, absoluteUrl(path)]),
		),
	},
}

export default function PtHome() {
	return (
		<Layout>
			<Section1 locale="pt-br" />
			<Section2 locale="pt-br" />
			<Section3 locale="pt-br" />
		</Layout>
	)
}
