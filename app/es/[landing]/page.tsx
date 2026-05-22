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
	"universidades-publicas-en-alemania": {
		slug: "universidades-publicas-en-alemania",
		title: "Universidades públicas en Alemania",
		metaTitle: "Universidades públicas en Alemania con programas de estudio | Study in DACH",
		description: "Explora programas en Alemania clasificados como sin matrícula o solo con tasa semestral.",
		intro: "Las universidades públicas alemanas son una opción muy buscada, pero los costos y las reglas pueden variar por estado, programa y perfil del estudiante. Usa esta página como punto de partida y verifica siempre la información oficial.",
		filters: { country: "Germany", tuitionType: "No Tuition / Semester Fee Only" },
		notes: [
			"Confirma la tasa semestral y posibles costos administrativos en el sitio oficial.",
			"Algunos estados o programas pueden tener reglas especiales para estudiantes internacionales.",
			"Compara también idioma, ciudad, costo de vida y requisitos académicos.",
			"Usa el tipo de matrícula como orientación inicial, no como garantía final.",
		],
		faq: [
			{ question: "¿Las universidades públicas alemanas son gratuitas?", answer: "Muchas no cobran matrícula, pero pueden existir tasas semestrales y costos de vida importantes." },
			{ question: "¿Cómo confirmar si un programa es público?", answer: "Revisa el perfil de la universidad y, sobre todo, la página oficial del programa." },
			{ question: "¿Estos datos reemplazan el sitio oficial?", answer: "No. Úsalos para descubrir opciones y confirma plazos, tasas y requisitos en la universidad." },
		],
		relatedLinks: [
			{ label: "Estudiar en Alemania", href: "/es/estudiar-en-alemania" },
			{ label: "Programas en inglés", href: "/es/programas-en-ingles" },
			{ label: "Catálogo filtrado", href: "/es/programas?country=Germany&tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only" },
		],
	},
	"estudiar-informatica-en-alemania": {
		slug: "estudiar-informatica-en-alemania",
		title: "Estudiar informática en Alemania",
		metaTitle: "Estudiar informática en Alemania: programas de Computer Science & Data | Study in DACH",
		description: "Compara programas de informática, ciencia de datos, software e inteligencia artificial en Alemania.",
		intro: "Alemania ofrece programas en informática, ciencia de datos, IA, software y áreas relacionadas. Compara idioma, nivel, enfoque académico y requisitos para encontrar opciones compatibles con tu perfil.",
		filters: { country: "Germany", studyField: "Computer Science & Data" },
		notes: [
			"Revisa si el programa es teórico, aplicado, interdisciplinario o de investigación.",
			"Lee requisitos de matemáticas, programación y créditos previos.",
			"Algunos programas de datos o IA pueden aparecer también bajo ingeniería o áreas interdisciplinarias.",
			"Confirma idioma de enseñanza y posibles módulos en alemán.",
		],
		faq: [
			{ question: "¿Hay programas de informática en inglés?", answer: "Sí, especialmente en maestrías. Usa el filtro de idioma para ver opciones en inglés." },
			{ question: "¿Necesito una carrera previa en informática?", answer: "Depende del programa. Muchos exigen formación relacionada, créditos específicos o experiencia técnica." },
			{ question: "¿Informática incluye IA y datos?", answer: "En la base, muchos programas de IA, datos y software aparecen dentro de Computer Science & Data." },
		],
		relatedLinks: [
			{ label: "Programas en inglés", href: "/es/programas-en-ingles" },
			{ label: "Ingeniería en Alemania", href: "/es/estudiar-ingenieria-en-alemania" },
			{ label: "Catálogo filtrado", href: "/es/programas?country=Germany&studyField=Computer%20Science%20%26%20Data" },
		],
	},
	"estudiar-ingenieria-en-alemania": {
		slug: "estudiar-ingenieria-en-alemania",
		title: "Estudiar ingeniería en Alemania",
		metaTitle: "Estudiar ingeniería en Alemania: programas de Engineering & Technology | Study in DACH",
		description: "Encuentra programas de ingeniería y tecnología en Alemania por nivel, idioma, costos y formato.",
		intro: "La ingeniería en Alemania abarca áreas como mecánica, eléctrica, civil, energía, producción y tecnología aplicada. Usa esta página para comparar programas por nivel, idioma, costos y universidad.",
		filters: { country: "Germany", studyField: "Engineering & Technology" },
		notes: [
			"Comprueba si el programa pertenece a una universidad, universidad de ciencias aplicadas u otra institución.",
			"Compara requisitos de matemáticas, física, prácticas y experiencia previa.",
			"Los programas aplicados pueden tener más proyectos, laboratorios o vínculo con industria.",
			"Verifica idioma, plazos y documentos en la página oficial.",
		],
		faq: [
			{ question: "¿Hay ingeniería en inglés en Alemania?", answer: "Sí, hay programas en inglés y mixtos, especialmente en ciertos niveles y especialidades." },
			{ question: "¿Cómo elegir una especialidad?", answer: "Compara currículo, área técnica, idioma, ciudad, costos y requisitos previos." },
			{ question: "¿Las universidades aplicadas son una buena opción?", answer: "Pueden serlo si buscas un enfoque práctico. Revisa el perfil institucional y el plan de estudios." },
		],
		relatedLinks: [
			{ label: "Informática en Alemania", href: "/es/estudiar-informatica-en-alemania" },
			{ label: "Universidades públicas", href: "/es/universidades-publicas-en-alemania" },
			{ label: "Catálogo filtrado", href: "/es/programas?country=Germany&studyField=Engineering%20%26%20Technology" },
		],
	},
	"doctorado-en-alemania": {
		slug: "doctorado-en-alemania",
		title: "Doctorado en Alemania",
		metaTitle: "Doctorado en Alemania: programas de Doctorate | Study in DACH",
		description: "Explora programas de doctorado en Alemania y compara área, idioma, universidad y requisitos.",
		intro: "Los doctorados en Alemania pueden ser estructurados, individuales o vinculados a escuelas de posgrado. Usa esta página para descubrir opciones y confirmar el proceso oficial con la universidad.",
		filters: { degreeLevel: "Doctorate", country: "Germany" },
		notes: [
			"Verifica si necesitas supervisor, propuesta de investigación o postulación a un programa estructurado.",
			"El idioma de trabajo puede variar por área, grupo de investigación y universidad.",
			"No asumas financiación, contrato o beca solo por la existencia del programa.",
			"Confirma requisitos, plazos y documentos en el sitio oficial.",
		],
		faq: [
			{ question: "¿El doctorado en Alemania siempre es estructurado?", answer: "No. Puede ser investigación individual, programa estructurado u otro formato." },
			{ question: "¿Necesito supervisor antes de postular?", answer: "En muchos casos sí, pero depende del programa y del área." },
			{ question: "¿Se puede hacer doctorado en inglés?", answer: "Sí, especialmente en contextos internacionales de investigación, pero los requisitos varían." },
		],
		relatedLinks: [
			{ label: "Estudiar en Alemania", href: "/es/estudiar-en-alemania" },
			{ label: "Programas en inglés", href: "/es/programas-en-ingles" },
			{ label: "Catálogo filtrado", href: "/es/programas?degreeLevel=Doctorate&country=Germany" },
		],
	},
	"licenciatura-en-alemania": {
		slug: "licenciatura-en-alemania",
		title: "Licenciatura en Alemania",
		metaTitle: "Licenciatura en Alemania: programas de grado | Study in DACH",
		description: "Compara programas de licenciatura en Alemania por área, idioma, costos, universidad y formato.",
		intro: "Las licenciaturas en Alemania pueden exigir requisitos escolares, idioma y documentos específicos para estudiantes internacionales. Usa esta página para comparar opciones y verificar los detalles oficiales.",
		filters: { degreeLevel: "Bachelor", country: "Germany" },
		notes: [
			"Verifica si el programa exige alemán, inglés o una combinación de idiomas.",
			"Revisa equivalencia escolar, documentos académicos y requisitos adicionales.",
			"Compara ciudad, costo de vida, formato y tipo de matrícula.",
			"Confirma plazos y reglas para solicitantes internacionales en el sitio oficial.",
		],
		faq: [
			{ question: "¿Hay licenciaturas en inglés en Alemania?", answer: "Sí, aunque suele haber más oferta en maestrías. Usa el filtro de idioma para refinar." },
			{ question: "¿La licenciatura exige alemán?", answer: "Muchos programas de grado exigen alemán, pero depende de la universidad y del área." },
			{ question: "¿Qué debo comparar?", answer: "Idioma, área, ciudad, costos, requisitos escolares, formato y página oficial de postulación." },
		],
		relatedLinks: [
			{ label: "Estudiar en Alemania", href: "/es/estudiar-en-alemania" },
			{ label: "Programas en inglés", href: "/es/programas-en-ingles" },
			{ label: "Catálogo filtrado", href: "/es/programas?degreeLevel=Bachelor&country=Germany" },
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
