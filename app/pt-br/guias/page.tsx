import BlogIndexPage from "@/components/blog/BlogIndexPage"
import { localizedStaticAlternates } from "@/lib/localized-static-urls"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Guias Study in DACH",
	description: "Guias para estudar na Alemanha, Áustria e Suíça.",
	alternates: {
		canonical: absoluteUrl("/pt-br/guias"),
		languages: absoluteLanguageAlternates(),
	},
}

export default function GuiasPt() {
	return (
		<BlogIndexPage
			locale="pt-br"
			title="Guias Study in DACH"
			label="Guias para estudar na Alemanha, Áustria e Suíça"
			heading="Guias para planejar seus estudos"
			emptyTitle="Nenhum guia publicado ainda"
			emptyText="Novos guias aparecerão aqui depois de publicados."
			readLabel="Ler guia"
		/>
	)
}

function absoluteLanguageAlternates() {
	const alternates = localizedStaticAlternates("blog")
	return Object.fromEntries(Object.entries(alternates).map(([key, value]) => [key, absoluteUrl(value)]))
}
