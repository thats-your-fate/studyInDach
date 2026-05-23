import Layout from "@/components/layout/Layout"
import Section1 from '@/components/sections/home1/Section1'
import Section2 from '@/components/sections/home1/Section2'
import Section3 from '@/components/sections/home1/Section3'
import SectionVisualBlocks from "@/components/sections/home1/SectionVisualBlocks"
import { localizedStaticAlternates } from "@/lib/localized-static-urls"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Study in DACH - Degree Programs in Germany, Austria, and Switzerland",
	description: "Discover degree programs across Germany, Austria, and Switzerland.",
	alternates: {
		canonical: absoluteUrl("/"),
		languages: Object.fromEntries(
			Object.entries(localizedStaticAlternates("home")).map(([locale, path]) => [locale, absoluteUrl(path)]),
		),
	},
}

export default function Home() {

	return (
		<>

			<Layout>
				<Section1 locale="en" />
				<Section2 locale="en" />
				<Section3 locale="en" />
				<SectionVisualBlocks locale="en" />
			</Layout>
		</>
	)
}
