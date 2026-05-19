import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Privacidad | Study in DACH",
	description: "Información de privacidad de Study in DACH.",
	alternates: {
		canonical: absoluteUrl("/es/privacidad"),
		languages: {
			en: absoluteUrl("/privacy"),
			es: absoluteUrl("/es/privacidad"),
			"pt-BR": absoluteUrl("/pt-br/privacidade"),
			"x-default": absoluteUrl("/privacy"),
		},
	},
}

export default function PrivacyEsPage() {
	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="program-detail-section">
						<div className="section-heading">
							<p>Privacidad</p>
							<h1>Política de privacidad</h1>
						</div>
						<p>Esta política de privacidad provisional debe sustituirse por el texto final de protección de datos antes del lanzamiento público.</p>
						<p>Las solicitudes enviadas mediante el formulario de contacto se almacenan para que Study in DACH pueda responder a las consultas de orientación.</p>
						<p>Email: <a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></p>
					</div>
				</div>
			</section>
		</Layout>
	)
}
