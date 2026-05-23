import type { PublicLocale } from "@/lib/i18n"

const marqueeText: Record<PublicLocale, string> = {
	en: "Degree programs in Germany, Austria, and Switzerland.",
	"pt-br": "Programas de estudo na Alemanha, Áustria e Suíça.",
	es: "Programas de estudio en Alemania, Austria y Suiza.",
}

export default function Section2({ locale = "en" }: { locale?: PublicLocale }) {
	return (
		<>

			<div className="bg-green-3 py-4 rounded-bottom-4 overflow-hidden">
				<h1 className="ds-1 mb-0 fw-bold text-primary text-uppercase text-nowrap scroll-move-left">{marqueeText[locale]}</h1>
			</div>

		</>
	)
}
