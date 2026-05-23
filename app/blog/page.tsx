import BlogIndexPage from "@/components/blog/BlogIndexPage"
import { localizedStaticAlternates } from "@/lib/localized-static-urls"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Study in DACH Blog",
	description: "Latest guides about finding and comparing degree programs in Germany, Austria, and Switzerland.",
	alternates: {
		canonical: absoluteUrl("/blog"),
		languages: absoluteLanguageAlternates(),
	},
}

export default function Blog() {
	return (
		<BlogIndexPage
			locale="en"
			title="Study in DACH Blog"
			label="Latest guides"
			heading="Notes for planning your studies"
			emptyTitle="No guides published yet"
			emptyText="New guides will appear here after they are published."
			readLabel="Read guide"
		/>
	)
}

function absoluteLanguageAlternates() {
	const alternates = localizedStaticAlternates("blog")
	return Object.fromEntries(Object.entries(alternates).map(([key, value]) => [key, absoluteUrl(value)]))
}
