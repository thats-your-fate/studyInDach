import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
	title: "Guía para estudiar en Alemania, Austria y Suiza | Study in DACH",
	description: "Guías prácticas en español para comparar programas, costos, idiomas, plazos y universidades en Alemania, Austria y Suiza.",
	alternates: {
		canonical: absoluteUrl("/es/guia-para-estudiar"),
		languages: {
			en: absoluteUrl("/study-guide"),
			es: absoluteUrl("/es/guia-para-estudiar"),
			"pt-BR": absoluteUrl("/pt-br/guia-de-estudos"),
			"x-default": absoluteUrl("/study-guide"),
		},
	},
}

const guideItems = [
	["Estudiar en Alemania", "Compara universidades, tipos de programa, idiomas de enseñanza y costos antes de elegir una postulación.", "/es/estudiar-en-alemania"],
	["Estudiar en Austria", "Revisa plazos, tasas, idioma y diferencias entre instituciones austríacas.", "/es/estudiar-en-austria"],
	["Estudiar en Suiza", "Evalúa costo de vida, idioma local, estructura académica y requisitos oficiales de cada universidad.", "/es/estudiar-en-suiza"],
	["Licenciatura, maestría y doctorado", "Entiende las diferencias entre niveles académicos y filtra programas compatibles con tu perfil.", "/es/guia-para-estudiar/licenciatura-maestria-doctorado"],
	["Programas en inglés", "Encuentra programas impartidos en inglés y verifica posibles requisitos adicionales de idioma.", "/es/programas-en-ingles"],
	["Universidades públicas", "Descubre opciones públicas, pero confirma tasas y reglas de admisión en el sitio oficial.", "/es/guia-para-estudiar/universidades-publicas"],
	["Costos, tasas y comprobación financiera", "Compara matrícula, tasas semestrales, vivienda, seguro y posibles comprobantes financieros.", "/es/guia-para-estudiar/costos-tasas-comprobacion-financiera"],
	["Requisitos de idioma", "Interpreta requisitos como B2, C1, inglés académico y reglas específicas para internacionales.", "/es/guia-para-estudiar/requisitos-de-idioma"],
	["Plazos de postulación", "Organiza la verificación de plazos por país, universidad, programa y perfil del candidato.", "/es/guia-para-estudiar/plazos-de-postulacion"],
	["Cómo comparar programas", "Compara área, idioma, formato, duración, costos y requisitos antes de crear tu lista corta.", "/es/guia-para-estudiar/como-comparar-programas"],
]

export default function StudyGuideEs() {
	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white"><i className="ri-git-repository-line text-green-3" />&nbsp; guía para estudiar</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">Guía para estudiar</h1>
				</div>
			</section>
			<section className="py-120 bg-white">
				<div className="container">
					<div className="row g-5 align-items-start mb-6">
						<div className="col-lg-5">
							<span className="btn-text text-primary">Notas de planificación</span>
							<h2 className="my-3 text-anime-style-3">Guías prácticas para estudiar en Alemania, Austria y Suiza</h2>
							<p>Usa estos contenidos como punto de partida para comparar opciones y confirmar detalles directamente con la universidad.</p>
							<Link href="/es/programas" className="btn btn-primary mt-3 hover-up">Ver programas</Link>
						</div>
						<div className="col-lg-7">
							<div className="program-info-grid">
								{guideItems.map(([title, body, href]) => (
									<Link href={href} className="program-summary-card hover-up" key={title}>
										<h3>{title}</h3>
										<p>{body}</p>
									</Link>
								))}
							</div>
						</div>
					</div>
					<div className="program-detail-section">
						<div className="section-heading"><p>Atajos de búsqueda</p><h2>Empieza con filtros útiles</h2></div>
						<div className="program-summary-grid">
							<Link href="/es/programas?degreeLevel=Master" className="program-summary-card hover-up"><h3>Maestrías</h3><p>Explora programas de maestría y refina por área, país, idioma y formato.</p></Link>
							<Link href="/es/programas?languageOfInstruction=English" className="program-summary-card hover-up"><h3>Programas en inglés</h3><p>Consulta programas marcados con inglés como idioma de enseñanza.</p></Link>
							<Link href="/es/programas?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only" className="program-summary-card hover-up"><h3>Sin matrícula</h3><p>Encuentra programas clasificados como sin matrícula o solo con tasa semestral.</p></Link>
						</div>
					</div>
					<div className="university-panel mt-4">
						<p className="mb-0">Study in DACH no es la universidad oficial. Los datos se recopilan de fuentes públicas y pueden estar incompletos o desactualizados. Verifica siempre plazos, tasas, requisitos de idioma, documentos y reglas de admisión en el sitio oficial de la universidad.</p>
					</div>
				</div>
			</section>
		</Layout>
	)
}
