import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
	title: "Sobre Study in DACH",
	description: "Conoce Study in DACH, una plataforma para descubrir programas de estudio en Alemania, Austria y Suiza.",
	alternates: {
		canonical: absoluteUrl("/es/sobre"),
		languages: {
			en: absoluteUrl("/about"),
			es: absoluteUrl("/es/sobre"),
			"pt-BR": absoluteUrl("/pt-br/sobre"),
			"x-default": absoluteUrl("/about"),
		},
	},
}

export default function AboutEs() {
	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-git-repository-line text-green-3" />
						&nbsp; sobre la plataforma
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">Sobre Study in DACH</h1>
				</div>
			</section>
			<section className="elearning-about-section-2 position-relative overflow-hidden pt-120 pb-120 rounded-bottom-4 bg-white z-35">
				<div className="container">
					<div className="row align-items-center g-5">
						<div className="col-lg-6">
							<img className="rounded-4" src="/assets/imgs/pages/learning/page-about/img-1.png" alt="Estudiantes investigando universidades" />
						</div>
						<div className="col-lg-6">
							<span className="btn-text text-primary">Alemania, Austria, Suiza</span>
							<h2 className="my-3 text-anime-style-3">Una forma más clara de descubrir programas de estudio</h2>
							<p className="pb-4">Study in DACH ayuda a estudiantes internacionales a explorar programas con campos normalizados como país, nivel, área, idioma, tipo de matrícula, formato, dificultad de admisión e inicio.</p>
							<p className="pb-4">La plataforma combina fuentes públicas de universidades, extracción estructurada, localización y metadatos filtrables para pasar más rápido de la búsqueda amplia a la página oficial de la universidad.</p>
							<Link href="/es/programas" className="btn btn-outline-secondary mt-3 hover-up">
								<span>Ver programas</span>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}
