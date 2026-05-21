import Layout from "@/components/layout/Layout"
import CourseCard from "@/components/sections/courses/CourseCard"
import { absoluteUrl } from "@/lib/seo"
import { getCoursesPageData, type CourseSearchParams, type ProgramCard } from "@/lib/study-programs"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type LandingConfig = {
	slug: string
	title: string
	metaTitle: string
	description: string
	intro: string
	filters: CourseSearchParams
	notes: string[]
	faq: Array<{ question: string; answer: string }>
	relatedLinks: Array<{ label: string; href: string }>
}

const landingPages: Record<string, LandingConfig> = {
	"estudiar-en-alemania": {
		slug: "estudiar-en-alemania",
		title: "Estudiar en Alemania",
		metaTitle: "Estudiar en Alemania: programas de licenciatura, maestría y doctorado | Study in DACH",
		description: "Compara programas de estudio en Alemania por nivel, área, idioma, costos y formato.",
		intro: "Alemania reúne universidades públicas y privadas con programas en distintas áreas, idiomas y formatos. Usa esta página para comparar opciones y confirma siempre requisitos, plazos y costos en el sitio oficial.",
		filters: { country: "Germany" },
		notes: [
			"Revisa si el programa es presencial, online, híbrido, de tiempo completo o parcial.",
			"Los programas en inglés pueden recomendar o exigir otro idioma para prácticas o módulos.",
			"Los costos y tasas deben verificarse siempre en la página oficial.",
			"Los requisitos de admisión varían por universidad y área.",
		],
		faq: [
			{ question: "¿Puedo estudiar en Alemania en inglés?", answer: "Sí, especialmente en nivel de maestría. Verifica si el programa exige alemán adicional." },
			{ question: "¿Las universidades públicas son siempre gratuitas?", answer: "No necesariamente. Muchas cobran solo una tasa semestral, pero las reglas varían por estado, programa y perfil." },
			{ question: "¿Cómo comparar programas?", answer: "Compara nivel, área, idioma, duración, costos, formato, requisitos y la página oficial de postulación." },
		],
		relatedLinks: [
			{ label: "Programas en inglés", href: "/es/programas-en-ingles" },
			{ label: "Programas en Alemania", href: "/es/programas?country=Germany" },
			{ label: "Guía para estudiar", href: "/es/guia-para-estudiar" },
		],
	},
	"estudiar-en-austria": {
		slug: "estudiar-en-austria",
		title: "Estudiar en Austria",
		metaTitle: "Estudiar en Austria: programas y universidades | Study in DACH",
		description: "Compara programas en Austria por nivel, área, idioma, costos y formato.",
		intro: "Austria ofrece programas en universidades públicas, privadas e instituciones aplicadas. Compara opciones y confirma requisitos oficiales antes de postular.",
		filters: { country: "Austria" },
		notes: [
			"Verifica si el idioma de enseñanza es alemán, inglés o mixto.",
			"Compara tasas, matrícula y requisitos específicos para estudiantes internacionales.",
			"Considera ciudad, costo de vida y formato de estudio.",
			"Confirma plazos y documentos en la página oficial.",
		],
		faq: [
			{ question: "¿Hay programas en inglés en Austria?", answer: "Sí, especialmente en algunos programas de maestría e internacionales." },
			{ question: "¿Los plazos son iguales a Alemania?", answer: "No. Los plazos varían por universidad, programa y perfil del candidato." },
			{ question: "¿Qué debo comparar?", answer: "Nivel, área, idioma, ciudad, costos, formato y requisitos académicos." },
		],
		relatedLinks: [
			{ label: "Programas en Austria", href: "/es/programas?country=Austria" },
			{ label: "Programas en inglés", href: "/es/programas-en-ingles" },
			{ label: "Guía para estudiar", href: "/es/guia-para-estudiar" },
		],
	},
	"estudiar-en-suiza": {
		slug: "estudiar-en-suiza",
		title: "Estudiar en Suiza",
		metaTitle: "Estudiar en Suiza: programas y universidades | Study in DACH",
		description: "Compara programas en Suiza por idioma, universidad, costos, nivel y área.",
		intro: "Suiza tiene distintas regiones lingüísticas e instituciones con perfiles variados. Compara idioma, ciudad, costos y requisitos antes de crear tu lista corta.",
		filters: { country: "Switzerland" },
		notes: [
			"Observa el idioma local de la región y el idioma oficial del programa.",
			"Considera costo de vida, seguro y tasas dentro del presupuesto.",
			"Verifica si el programa tiene enfoque académico, aplicado o internacional.",
			"Confirma todos los requisitos con la universidad.",
		],
		faq: [
			{ question: "¿Suiza tiene programas en inglés?", answer: "Sí, sobre todo en algunas maestrías y programas internacionales." },
			{ question: "¿El costo de vida importa?", answer: "Sí. Puede pesar mucho en la comparación total." },
			{ question: "¿Cómo elegir una región?", answer: "Compara idioma de enseñanza, idioma local, ciudad, red profesional y requisitos oficiales." },
		],
		relatedLinks: [
			{ label: "Programas en Suiza", href: "/es/programas?country=Switzerland" },
			{ label: "Programas en inglés", href: "/es/programas-en-ingles" },
			{ label: "Guía para estudiar", href: "/es/guia-para-estudiar" },
		],
	},
	"programas-en-ingles": {
		slug: "programas-en-ingles",
		title: "Programas en inglés en Alemania, Austria y Suiza",
		metaTitle: "Programas en inglés en DACH | Study in DACH",
		description: "Encuentra programas con inglés como idioma de enseñanza en Alemania, Austria y Suiza.",
		intro: "Los programas en inglés son populares entre estudiantes internacionales, pero pueden tener requisitos académicos, certificados y componentes en otros idiomas.",
		filters: { languageOfInstruction: "English" },
		notes: [
			"Confirma si el programa es completamente en inglés o mixto.",
			"Verifica certificados aceptados y puntuación mínima.",
			"Algunos programas recomiendan alemán, francés o italiano para prácticas o vida diaria.",
			"Compara requisitos académicos antes de seleccionar opciones.",
		],
		faq: [
			{ question: "¿Un programa en inglés elimina otros requisitos de idioma?", answer: "No siempre. Puede haber módulos, prácticas o recomendaciones en otro idioma." },
			{ question: "¿Hay licenciaturas en inglés?", answer: "Sí, pero suele haber más oferta en maestrías." },
			{ question: "¿Cómo encontrar opciones?", answer: "Filtra por idioma English y luego por país, nivel, área y tipo de matrícula." },
		],
		relatedLinks: [
			{ label: "Catálogo filtrado", href: "/es/programas?languageOfInstruction=English" },
			{ label: "Programas en Alemania", href: "/es/estudiar-en-alemania" },
			{ label: "Guía para estudiar", href: "/es/guia-para-estudiar" },
		],
	},
}

export function generateMetadata({ params }: { params: { landing: string } }): Metadata {
	const page = landingPages[params.landing]
	if (!page) return {}
	return {
		title: page.metaTitle,
		description: page.description,
		alternates: {
			canonical: absoluteUrl(`/es/${page.slug}`),
			languages: { es: absoluteUrl(`/es/${page.slug}`) },
		},
	}
}

export default async function EsLandingPage({ params }: { params: { landing: string } }) {
	const page = landingPages[params.landing]
	if (!page) notFound()

	const data = await getCoursesPageData(page.filters, "es")
	const programs = data.programs.slice(0, 9)
	const filteredCatalogPath = catalogPath(page.filters)
	const contactPath = `/es/contacto?landingPath=${encodeURIComponent(`/es/${page.slug}`)}`

	return (
		<Layout>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(page, programs)) }} />
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white"><i className="ri-map-pin-line text-green-3" />&nbsp; guía</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">{page.title}</h1>
				</div>
			</section>
			<section className="py-120 bg-white">
				<div className="container">
					<div className="row g-5 align-items-start mb-6">
						<div className="col-lg-7">
							<span className="btn-text text-primary">Programas filtrados en Study in DACH</span>
							<h2 className="my-3 text-anime-style-3">Compara opciones antes de ir a la página oficial</h2>
							<p>{page.intro}</p>
							<div className="d-flex flex-wrap gap-3 mt-4">
								<Link href={filteredCatalogPath} className="btn btn-primary hover-up">Ver todos los programas filtrados</Link>
								<Link href={contactPath} className="btn btn-outline-secondary hover-up">Recibir orientación gratuita</Link>
							</div>
						</div>
						<div className="col-lg-5">
							<div className="program-detail-section h-100">
								<div className="section-heading"><p>Notas prácticas</p><h3>Antes de elegir</h3></div>
								<ul className="program-bullet-list">{page.notes.map((note) => <li key={note}>{note}</li>)}</ul>
							</div>
						</div>
					</div>
					<div className="program-detail-section mb-5">
						<div className="section-heading"><p>Vista previa de programas</p><h2>{data.totalMatching} programas encontrados</h2></div>
						<div className="row g-4">
							{programs.map((program) => <div className="col-12 col-md-6 col-xl-4" key={program.id}><CourseCard course={program} locale="es" /></div>)}
						</div>
						<div className="text-center mt-5"><Link href={filteredCatalogPath} className="btn btn-outline-secondary hover-up">Abrir catálogo completo</Link></div>
					</div>
					<div className="program-cta-card mb-5">
						<div><span>Orientación gratuita</span><h3>¿Quieres ayuda para comparar opciones?</h3><p>Cuéntanos tu perfil, idioma preferido, presupuesto y país de interés. Te ayudamos a entender próximos pasos usando información pública de los programas.</p></div>
						<Link href={contactPath} className="btn btn-primary hover-up">Recibir orientación gratuita</Link>
					</div>
					<div className="program-detail-section mb-5">
						<div className="section-heading"><p>Preguntas frecuentes</p><h2>Dudas comunes</h2></div>
						<div className="program-summary-grid">{page.faq.map((item) => <div className="program-summary-card" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</div>
					</div>
					<div className="program-detail-section mb-5">
						<div className="section-heading"><p>Enlaces internos</p><h2>Sigue investigando</h2></div>
						<div className="program-summary-grid">{page.relatedLinks.map((item) => <Link href={item.href} className="program-summary-card hover-up" key={item.href}><h3>{item.label}</h3><p>Abre una página relacionada para comparar programas desde otro ángulo.</p></Link>)}</div>
					</div>
					<div className="university-panel"><p className="mb-0">Study in DACH no es la universidad oficial. Verifica siempre plazos, tasas, requisitos y documentos en el sitio oficial de la universidad.</p></div>
				</div>
			</section>
		</Layout>
	)
}

function catalogPath(filters: CourseSearchParams) {
	const params = new URLSearchParams()
	Object.entries(filters).forEach(([key, value]) => {
		const values = Array.isArray(value) ? value : value ? [value] : []
		values.forEach((item) => params.append(key === "language" ? "languageOfInstruction" : key, item))
	})
	return `/es/programas?${params.toString()}`
}

function itemListJsonLd(page: LandingConfig, programs: ProgramCard[]) {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: page.title,
		url: absoluteUrl(`/es/${page.slug}`),
		itemListElement: programs.map((program, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(program.detailPath),
			item: {
				"@type": "Course",
				name: program.title,
				description: program.summary || undefined,
				provider: { "@type": "CollegeOrUniversity", name: program.universityName },
				educationalCredentialAwarded: program.academicDegree || program.degreeLevel,
				inLanguage: program.languageOfInstruction || undefined,
			},
		})),
	}
}
