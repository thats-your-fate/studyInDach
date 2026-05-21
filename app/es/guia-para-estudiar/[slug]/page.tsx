import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type GuidePage = {
	title: string
	description: string
	intro: string
	points: string[]
	links: Array<{ label: string; href: string }>
}

const pages: Record<string, GuidePage> = {
	"licenciatura-maestria-doctorado": {
		title: "Licenciatura, maestría y doctorado",
		description: "Entiende diferencias entre niveles académicos y compara programas en DACH.",
		intro: "Antes de elegir un programa, confirma si el nivel encaja con tu historial académico, objetivos y requisitos oficiales.",
		points: [
			"Las licenciaturas suelen exigir educación secundaria reconocida y pueden tener más oferta en el idioma local.",
			"Las maestrías suelen exigir una carrera relacionada, créditos mínimos o materias específicas.",
			"Los doctorados pueden exigir supervisor, propuesta de investigación o postulación a una escuela estructurada.",
			"El nombre del título y los requisitos varían por país, universidad y área.",
		],
		links: [
			{ label: "Licenciaturas", href: "/es/programas?degreeLevel=Bachelor" },
			{ label: "Maestrías", href: "/es/programas?degreeLevel=Master" },
			{ label: "Doctorados", href: "/es/programas?degreeLevel=Doctorate" },
		],
	},
	"universidades-publicas": {
		title: "Universidades públicas",
		description: "Cómo usar Study in DACH para encontrar opciones públicas y revisar tasas.",
		intro: "Las universidades públicas pueden ser una opción atractiva, pero las tasas, reglas y costos reales deben verificarse siempre en la fuente oficial.",
		points: [
			"Sin matrícula no significa sin costos.",
			"Puede haber tasas semestrales, servicios y requisitos administrativos.",
			"Algunas reglas dependen del estado, país o perfil del estudiante.",
			"Usa los filtros como punto de partida y confirma todo con la universidad.",
		],
		links: [
			{ label: "Programas sin matrícula", href: "/es/programas?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only" },
			{ label: "Universidades", href: "/es/universidades" },
			{ label: "Programas en Alemania", href: "/es/estudiar-en-alemania" },
		],
	},
	"costos-tasas-comprobacion-financiera": {
		title: "Costos, tasas y comprobación financiera",
		description: "Compara matrícula, tasas, costo de vida y planificación financiera.",
		intro: "Los costos no se reducen a la matrícula. Considera tasas semestrales, vivienda, seguro, transporte y posibles comprobantes financieros.",
		points: [
			"Un dato ausente no significa que el programa sea gratuito.",
			"Las tasas semestrales pueden existir incluso en universidades públicas.",
			"El costo de vida varía mucho por ciudad y país.",
			"Los documentos financieros deben confirmarse en fuentes oficiales.",
		],
		links: [
			{ label: "Programas sin matrícula", href: "/es/programas?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only" },
			{ label: "Catálogo completo", href: "/es/programas" },
			{ label: "Contacto", href: "/es/contacto" },
		],
	},
	"requisitos-de-idioma": {
		title: "Requisitos de idioma",
		description: "Cómo comparar idiomas de enseñanza y certificados exigidos por programas.",
		intro: "El idioma de enseñanza y el idioma requerido para admisión no siempre son lo mismo. Lee cuidadosamente la página oficial.",
		points: [
			"Programas en inglés pueden exigir alemán, francés o italiano para módulos o prácticas.",
			"Los certificados aceptados y puntuaciones mínimas varían por universidad.",
			"Algunas páginas indican niveles como B2 o C1.",
			"Confirma validez del certificado, plazo de envío y excepciones oficiales.",
		],
		links: [
			{ label: "Programas en inglés", href: "/es/programas-en-ingles" },
			{ label: "Filtro de idioma", href: "/es/programas?languageOfInstruction=English" },
			{ label: "Guía para estudiar", href: "/es/guia-para-estudiar" },
		],
	},
	"plazos-de-postulacion": {
		title: "Plazos de postulación",
		description: "Organiza la verificación de plazos para programas en DACH.",
		intro: "Los plazos cambian por país, universidad, semestre, nivel y perfil del candidato. Usa la lista para descubrir programas y la página oficial para confirmar fechas.",
		points: [
			"Verifica si el inicio es en semestre de invierno, verano o ambos.",
			"Algunos programas tienen plazos distintos para internacionales.",
			"Traducciones y certificados pueden tardar.",
			"No dependas solo de resúmenes agregados para decisiones finales.",
		],
		links: [
			{ label: "Maestrías", href: "/es/programas?degreeLevel=Master" },
			{ label: "Catálogo completo", href: "/es/programas" },
			{ label: "Contacto", href: "/es/contacto" },
		],
	},
	"como-comparar-programas": {
		title: "Cómo comparar programas",
		description: "Criterios prácticos para comparar programas en Alemania, Austria y Suiza.",
		intro: "Una buena comparación combina datos académicos, idioma, costos, formato, requisitos y la página oficial de postulación.",
		points: [
			"Empieza por nivel, área, país e idioma.",
			"Después compara costos, duración, formato y requisitos.",
			"Lee el resumen, pero confirma detalles en el sitio oficial.",
			"Crea una lista corta con opciones realistas y alternativas.",
		],
		links: [
			{ label: "Ver programas", href: "/es/programas" },
			{ label: "Programas en inglés", href: "/es/programas-en-ingles" },
			{ label: "Recibir orientación gratuita", href: "/es/contacto" },
		],
	},
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
	const page = pages[params.slug]
	if (!page) return {}
	return {
		title: `${page.title} | Study in DACH`,
		description: page.description,
		alternates: {
			canonical: absoluteUrl(`/es/guia-para-estudiar/${params.slug}`),
		},
	}
}

export default function EsGuideTopicPage({ params }: { params: { slug: string } }) {
	const page = pages[params.slug]
	if (!page) notFound()

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="program-detail-section">
						<div className="section-heading">
							<p>Guía para estudiar</p>
							<h1>{page.title}</h1>
						</div>
						<p>{page.intro}</p>
						<ul className="program-bullet-list">
							{page.points.map((point) => <li key={point}>{point}</li>)}
						</ul>
						<div className="program-summary-grid mt-5">
							{page.links.map((link) => (
								<Link href={link.href} className="program-summary-card hover-up" key={link.href}>
									<h3>{link.label}</h3>
									<p>Sigue investigando con filtros y páginas relacionadas.</p>
								</Link>
							))}
						</div>
						<div className="university-panel mt-5">
							<p className="mb-0">Study in DACH no es la universidad oficial. Verifica siempre plazos, tasas, requisitos y documentos en el sitio oficial de la universidad.</p>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}
