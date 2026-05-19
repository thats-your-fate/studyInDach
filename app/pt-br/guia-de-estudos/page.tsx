import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
	title: "Guia para estudar na Alemanha, Áustria e Suíça | Study in DACH",
	description: "Guias práticos em português para comparar cursos, custos, idiomas, prazos e universidades na Alemanha, Áustria e Suíça.",
	alternates: {
		canonical: absoluteUrl("/pt-br/guia-de-estudos"),
		languages: {
			en: absoluteUrl("/study-guide"),
			es: absoluteUrl("/es/guia-para-estudiar"),
			"pt-BR": absoluteUrl("/pt-br/guia-de-estudos"),
			"x-default": absoluteUrl("/study-guide"),
		},
	},
}

const guideItems = [
	{
		title: "Estudar na Alemanha",
		body: "Entenda como comparar universidades, tipos de curso, idiomas de ensino e custos antes de escolher uma candidatura na Alemanha.",
		href: "/pt-br/estudar-na-alemanha",
	},
	{
		title: "Estudar na Áustria",
		body: "Veja pontos importantes para pesquisar programas austríacos, incluindo prazos, taxas, idioma e diferenças entre instituições.",
		href: "/pt-br/guia-de-estudos/estudar-na-austria",
	},
	{
		title: "Estudar na Suíça",
		body: "Compare opções suíças com atenção a custo de vida, idioma local, estrutura acadêmica e requisitos oficiais de cada universidade.",
		href: "/pt-br/guia-de-estudos/estudar-na-suica",
	},
	{
		title: "Bacharelado, mestrado e doutorado",
		body: "Conheça as diferenças entre níveis acadêmicos e use filtros para encontrar programas compatíveis com seu histórico.",
		href: "/pt-br/guia-de-estudos/bacharelado-mestrado-doutorado",
	},
	{
		title: "Programas em inglês",
		body: "Encontre cursos com ensino em inglês e confira se há exigências adicionais de alemão, francês, italiano ou outro idioma.",
		href: "/pt-br/mestrado-na-alemanha-em-ingles",
	},
	{
		title: "Universidades públicas",
		body: "Use a base de dados para descobrir opções públicas, mas confirme taxas semestrais, serviços e regras de admissão no site oficial.",
		href: "/pt-br/universidades-publicas-na-alemanha",
	},
	{
		title: "Custos, taxas e comprovação financeira",
		body: "Compare mensalidade, taxa semestral, moradia, seguro e possíveis comprovantes financeiros sem assumir que dado ausente significa gratuito.",
		href: "/pt-br/guia-de-estudos/custos-taxas-comprovacao-financeira",
	},
	{
		title: "Requisitos de idioma",
		body: "Veja como interpretar requisitos como B2, C1, inglês acadêmico e possíveis exigências específicas para candidatos internacionais.",
		href: "/pt-br/guia-de-estudos/requisitos-de-idioma",
	},
	{
		title: "Prazos de candidatura",
		body: "Prazos variam por país, universidade, curso e perfil do candidato. Use o guia para organizar sua verificação oficial.",
		href: "/pt-br/guia-de-estudos/prazos-de-candidatura",
	},
	{
		title: "Como comparar programas",
		body: "Aprenda a comparar campo de estudo, idioma, formato, duração, custos e requisitos antes de montar sua lista curta.",
		href: "/pt-br/guia-de-estudos/como-comparar-programas",
	},
]

const filteredLinks = [
	{
		title: "Mestrados na Alemanha",
		body: "Explore programas de mestrado na Alemanha e refine por área, idioma e formato.",
		href: "/pt-br/mestrado-na-alemanha",
	},
	{
		title: "Mestrados em inglês",
		body: "Veja mestrados na Alemanha marcados com inglês como idioma de ensino.",
		href: "/pt-br/mestrado-na-alemanha-em-ingles",
	},
	{
		title: "Sem mensalidade ou apenas taxa semestral",
		body: "Encontre programas na Alemanha classificados como sem mensalidade ou apenas com taxa semestral.",
		href: "/pt-br/universidades-publicas-na-alemanha",
	},
	{
		title: "Informática na Alemanha",
		body: "Compare programas de ciência da computação, dados, IA e áreas relacionadas.",
		href: "/pt-br/estudar-informatica-na-alemanha",
	},
	{
		title: "Engenharia na Alemanha",
		body: "Explore programas de engenharia e tecnologia em universidades alemãs.",
		href: "/pt-br/estudar-engenharia-na-alemanha",
	},
	{
		title: "Doutorado na Alemanha",
		body: "Veja programas de doutorado e confirme o modelo de candidatura na página oficial.",
		href: "/pt-br/doutorado-na-alemanha",
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
					<div className="row g-5 align-items-start mb-6">
						<div className="col-lg-5">
							<span className="btn-text text-primary">Notas de planejamento</span>
							<h2 className="my-3 text-anime-style-3">Guias práticos para estudar na Alemanha, Áustria e Suíça</h2>
							<p>Nossos filtros ajudam você a selecionar programas no DACH. Use estes guias como ponto de partida para comparar opções, planejar perguntas e confirmar detalhes diretamente com a universidade.</p>
							<Link href="/pt-br/cursos" className="btn btn-primary mt-3 hover-up">Ver programas</Link>
						</div>
						<div className="col-lg-7">
							<div className="program-info-grid">
								{guideItems.map((item) => (
									<Link href={item.href} className="program-summary-card hover-up" key={item.title}>
										<h3>{item.title}</h3>
										<p>{item.body}</p>
									</Link>
								))}
							</div>
						</div>
					</div>
					<div className="program-detail-section">
						<div className="section-heading">
							<p>Atalhos de pesquisa</p>
							<h2>Comece por filtros úteis</h2>
						</div>
						<div className="program-summary-grid">
							{filteredLinks.map((item) => (
								<Link href={item.href} className="program-summary-card hover-up" key={item.title}>
									<h3>{item.title}</h3>
									<p>{item.body}</p>
								</Link>
							))}
						</div>
					</div>
					<div className="university-panel mt-4">
						<p className="mb-0">O Study in DACH não é a universidade oficial. Os dados dos programas são coletados de fontes públicas e podem estar incompletos ou desatualizados. Sempre confirme prazos, taxas, requisitos de idioma, documentos e regras de admissão no site oficial da universidade.</p>
					</div>
				</div>
			</section>
		</Layout>
	)
}
