import Layout from "@/components/layout/Layout"
import { optionLabel } from "@/lib/i18n"
import { absoluteUrl } from "@/lib/seo"
import { getCoursesPageData, type CourseSearchParams, type ProgramCard } from "@/lib/study-programs"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type LandingParams = {
	params: { landing: string }
}

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
	"estudar-na-alemanha": {
		slug: "estudar-na-alemanha",
		title: "Estudar na Alemanha",
		metaTitle: "Estudar na Alemanha: programas de graduação, mestrado e doutorado | Study in DACH",
		description: "Veja programas de estudo na Alemanha e compare opções por nível, área, idioma, custos e formato.",
		intro: "A Alemanha reúne universidades públicas e privadas com programas em diferentes áreas, idiomas e formatos. Use esta página como ponto de partida para comparar opções e depois confirme requisitos, prazos e custos no site oficial da universidade.",
		filters: { country: "Germany" },
		notes: [
			"Confira se o programa é integral, parcial, presencial, online ou híbrido antes de montar sua lista.",
			"Programas em inglês podem exigir algum nível de alemão para módulos, estágio ou vida cotidiana.",
			"Dados de mensalidade e taxas devem sempre ser confirmados na página oficial do programa.",
			"Requisitos de admissão variam bastante entre universidades e áreas de estudo.",
		],
		faq: [
			{ question: "Posso estudar na Alemanha em inglês?", answer: "Sim, há programas com ensino em inglês, especialmente em nível de mestrado. Ainda assim, verifique se o programa exige alemão adicional." },
			{ question: "Universidade pública na Alemanha é sempre gratuita?", answer: "Não necessariamente. Muitas cobram apenas taxa semestral, mas algumas têm mensalidades, taxas específicas ou regras por estado e perfil do estudante." },
			{ question: "Como comparar programas alemães?", answer: "Compare nível, área, idioma, duração, custos, formato, requisitos acadêmicos e página oficial de candidatura." },
		],
		relatedLinks: [
			{ label: "Ver mestrados na Alemanha", href: "/pt-br/mestrado-na-alemanha" },
			{ label: "Programas em inglês", href: "/pt-br/mestrado-na-alemanha-em-ingles" },
			{ label: "Universidades públicas", href: "/pt-br/universidades-publicas-na-alemanha" },
		],
	},
	"mestrado-na-alemanha": {
		slug: "mestrado-na-alemanha",
		title: "Mestrado na Alemanha",
		metaTitle: "Mestrado na Alemanha: encontre programas de Master | Study in DACH",
		description: "Compare programas de mestrado na Alemanha por área, idioma, universidade, custos e formato de estudo.",
		intro: "Mestrados na Alemanha podem ser acadêmicos, aplicados, presenciais, online ou híbridos. A melhor escolha depende do seu histórico, idioma, área de interesse e requisitos oficiais de cada universidade.",
		filters: { degreeLevel: "Master", country: "Germany" },
		notes: [
			"Leia os requisitos acadêmicos com atenção, especialmente créditos ECTS e área de formação anterior.",
			"Confira se o início é no semestre de inverno, verão ou ambos.",
			"Programas de mestrado podem ter admissão aberta, restrita ou avaliação de aptidão.",
			"Use a página oficial para confirmar prazos e documentos antes de qualquer candidatura.",
		],
		faq: [
			{ question: "Preciso falar alemão para fazer mestrado na Alemanha?", answer: "Depende do programa. Há mestrados em inglês, em alemão e mistos. Verifique o idioma de ensino e os certificados exigidos." },
			{ question: "Todo mestrado alemão aceita qualquer bacharelado?", answer: "Não. Muitos exigem graduação em área relacionada, créditos mínimos ou disciplinas específicas." },
			{ question: "Como filtrar bons mestrados?", answer: "Comece por área de estudo, idioma, cidade, tipo de mensalidade, formato e nível de competitividade da admissão." },
		],
		relatedLinks: [
			{ label: "Mestrados em inglês", href: "/pt-br/mestrado-na-alemanha-em-ingles" },
			{ label: "Informática na Alemanha", href: "/pt-br/estudar-informatica-na-alemanha" },
			{ label: "Engenharia na Alemanha", href: "/pt-br/estudar-engenharia-na-alemanha" },
		],
	},
	"mestrado-na-alemanha-em-ingles": {
		slug: "mestrado-na-alemanha-em-ingles",
		title: "Mestrado na Alemanha em inglês",
		metaTitle: "Mestrado na Alemanha em inglês: programas para estudantes internacionais | Study in DACH",
		description: "Explore mestrados na Alemanha com inglês como idioma de ensino e compare áreas, universidades, custos e requisitos.",
		intro: "Mestrados em inglês são uma das portas de entrada mais procuradas por estudantes internacionais na Alemanha. Mesmo quando o ensino é em inglês, requisitos acadêmicos, certificados e prazos variam por universidade.",
		filters: { degreeLevel: "Master", country: "Germany", languageOfInstruction: "English" },
		notes: [
			"Confirme se o programa é totalmente em inglês ou se combina inglês e alemão.",
			"Verifique certificados aceitos, pontuação mínima e validade dos testes de idioma.",
			"Observe se há foco acadêmico, pesquisa, aplicação profissional ou interdisciplinar.",
			"Não assuma que ausência de mensalidade significa ausência de custos semestrais ou de vida.",
		],
		faq: [
			{ question: "Mestrado em inglês na Alemanha exige alemão?", answer: "Alguns não exigem alemão para admissão, mas podem recomendar ou exigir alemão para estágios, módulos específicos ou integração local." },
			{ question: "É possível estudar em universidade pública em inglês?", answer: "Sim, há programas em inglês em universidades públicas. Verifique sempre a página oficial para taxas e requisitos." },
			{ question: "Como encontrar mestrados em inglês?", answer: "Use filtros de nível Master, país Germany e idioma English para ver programas compatíveis na base." },
		],
		relatedLinks: [
			{ label: "Todos os mestrados na Alemanha", href: "/pt-br/mestrado-na-alemanha" },
			{ label: "Informática em inglês", href: "/pt-br/cursos?degreeLevel=Master&country=Germany&languageOfInstruction=English&studyField=Computer%20Science%20%26%20Data" },
			{ label: "Ver catálogo filtrado", href: "/pt-br/cursos?degreeLevel=Master&country=Germany&languageOfInstruction=English" },
		],
	},
	"universidades-publicas-na-alemanha": {
		slug: "universidades-publicas-na-alemanha",
		title: "Universidades públicas na Alemanha",
		metaTitle: "Universidades públicas na Alemanha com programas de estudo | Study in DACH",
		description: "Explore programas na Alemanha classificados como sem mensalidade ou apenas com taxa semestral.",
		intro: "Universidades públicas alemãs costumam ser muito procuradas por estudantes internacionais, mas custos e regras variam. Esta página mostra uma prévia de programas classificados como sem mensalidade ou apenas com taxa semestral.",
		filters: { country: "Germany", tuitionType: "No Tuition / Semester Fee Only" },
		notes: [
			"Confirme a taxa semestral diretamente com a universidade.",
			"Alguns estados, perfis de estudante ou programas específicos podem ter regras diferentes.",
			"Compare também idioma, cidade, custo de vida e requisitos acadêmicos.",
			"Use a classificação de mensalidade como ponto de partida, não como garantia final.",
		],
		faq: [
			{ question: "Universidade pública na Alemanha é gratuita?", answer: "Muitos programas não cobram mensalidade, mas pode haver taxa semestral, custos administrativos e despesas de vida." },
			{ question: "Como saber se uma universidade é pública?", answer: "Verifique o perfil da universidade e, principalmente, o site oficial. Esta página prioriza programas com tipo de mensalidade favorável." },
			{ question: "Esses dados substituem a página oficial?", answer: "Não. Use a listagem para descoberta e confirme tudo no site oficial da universidade." },
		],
		relatedLinks: [
			{ label: "Estudar na Alemanha", href: "/pt-br/estudar-na-alemanha" },
			{ label: "Mestrados na Alemanha", href: "/pt-br/mestrado-na-alemanha" },
			{ label: "Catálogo filtrado", href: "/pt-br/cursos?country=Germany&tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only" },
		],
	},
	"estudar-informatica-na-alemanha": {
		slug: "estudar-informatica-na-alemanha",
		title: "Estudar informática na Alemanha",
		metaTitle: "Estudar informática na Alemanha: programas de Computer Science & Data | Study in DACH",
		description: "Compare programas de informática, ciência da computação e dados na Alemanha.",
		intro: "A Alemanha oferece programas em informática, ciência da computação, dados, IA e áreas relacionadas. Compare idioma, nível, foco acadêmico e requisitos para encontrar opções compatíveis com seu perfil.",
		filters: { country: "Germany", studyField: "Computer Science & Data" },
		notes: [
			"Verifique se o programa é mais teórico, aplicado, interdisciplinar ou voltado a pesquisa.",
			"Leia requisitos de matemática, programação e créditos prévios.",
			"Programas de dados e IA podem aparecer em áreas interdisciplinares ou engenharia.",
			"Confira idioma de ensino e se há módulos obrigatórios em alemão.",
		],
		faq: [
			{ question: "Há programas de informática em inglês na Alemanha?", answer: "Sim, especialmente em mestrado. Use o filtro de idioma para limitar a programas com inglês." },
			{ question: "Preciso ter graduação em computação?", answer: "Depende do programa. Muitos exigem formação relacionada, créditos específicos ou experiência técnica." },
			{ question: "Informática inclui IA e dados?", answer: "Na base, muitos programas de IA, dados e software aparecem em Computer Science & Data, mas vale checar também áreas secundárias." },
		],
		relatedLinks: [
			{ label: "Mestrados em inglês", href: "/pt-br/mestrado-na-alemanha-em-ingles" },
			{ label: "Mestrados de informática", href: "/pt-br/cursos?degreeLevel=Master&country=Germany&studyField=Computer%20Science%20%26%20Data" },
			{ label: "Estudar engenharia", href: "/pt-br/estudar-engenharia-na-alemanha" },
		],
	},
	"estudar-engenharia-na-alemanha": {
		slug: "estudar-engenharia-na-alemanha",
		title: "Estudar engenharia na Alemanha",
		metaTitle: "Estudar engenharia na Alemanha: programas de Engineering & Technology | Study in DACH",
		description: "Encontre programas de engenharia e tecnologia na Alemanha e compare idioma, nível, custos e formato.",
		intro: "Engenharia na Alemanha pode abranger mecânica, elétrica, civil, produção, tecnologia, energia e áreas aplicadas. Use os filtros para comparar níveis, formatos, idiomas e universidades.",
		filters: { country: "Germany", studyField: "Engineering & Technology" },
		notes: [
			"Verifique se o programa é de universidade, universidade de ciências aplicadas ou outro tipo de instituição.",
			"Compare requisitos de matemática, física, estágios e experiência profissional.",
			"Cursos aplicados podem ter forte vínculo com projetos, laboratórios e indústria.",
			"Confirme idioma de ensino e documentos diretamente no programa oficial.",
		],
		faq: [
			{ question: "Engenharia na Alemanha existe em inglês?", answer: "Sim, há programas em inglês e mistos. A disponibilidade varia por nível e especialidade." },
			{ question: "Qual engenharia escolher?", answer: "Compare currículo, área técnica, cidade, idioma, custos e requisitos prévios com seu histórico acadêmico." },
			{ question: "Universidades aplicadas são uma opção?", answer: "Sim, muitas oferecem programas práticos. Confira o perfil da instituição e a estrutura do programa." },
		],
		relatedLinks: [
			{ label: "Mestrados na Alemanha", href: "/pt-br/mestrado-na-alemanha" },
			{ label: "Engenharia em inglês", href: "/pt-br/cursos?country=Germany&studyField=Engineering%20%26%20Technology&languageOfInstruction=English" },
			{ label: "Universidades públicas", href: "/pt-br/universidades-publicas-na-alemanha" },
		],
	},
	"doutorado-na-alemanha": {
		slug: "doutorado-na-alemanha",
		title: "Doutorado na Alemanha",
		metaTitle: "Doutorado na Alemanha: encontre programas de Doctorate | Study in DACH",
		description: "Explore programas de doutorado na Alemanha e compare áreas, idioma, universidade e requisitos.",
		intro: "Doutorados na Alemanha podem seguir modelos estruturados, pesquisa individual ou programas vinculados a escolas de pós-graduação. Use esta página para descobrir opções e confirmar detalhes oficiais com a universidade.",
		filters: { degreeLevel: "Doctorate", country: "Germany" },
		notes: [
			"Verifique se o programa exige supervisor, proposta de pesquisa ou candidatura por escola estruturada.",
			"Idioma de trabalho pode variar por área, grupo de pesquisa e universidade.",
			"Financiamento, contrato e bolsa não devem ser presumidos pela listagem do programa.",
			"Confirme prazos, documentos e requisitos acadêmicos no site oficial.",
		],
		faq: [
			{ question: "Doutorado na Alemanha é sempre um programa estruturado?", answer: "Não. Pode ser pesquisa individual, programa estruturado ou outro formato. A página oficial explica o caminho correto." },
			{ question: "Preciso de orientador antes de me candidatar?", answer: "Em muitos casos sim, mas depende do programa e da área. Verifique as instruções oficiais." },
			{ question: "Doutorado pode ser em inglês?", answer: "Sim, especialmente em pesquisa internacional, mas requisitos de idioma variam por universidade e grupo." },
		],
		relatedLinks: [
			{ label: "Estudar na Alemanha", href: "/pt-br/estudar-na-alemanha" },
			{ label: "Doutorados no catálogo", href: "/pt-br/cursos?degreeLevel=Doctorate&country=Germany" },
			{ label: "Orientação gratuita", href: "/pt-br/contato" },
		],
	},
}

export function generateMetadata({ params }: LandingParams): Metadata {
	const page = landingPages[params.landing]
	if (!page) return {}
	return {
		title: page.metaTitle,
		description: page.description,
		alternates: {
			canonical: absoluteUrl(`/pt-br/${page.slug}`),
			languages: {
				"pt-BR": absoluteUrl(`/pt-br/${page.slug}`),
			},
		},
		openGraph: {
			title: page.metaTitle,
			description: page.description,
			url: absoluteUrl(`/pt-br/${page.slug}`),
			type: "website",
		},
	}
}

export default async function PtLandingPage({ params }: LandingParams) {
	const page = landingPages[params.landing]
	if (!page) notFound()

	const data = await getCoursesPageData(page.filters, "pt-br")
	const programs = data.programs.slice(0, 9)
	const filteredCatalogPath = catalogPath(page.filters)
	const contactPath = `/pt-br/contato?landingPath=${encodeURIComponent(`/pt-br/${page.slug}`)}`

	return (
		<Layout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(page, programs)) }}
			/>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-search-eye-line text-green-3" />
						&nbsp; guia de estudos
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">{page.title}</h1>
				</div>
			</section>
			<section className="py-120 bg-white">
				<div className="container">
					<div className="row g-5 align-items-start mb-6">
						<div className="col-lg-7">
							<span className="btn-text text-primary">Programas filtrados no Study in DACH</span>
							<h2 className="my-3 text-anime-style-3">Compare opções antes de ir para a página oficial</h2>
							<p>{page.intro}</p>
							<div className="d-flex flex-wrap gap-3 mt-4">
								<Link href={filteredCatalogPath} className="btn btn-primary hover-up">Ver todos os programas filtrados</Link>
								<Link href={contactPath} className="btn btn-outline-secondary hover-up">Receber orientação gratuita</Link>
							</div>
						</div>
						<div className="col-lg-5">
							<div className="program-detail-section h-100">
								<div className="section-heading">
									<p>Notas práticas</p>
									<h3>Antes de escolher</h3>
								</div>
								<ul className="program-bullet-list">
									{page.notes.map((note) => <li key={note}>{note}</li>)}
								</ul>
							</div>
						</div>
					</div>

					<div className="program-detail-section mb-5">
						<div className="section-heading">
							<p>Prévia de programas</p>
							<h2>{data.totalMatching} programas encontrados</h2>
						</div>
						<div className="related-program-grid">
							{programs.map((program) => (
								<ProgramPreviewCard key={program.id} program={program} />
							))}
						</div>
						<div className="text-center mt-5">
							<Link href={filteredCatalogPath} className="btn btn-outline-secondary hover-up">Abrir catálogo completo</Link>
						</div>
					</div>

					<div className="program-cta-card mb-5">
						<div>
							<span>Orientação gratuita</span>
							<h3>Quer ajuda para comparar opções?</h3>
							<p>Conte seu perfil, idioma preferido, orçamento e país de interesse. Ajudamos você a entender os próximos passos com base em informações públicas dos programas.</p>
						</div>
						<Link href={contactPath} className="btn btn-primary hover-up">Receber orientação gratuita</Link>
					</div>

					<div className="program-detail-section mb-5">
						<div className="section-heading">
							<p>Perguntas frequentes</p>
							<h2>Dúvidas comuns</h2>
						</div>
						<div className="program-summary-grid">
							{page.faq.map((item) => (
								<div className="program-summary-card" key={item.question}>
									<h3>{item.question}</h3>
									<p>{item.answer}</p>
								</div>
							))}
						</div>
					</div>

					<div className="program-detail-section mb-5">
						<div className="section-heading">
							<p>Links internos</p>
							<h2>Continue pesquisando</h2>
						</div>
						<div className="program-summary-grid">
							{page.relatedLinks.map((item) => (
								<Link href={item.href} className="program-summary-card hover-up" key={item.href}>
									<h3>{item.label}</h3>
									<p>Abra uma página relacionada para comparar programas por outro ângulo.</p>
								</Link>
							))}
						</div>
					</div>

					<div className="university-panel">
						<p className="mb-0">O Study in DACH não é a universidade oficial. Os dados dos programas são coletados de fontes públicas e podem estar incompletos ou desatualizados. Sempre confirme prazos, taxas, requisitos de idioma, documentos e regras de admissão no site oficial da universidade.</p>
					</div>
				</div>
			</section>
		</Layout>
	)
}

function ProgramPreviewCard({ program }: { program: ProgramCard }) {
	const meta = [
		optionLabel(program.degreeLevel, "pt-br"),
		optionLabel(program.studyField || program.subjectArea, "pt-br"),
		optionLabel(compactLanguages(program.languageOfInstruction), "pt-br"),
	].filter(Boolean).join(" · ")
	const location = [program.location, optionLabel(program.country, "pt-br")].filter(Boolean).join(", ")
	const summary = program.summary?.trim()

	return (
		<Link href={program.detailPath} className="related-program-card">
			<span>{meta}</span>
			<h3>{program.title}</h3>
			<p className="mb-1">{program.universityName}</p>
			{location && <p className="mb-1">{location}</p>}
			{summary && <p>{summary.slice(0, 150)}{summary.length > 150 ? "..." : ""}</p>}
		</Link>
	)
}

function catalogPath(filters: CourseSearchParams) {
	const params = new URLSearchParams()
	Object.entries(filters).forEach(([key, value]) => {
		const values = Array.isArray(value) ? value : value ? [value] : []
		values.forEach((item) => params.append(key === "language" ? "languageOfInstruction" : key, item))
	})
	return `/pt-br/cursos?${params.toString()}`
}

function itemListJsonLd(page: LandingConfig, programs: ProgramCard[]) {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: page.title,
		url: absoluteUrl(`/pt-br/${page.slug}`),
		itemListElement: programs.map((program, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(program.detailPath),
			item: {
				"@type": "Course",
				name: program.title,
				description: program.summary || undefined,
				provider: {
					"@type": "CollegeOrUniversity",
					name: program.universityName,
				},
				educationalCredentialAwarded: program.academicDegree || program.degreeLevel,
				inLanguage: program.languageOfInstruction || undefined,
			},
		})),
	}
}

function compactLanguages(value: string) {
	const normalized = value
		.split(/[;,/|+]+/)
		.map((item) => item.trim())
		.filter(Boolean)
		.map((item) => {
			if (/english|englisch|anglais|ingl[eê]s/i.test(item)) return "English"
			if (/german|deutsch|alem[aã]o/i.test(item)) return "German"
			return item
		})
	return Array.from(new Set(normalized)).join(" / ")
}
