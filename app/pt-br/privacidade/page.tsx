import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Privacidade | Study in DACH",
	description: "Informações de privacidade do Study in DACH.",
	alternates: {
		canonical: absoluteUrl("/pt-br/privacidade"),
		languages: {
			en: absoluteUrl("/privacy"),
			"pt-BR": absoluteUrl("/pt-br/privacidade"),
			"x-default": absoluteUrl("/privacy"),
		},
	},
}

export default function PrivacyPtPage() {
	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="program-detail-section">
						<div className="section-heading">
							<p>Privacidade</p>
							<h1>Política de privacidade</h1>
						</div>
						<p>Esta política de privacidade provisória deve ser substituída pelo texto final de proteção de dados antes do lançamento público.</p>
						<p>As solicitações enviadas pelo formulário de contato são armazenadas para que o Study in DACH possa responder aos pedidos de orientação.</p>
						<p>Email: <a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></p>
					</div>
				</div>
			</section>
		</Layout>
	)
}
