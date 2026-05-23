import type { PublicLocale } from "@/lib/i18n"
import Link from "next/link"

const images = {
	libraryGroup: "/assets/imgs/study-dach-pics/students-learning-together-in-a-modern-library-2026-03-18-10-44-41-utc.jpg",
	laptopSearch: "/assets/imgs/study-dach-pics/female-college-student-working-on-laptop-and-searc-2026-03-24-05-05-19-utc.jpg",
	studyTable: "/assets/imgs/study-dach-pics/university-students-sitting-together-at-table-with-2026-03-16-22-59-17-utc.jpg",
	deskStudy: "/assets/imgs/study-dach-pics/smiling-woman-studies-at-desk-with-laptop-2026-01-08-07-10-20-utc.jpg",
	collaboration: "/assets/imgs/study-dach-pics/collaborative-learning-students-taking-notes-toge-2026-03-18-05-35-29-utc.jpg",
	librarySolo: "/assets/imgs/study-dach-pics/student-studying-at-library-2026-01-09-08-23-04-utc.jpg",
}

const copy = {
	en: {
		eyebrow: "Plan by destination",
		title: "Start with the country, then compare the programs.",
		intro: "Browse public and private universities across Germany, Austria, and Switzerland with filters built for international applicants.",
		countries: [
			{ name: "Germany", text: "Large public-university catalog, many English-taught master programs, and strong engineering, data, business, and science options.", href: "/courses?country=Germany", image: images.libraryGroup },
			{ name: "Austria", text: "Compact, high-quality study options with strong city campuses and a growing set of English-taught programs.", href: "/courses?country=Austria", image: images.studyTable },
			{ name: "Switzerland", text: "Research-focused universities, applied sciences options, and multilingual study environments.", href: "/courses?country=Switzerland", image: images.laptopSearch },
		],
		guideEyebrow: "From search to shortlist",
		guideTitle: "Use normalized filters to avoid messy scraped data.",
		guideText: "Study in DACH groups raw university information into practical buckets: degree level, field, language, tuition type, study mode, location, and application fit.",
		guideHref: "/study-guide",
		guideCta: "Open study guide",
		pathsTitle: "Popular ways to explore",
		paths: [
			{ label: "English-taught programs", href: "/courses?languageOfInstruction=English", image: images.collaboration },
			{ label: "Master programs", href: "/courses?degreeLevel=Master", image: images.librarySolo },
			{ label: "No-tuition options", href: "/courses?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only", image: images.deskStudy },
		],
	},
	"pt-br": {
		eyebrow: "Planeje por destino",
		title: "Comece pelo país e depois compare os programas.",
		intro: "Explore universidades públicas e privadas na Alemanha, Áustria e Suíça com filtros pensados para estudantes internacionais.",
		countries: [
			{ name: "Alemanha", text: "Catálogo grande de universidades públicas, muitos mestrados em inglês e opções fortes em engenharia, dados, negócios e ciências.", href: "/pt-br/cursos?country=Germany", image: images.libraryGroup },
			{ name: "Áustria", text: "Opções compactas e de qualidade, bons campi urbanos e uma oferta crescente de programas em inglês.", href: "/pt-br/cursos?country=Austria", image: images.studyTable },
			{ name: "Suíça", text: "Universidades focadas em pesquisa, instituições de ciências aplicadas e ambientes de estudo multilíngues.", href: "/pt-br/cursos?country=Switzerland", image: images.laptopSearch },
		],
		guideEyebrow: "Da busca à shortlist",
		guideTitle: "Use filtros normalizados para escapar de dados bagunçados.",
		guideText: "O Study in DACH organiza informações brutas das universidades em categorias úteis: nível, área, idioma, tipo de mensalidade, formato, localização e perfil de candidatura.",
		guideHref: "/pt-br/guia-de-estudos",
		guideCta: "Abrir guia de estudos",
		pathsTitle: "Formas populares de explorar",
		paths: [
			{ label: "Programas em inglês", href: "/pt-br/cursos?languageOfInstruction=English", image: images.collaboration },
			{ label: "Mestrados", href: "/pt-br/cursos?degreeLevel=Master", image: images.librarySolo },
			{ label: "Opções sem mensalidade", href: "/pt-br/cursos?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only", image: images.deskStudy },
		],
	},
	es: {
		eyebrow: "Planifica por destino",
		title: "Empieza por el país y después compara los programas.",
		intro: "Explora universidades públicas y privadas en Alemania, Austria y Suiza con filtros pensados para estudiantes internacionales.",
		countries: [
			{ name: "Alemania", text: "Gran catálogo de universidades públicas, muchos másteres en inglés y opciones fuertes en ingeniería, datos, negocios y ciencias.", href: "/es/programas?country=Germany", image: images.libraryGroup },
			{ name: "Austria", text: "Opciones compactas y de calidad, buenos campus urbanos y una oferta creciente de programas en inglés.", href: "/es/programas?country=Austria", image: images.studyTable },
			{ name: "Suiza", text: "Universidades orientadas a investigación, opciones de ciencias aplicadas y entornos de estudio multilingües.", href: "/es/programas?country=Switzerland", image: images.laptopSearch },
		],
		guideEyebrow: "De la búsqueda a la shortlist",
		guideTitle: "Usa filtros normalizados para evitar datos desordenados.",
		guideText: "Study in DACH agrupa información universitaria en categorías útiles: nivel, área, idioma, tipo de matrícula, modalidad, ubicación y perfil de admisión.",
		guideHref: "/es/guia-para-estudiar",
		guideCta: "Abrir guía",
		pathsTitle: "Formas populares de explorar",
		paths: [
			{ label: "Programas en inglés", href: "/es/programas?languageOfInstruction=English", image: images.collaboration },
			{ label: "Maestrías", href: "/es/programas?degreeLevel=Master", image: images.librarySolo },
			{ label: "Opciones sin matrícula", href: "/es/programas?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only", image: images.deskStudy },
		],
	},
} satisfies Record<PublicLocale, {
	eyebrow: string
	title: string
	intro: string
	countries: Array<{ name: string; text: string; href: string; image: string }>
	guideEyebrow: string
	guideTitle: string
	guideText: string
	guideHref: string
	guideCta: string
	pathsTitle: string
	paths: Array<{ label: string; href: string; image: string }>
}>

export default function SectionVisualBlocks({ locale = "en" }: { locale?: PublicLocale }) {
	const ui = copy[locale]

	return (
		<>
			<section className="position-relative bg-secondary-2 py-120 rounded-bottom-4 overflow-hidden">
				<div className="container">
					<div className="row align-items-end mb-6">
						<div className="col-lg-7">
							<span className="btn-text fw-bold text-primary">
								<i className="ri-map-pin-line text-green-3" />
								&nbsp; {ui.eyebrow}
							</span>
							<h2 className="ds-3 text-primary mt-3 mb-0">{ui.title}</h2>
						</div>
						<div className="col-lg-5">
							<p className="mb-0 fs-5 text-muted">{ui.intro}</p>
						</div>
					</div>
					<div className="row g-4">
						{ui.countries.map((country) => (
							<div className="col-lg-4" key={country.name}>
								<Link href={country.href} className="home-photo-card d-block h-100 overflow-hidden bg-white">
									<img src={country.image} alt="" className="w-100" />
									<div className="p-4">
										<h3 className="text-primary mb-2">{country.name}</h3>
										<p className="mb-0 text-muted">{country.text}</p>
									</div>
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="position-relative bg-white py-120 rounded-bottom-4 overflow-hidden">
				<div className="container">
					<div className="row g-5 align-items-center">
						<div className="col-lg-6">
							<img src={images.collaboration} alt="" className="home-wide-image w-100" />
						</div>
						<div className="col-lg-6">
							<span className="btn-text fw-bold text-primary">
								<i className="ri-filter-3-line text-green-3" />
								&nbsp; {ui.guideEyebrow}
							</span>
							<h2 className="ds-3 text-primary mt-3">{ui.guideTitle}</h2>
							<p className="fs-5 text-muted">{ui.guideText}</p>
							<Link href={ui.guideHref} className="btn btn-primary mt-3">{ui.guideCta}</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="position-relative bg-primary py-120 rounded-bottom-4 overflow-hidden">
				<div className="container">
					<div className="d-flex flex-wrap align-items-end justify-content-between gap-4 mb-6">
						<div>
							<span className="btn-text fw-bold text-green-3">
								<i className="ri-compass-3-line text-green-3" />
								&nbsp; Study in DACH
							</span>
							<h2 className="ds-3 text-white mb-0 mt-3">{ui.pathsTitle}</h2>
						</div>
					</div>
					<div className="row g-4">
						{ui.paths.map((path) => (
							<div className="col-md-4" key={path.href}>
								<Link href={path.href} className="home-path-tile d-block position-relative overflow-hidden">
									<img src={path.image} alt="" className="w-100" />
									<span>{path.label}</span>
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	)
}
