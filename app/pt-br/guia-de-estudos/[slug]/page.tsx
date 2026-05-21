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
	"bacharelado-mestrado-doutorado": {
		title: "Bacharelado, mestrado e doutorado",
		description: "Entenda diferenças entre níveis acadêmicos e compare programas no DACH.",
		intro: "Antes de escolher um programa, confirme se o nível combina com seu histórico acadêmico, objetivos e requisitos oficiais de admissão.",
		points: [
			"Bacharelados costumam exigir conclusão do ensino médio reconhecida e podem ter mais ofertas no idioma local.",
			"Mestrados geralmente exigem graduação relacionada, créditos mínimos ou disciplinas específicas.",
			"Doutorados podem exigir supervisor, proposta de pesquisa ou candidatura por escola estruturada.",
			"O nome do grau e os requisitos variam entre países, universidades e áreas.",
		],
		links: [
			{ label: "Bacharelados", href: "/pt-br/cursos?degreeLevel=Bachelor" },
			{ label: "Mestrados", href: "/pt-br/cursos?degreeLevel=Master" },
			{ label: "Doutorados", href: "/pt-br/doutorado-na-alemanha" },
		],
	},
	"custos-taxas-comprovacao-financeira": {
		title: "Custos, taxas e comprovação financeira",
		description: "Compare mensalidade, taxas, custo de vida e planejamento financeiro.",
		intro: "Custos de estudo não se resumem à mensalidade. Considere taxas semestrais, moradia, seguro, transporte e possíveis comprovações financeiras.",
		points: [
			"Dado ausente não significa programa gratuito.",
			"Taxas semestrais podem existir mesmo em universidades públicas.",
			"Custo de vida varia muito por cidade e país.",
			"Regras financeiras e documentos devem ser confirmados em fontes oficiais.",
		],
		links: [
			{ label: "Programas sem mensalidade", href: "/pt-br/cursos?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only" },
			{ label: "Universidades públicas na Alemanha", href: "/pt-br/universidades-publicas-na-alemanha" },
			{ label: "Contato", href: "/pt-br/contato" },
		],
	},
	"requisitos-de-idioma": {
		title: "Requisitos de idioma",
		description: "Como comparar idiomas de ensino e certificados exigidos por programas no DACH.",
		intro: "O idioma de ensino e o idioma exigido para admissão nem sempre são a mesma coisa. Leia a página oficial do programa com atenção.",
		points: [
			"Programas em inglês podem exigir alemão, francês ou italiano para módulos ou estágios.",
			"Certificados aceitos e pontuações mínimas variam por universidade.",
			"Algumas páginas indicam níveis como B2 ou C1 para admissão.",
			"Confirme validade do certificado, prazo de envio e exceções oficiais.",
		],
		links: [
			{ label: "Programas em inglês", href: "/pt-br/programas-em-ingles" },
			{ label: "Catálogo com filtro de idioma", href: "/pt-br/cursos?languageOfInstruction=English" },
			{ label: "Guia de estudos", href: "/pt-br/guia-de-estudos" },
		],
	},
	"prazos-de-candidatura": {
		title: "Prazos de candidatura",
		description: "Organize a verificação de prazos de candidatura para programas no DACH.",
		intro: "Prazos mudam por país, universidade, semestre, nível e perfil do candidato. Use a listagem para descobrir programas e a página oficial para confirmar datas.",
		points: [
			"Verifique se o início é no semestre de inverno, verão ou ambos.",
			"Alguns programas têm prazos diferentes para candidatos internacionais.",
			"Documentos traduzidos ou certificados podem levar tempo.",
			"Não dependa apenas de resumos agregados para decisões finais.",
		],
		links: [
			{ label: "Mestrados na Alemanha", href: "/pt-br/mestrado-na-alemanha" },
			{ label: "Catálogo completo", href: "/pt-br/cursos" },
			{ label: "Contato", href: "/pt-br/contato" },
		],
	},
	"como-comparar-programas": {
		title: "Como comparar programas",
		description: "Critérios práticos para comparar programas na Alemanha, Áustria e Suíça.",
		intro: "Uma boa comparação combina dados acadêmicos, idioma, custos, formato, requisitos e a página oficial de candidatura.",
		points: [
			"Comece por nível, área de estudo, país e idioma.",
			"Depois compare custos, duração, formato e requisitos de admissão.",
			"Leia o resumo, mas confirme detalhes no site oficial.",
			"Monte uma lista curta com opções realistas e alternativas.",
		],
		links: [
			{ label: "Ver programas", href: "/pt-br/cursos" },
			{ label: "Programas em inglês", href: "/pt-br/programas-em-ingles" },
			{ label: "Receber orientação gratuita", href: "/pt-br/contato" },
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
			canonical: absoluteUrl(`/pt-br/guia-de-estudos/${params.slug}`),
		},
	}
}

export default function PtGuideTopicPage({ params }: { params: { slug: string } }) {
	const page = pages[params.slug]
	if (!page) notFound()

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="program-detail-section">
						<div className="section-heading">
							<p>Guia de estudos</p>
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
									<p>Continue pesquisando com filtros e páginas relacionadas.</p>
								</Link>
							))}
						</div>
						<div className="university-panel mt-5">
							<p className="mb-0">O Study in DACH não é a universidade oficial. Sempre confirme prazos, taxas, requisitos e documentos no site oficial da universidade.</p>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}
