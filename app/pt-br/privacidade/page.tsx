import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
	title: "Privacidade | Study in DACH",
	description: "Informações de privacidade do Study in DACH.",
	alternates: {
		canonical: absoluteUrl("/pt-br/privacidade"),
		languages: {
			en: absoluteUrl("/privacy"),
			es: absoluteUrl("/es/privacidad"),
			"pt-BR": absoluteUrl("/pt-br/privacidade"),
			"x-default": absoluteUrl("/privacy"),
		},
	},
}

export default function PrivacyPtPage() {
	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="program-detail-section">
						<div className="section-heading">
							<p>Privacidade</p>
							<h1>Política de privacidade</h1>
						</div>
						<p>O Study in DACH coleta apenas as informações necessárias para operar o site, responder solicitações e melhorar o serviço.</p>
						<div className="program-summary-grid">
							<PrivacyCard title="Solicitações pelo formulário de contato">
								<p>Quando você envia o formulário de contato ou orientação gratuita, armazenamos os dados fornecidos, como nome, email, país de residência, país de estudo preferido, mensagem, confirmação de consentimento, programa selecionado, idioma da página, página de origem, referência e parâmetros UTM quando existirem.</p>
								<p>Usamos essas informações para responder à sua solicitação e entender quais páginas geram pedidos de orientação.</p>
							</PrivacyCard>
							<PrivacyCard title="Contato por email">
								<p>Se você entrar em contato por email, processamos seu endereço de email e a mensagem para responder. Seu provedor de email e o nosso provedor podem processar dados técnicos de entrega.</p>
							</PrivacyCard>
							<PrivacyCard title="Logs do servidor">
								<p>O provedor de hospedagem pode criar logs do servidor com dados técnicos, como endereço IP, navegador, URL acessada, horário da solicitação e informações de erro. Esses logs são usados para segurança, depuração e funcionamento confiável do site.</p>
							</PrivacyCard>
							<PrivacyCard title="Analytics">
								<p>O código atual do Study in DACH não descreve nenhum serviço externo de analytics. Se analytics forem adicionados futuramente, esta página deve ser atualizada com provedor, finalidade, prazo de retenção e opções de controle.</p>
							</PrivacyCard>
							<PrivacyCard title="Base de uso e retenção">
								<p>Os dados de solicitação são usados para responder ao pedido feito por você e para realizar etapas solicitadas antes de qualquer possível relação de serviço. Logs técnicos básicos são usados por interesse operacional e de segurança.</p>
								<p>Mantemos solicitações apenas pelo tempo necessário para acompanhamento, administração do serviço e registros razoáveis, depois excluímos ou anonimizamos quando não forem mais necessárias.</p>
							</PrivacyCard>
							<PrivacyCard title="Contato">
								<p>Para dúvidas de privacidade, correções ou pedidos de exclusão, entre em contato: <a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></p>
							</PrivacyCard>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}

function PrivacyCard({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="program-summary-card">
			<h3>{title}</h3>
			{children}
		</div>
	)
}
