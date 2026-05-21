import type { PublicLocale } from "@/lib/i18n"

const contactHero = {
	en: {
		eyebrow: "contact",
		titlePrefix: "Contact",
		titleAccent: "Study in DACH",
	},
	"pt-br": {
		eyebrow: "contato",
		titlePrefix: "Contato",
		titleAccent: "Study in DACH",
	},
	es: {
		eyebrow: "contacto",
		titlePrefix: "Contacto",
		titleAccent: "Study in DACH",
	},
}

export default function Section1({ locale = "en" }: { locale?: PublicLocale }) {
	const ui = contactHero[locale]
	return (
		<>

			<section className="elearning-blog-details-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="banner-line">
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop-reverse" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop d-none d-lg-block" />
					<div className="vertical-effect border-opacity-10 border-end border-white d-none d-lg-block" />
				</div>
				<div className="position-absolute bottom-0 start-0 z-2">
					<img className="w-100" src="/assets/imgs/pages/learning/page-about/pattern.png" alt="Study in DACH" />
				</div>
				<div className="container position-relative pt-8 text-lg-start text-center">
					<div className="row align-items-center">
						<div className="col-12 text-center">
							<span className="content-top btn-text fw-bold text-white">
								<i className="ri-git-repository-line text-green-3" />
								&nbsp; {ui.eyebrow}
							</span>
							<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">
								{ui.titlePrefix}{" "}
								<span className="position-relative">
									{ui.titleAccent}
									<span className="position-absolute top-0 start-0 pt-5 z-0 d-none d-md-block">
										<svg xmlns="http://www.w3.org/2000/svg" width={268} height={22} viewBox="0 0 268 22" fill="none">
											<path d="M2 20C70.6975 12.6711 219.674 -1.06621 266 2.61526" stroke="#D5D52B" strokeWidth={3} strokeLinecap="round" />
										</svg>
									</span>
								</span>
							</h1>
						</div>
					</div>
				</div>
			</section>

		</>
	)
}
