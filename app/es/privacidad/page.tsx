import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
	title: "Privacidad | Study in DACH",
	description: "Información de privacidad de Study in DACH.",
	alternates: {
		canonical: absoluteUrl("/es/privacidad"),
		languages: {
			en: absoluteUrl("/privacy"),
			es: absoluteUrl("/es/privacidad"),
			"pt-BR": absoluteUrl("/pt-br/privacidade"),
			"x-default": absoluteUrl("/privacy"),
		},
	},
}

export default function PrivacyEsPage() {
	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="program-detail-section">
						<div className="section-heading">
							<p>Privacidad</p>
							<h1>Política de privacidad</h1>
						</div>
						<p>Study in DACH es independiente y no es un sitio web oficial de ninguna universidad. Recopilamos solo la información necesaria para operar el sitio, responder solicitudes y mejorar el servicio.</p>
						<div className="program-summary-grid">
							<PrivacyCard title="Solicitudes del formulario de contacto">
								<p>Cuando envías el formulario de contacto u orientación gratuita, almacenamos los datos que proporcionas, como nombre, email, país de residencia, país de estudio preferido, mensaje, confirmación de consentimiento, programa seleccionado, idioma de la página, página de origen, referencia y parámetros UTM si existen.</p>
								<p>Usamos esta información para responder a tu solicitud y entender qué páginas generan consultas.</p>
							</PrivacyCard>
							<PrivacyCard title="Contacto por email">
								<p>Si nos contactas por email, procesamos tu dirección de email y tu mensaje para responder. Tu proveedor de email y nuestro proveedor pueden procesar datos técnicos de entrega.</p>
							</PrivacyCard>
							<PrivacyCard title="Registros del servidor">
								<p>El proveedor de alojamiento puede crear registros del servidor con datos técnicos como dirección IP, navegador, URL solicitada, hora de la solicitud e información de errores. Estos registros se usan para seguridad, depuración y entrega fiable del sitio.</p>
							</PrivacyCard>
							<PrivacyCard title="Analytics">
								<p>El código actual de Study in DACH no usa ningún servicio externo de analytics. Si se añade analytics más adelante, esta página debe actualizarse inmediatamente con el proveedor, la finalidad, el periodo de retención y las opciones de control.</p>
							</PrivacyCard>
							<PrivacyCard title="Base de uso y retención">
								<p>Los datos de solicitud se usan para responder al pedido realizado por ti y para realizar pasos solicitados antes de una posible relación de servicio. Los registros técnicos básicos se usan por intereses operativos y de seguridad.</p>
								<p>Mantenemos las solicitudes solo durante el tiempo necesario para seguimiento, administración del servicio y registros razonables, y luego las eliminamos o anonimizamos cuando ya no sean necesarias.</p>
							</PrivacyCard>
							<PrivacyCard title="Contacto">
								<p>Para preguntas de privacidad, correcciones o solicitudes de eliminación, contacta: <a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></p>
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
