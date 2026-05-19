import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
	title: "Guia de estudos | Study in DACH",
	description: "Notas práticas para usar o Study in DACH e verificar informações oficiais das universidades.",
	alternates: {
		canonical: absoluteUrl("/pt-br/guia-de-estudos"),
		languages: {
			en: absoluteUrl("/study-guide"),
			"pt-BR": absoluteUrl("/pt-br/guia-de-estudos"),
			"x-default": absoluteUrl("/study-guide"),
		},
	},
}

const guideItems = [
	{
		title: "Confira prazos oficiais",
		body: "Datas de candidatura variam por universidade, tipo de curso, perfil do candidato e país. Sempre confirme os prazos na página oficial do programa.",
	},
	{
		title: "Entenda os requisitos de idioma",
		body: "Programas em inglês ainda podem exigir alemão para estágios, vida diária ou módulos específicos. Leia os requisitos oficiais com atenção.",
	},
	{
		title: "Compare custos reais",
		body: "Mensalidade, taxa semestral, custo de vida, seguro e comprovação financeira para visto são itens separados. Dados ausentes não significam gratuidade.",
	},
]

export default function StudyGuidePt() {
	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-git-repository-line text-green-3" />
						&nbsp; guia de estudos
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">Guia de estudos</h1>
				</div>
			</section>
			<section className="py-120 bg-white">
				<div className="container">
					<div className="row g-5 align-items-start">
						<div className="col-lg-5">
							<span className="btn-text text-primary">Notas de planejamento</span>
							<h2 className="my-3 text-anime-style-3">Use o Study in DACH para descobrir opções, depois confirme oficialmente</h2>
							<p>Nossos filtros ajudam você a selecionar programas na Alemanha, Áustria e Suíça. Decisões finais de candidatura devem sempre se basear no site da universidade.</p>
							<Link href="/pt-br/cursos" className="btn btn-primary mt-3 hover-up">Ver programas</Link>
						</div>
						<div className="col-lg-7">
							<div className="program-info-grid">
								{guideItems.map((item) => (
									<div className="program-summary-card" key={item.title}>
										<h3>{item.title}</h3>
										<p>{item.body}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}
