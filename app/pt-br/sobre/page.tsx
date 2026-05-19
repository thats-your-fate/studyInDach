import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
	title: "Sobre o Study in DACH",
	description: "Conheça a plataforma Study in DACH para descoberta de programas na Alemanha, Áustria e Suíça.",
	alternates: {
		canonical: absoluteUrl("/pt-br/sobre"),
		languages: {
			en: absoluteUrl("/about"),
			es: absoluteUrl("/es/sobre"),
			"pt-BR": absoluteUrl("/pt-br/sobre"),
			"x-default": absoluteUrl("/about"),
		},
	},
}

export default function AboutPt() {
	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-git-repository-line text-green-3" />
						&nbsp; sobre a plataforma
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">Sobre o Study in DACH</h1>
				</div>
			</section>
			<section className="elearning-about-section-2 position-relative overflow-hidden pt-120 pb-120 rounded-bottom-4 bg-white z-35">
				<div className="container">
					<div className="row align-items-center g-5">
						<div className="col-lg-6">
							<img className="rounded-4" src="/assets/imgs/pages/learning/page-about/img-1.png" alt="Estudantes pesquisando universidades" />
						</div>
						<div className="col-lg-6">
							<span className="btn-text text-primary">Alemanha, Áustria, Suíça</span>
							<h2 className="my-3 text-anime-style-3">Uma forma mais clara de descobrir programas de estudo</h2>
							<p className="pb-4">Study in DACH ajuda estudantes internacionais a explorar programas usando campos normalizados como país, nível, área, idioma, tipo de mensalidade, formato, dificuldade de admissão e início.</p>
							<p className="pb-4">A plataforma combina fontes públicas das universidades, extração estruturada, localização e metadados filtráveis para acelerar a passagem da descoberta à página oficial da universidade.</p>
							<Link href="/pt-br/cursos" className="btn btn-outline-secondary mt-3 hover-up">
								<span>Ver programas</span>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}
