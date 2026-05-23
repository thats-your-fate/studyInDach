import type { PublicLocale } from '@/lib/i18n'
import Link from 'next/link'

const heroCopy = {
	en: {
		eyebrow: 'degree discovery platform',
		titleStart: 'Find your degree',
		titleHighlight: 'DACH',
		searchAria: 'Search degree programs',
		searchPlaceholder: 'Search AI masters in Germany taught in English',
		country: 'Country',
		germany: 'Germany',
		austria: 'Austria',
		switzerland: 'Switzerland',
		english: 'English-taught',
		masters: 'Master programs',
		searchNow: 'search now',
		courses: '/courses',
		germanyHref: '/courses?country=Germany',
		austriaHref: '/courses?country=Austria',
		switzerlandHref: '/courses?country=Switzerland',
		englishHref: '/courses?languageOfInstruction=English',
		mastersHref: '/courses?degreeLevel=Master',
	},
	'pt-br': {
		eyebrow: 'plataforma de descoberta de cursos',
		titleStart: 'Encontre seu curso',
		titleHighlight: 'DACH',
		searchAria: 'Buscar programas de estudo',
		searchPlaceholder: 'Busque mestrados de IA na Alemanha em inglês',
		country: 'País',
		germany: 'Alemanha',
		austria: 'Áustria',
		switzerland: 'Suíça',
		english: 'Em inglês',
		masters: 'Mestrados',
		searchNow: 'buscar',
		courses: '/pt-br/cursos',
		germanyHref: '/pt-br/cursos?country=Germany',
		austriaHref: '/pt-br/cursos?country=Austria',
		switzerlandHref: '/pt-br/cursos?country=Switzerland',
		englishHref: '/pt-br/cursos?languageOfInstruction=English',
		mastersHref: '/pt-br/cursos?degreeLevel=Master',
	},
	es: {
		eyebrow: 'plataforma para descubrir programas',
		titleStart: 'Encuentra tu programa',
		titleHighlight: 'DACH',
		searchAria: 'Buscar programas de estudio',
		searchPlaceholder: 'Busca másteres de IA en Alemania en inglés',
		country: 'País',
		germany: 'Alemania',
		austria: 'Austria',
		switzerland: 'Suiza',
		english: 'En inglés',
		masters: 'Maestrías',
		searchNow: 'buscar',
		courses: '/es/programas',
		germanyHref: '/es/programas?country=Germany',
		austriaHref: '/es/programas?country=Austria',
		switzerlandHref: '/es/programas?country=Switzerland',
		englishHref: '/es/programas?languageOfInstruction=English',
		mastersHref: '/es/programas?degreeLevel=Master',
	},
} satisfies Record<PublicLocale, Record<string, string>>

export default function Section1({ locale = 'en' }: { locale?: PublicLocale }) {
	const copy = heroCopy[locale]
	return (
		<>

			<section className="elearning-home-section-1 position-relative pt-300 pb-200 bg-primary rounded-bottom-4">
				<div className="banner-line">
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white d-none d-lg-block" />
					<div className="vertical-effect border-opacity-10 border-end border-white d-none d-lg-block" />
				</div>
				<div className="position-absolute bottom-0 end-0 mb-80 me-10 z-0">
					<img className="w-100" src="/assets/imgs/pages/learning/page-home/home-section-1/pattern.png" alt="Study in DACH" />
				</div>
				<div className="container position-relative pt-lg-10 text-lg-start text-center">
					<div className="row align-items-center">
						<div className="col-lg-6 col-md-12 px-md-0 ">
							<span className="content-top btn-text fw-bold text-white">
								<i className="ri-git-repository-line text-green-3" />
								&nbsp; {copy.eyebrow}
							</span>
							<h1 className="text-white ds-1 lh-sm mb-5 text-anime-style-3">
								{copy.titleStart} <br /> in 
								<span className="text-green-3 position-relative   ps-3">
									 {copy.titleHighlight}
									<span className="position-absolute top-0 start-0 pt-5 z-0 d-none d-md-block">
										<svg xmlns="http://www.w3.org/2000/svg" width={370} height={22} viewBox="0 0 370 22" fill="none">
											<path d="M1.5 20.0001C97 12.8334 304.1 -0.599919 368.5 3.00008" stroke="#D5D52B" strokeWidth={3} strokeLinecap="round" />
										</svg>
									</span>
								</span>
							</h1>
							<form action={copy.courses} className="d-none d-md-block">
								<div className="input-group">
									<input type="text" name="q" className="form-control border-0 search rounded-start-4" aria-label={copy.searchAria} placeholder={copy.searchPlaceholder} />
									<button type="submit" aria-label="Industry" className="btn btn-yellow border-0 bg-white dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
										<span className="text-dark">{copy.country}</span>
									</button>
									<ul className="dropdown-menu dropdown-menu-end">
										<li><Link className="dropdown-item text-capitalize" href={copy.germanyHref}>{copy.germany}</Link></li>
										<li><Link className="dropdown-item text-capitalize" href={copy.austriaHref}>{copy.austria}</Link></li>
										<li><Link className="dropdown-item text-capitalize" href={copy.switzerlandHref}>{copy.switzerland}</Link></li>
										<li>
											<hr className="dropdown-divider" />
										</li>
										<li><Link className="dropdown-item text-capitalize" href={copy.englishHref}>{copy.english}</Link></li>
										<li><Link className="dropdown-item text-capitalize" href={copy.mastersHref}>{copy.masters}</Link></li>
									</ul>
									<button type="submit" aria-label={copy.searchNow} className="btn btn-white bg-green-3 rounded-end-4"><span className="text-dark">{copy.searchNow}</span></button>
								</div>
							</form>
						</div>
					</div>
				</div>
				<div className="banner-girl position-absolute bottom-0 start-50 z-2 d-none d-lg-block">
					<div className="position-relative z-1 overflow-hidden">
						<div className="parallax-item">
							<img src="/assets/imgs/pages/learning/page-home/home-section-1/banner-girl.png" alt="Student exploring degree programs" />
						</div>
					</div>
				</div>
			</section>

		</>
	)
}
