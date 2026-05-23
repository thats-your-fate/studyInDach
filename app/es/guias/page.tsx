import BlogIndexPage from "@/components/blog/BlogIndexPage"
import { localizedStaticAlternates } from "@/lib/localized-static-urls"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Guías Study in DACH",
	description: "Guías para estudiar en Alemania, Austria y Suiza.",
	alternates: {
		canonical: absoluteUrl("/es/guias"),
		languages: absoluteLanguageAlternates(),
	},
}

export default function GuiasEs() {
	return (
		<BlogIndexPage
			locale="es"
			title="Guías Study in DACH"
			label="Guías para estudiar en Alemania, Austria y Suiza"
			heading="Guías para planear tus estudios"
			emptyTitle="No hay guías publicadas todavía"
			emptyText="Las nuevas guías aparecerán aquí cuando se publiquen."
			readLabel="Leer guía"
		/>
	)
}

function absoluteLanguageAlternates() {
	const alternates = localizedStaticAlternates("blog")
	return Object.fromEntries(Object.entries(alternates).map(([key, value]) => [key, absoluteUrl(value)]))
}
