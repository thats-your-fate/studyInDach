'use client'

import { footerUi } from '@/lib/i18n'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
	const pathname = usePathname()
	const locale = pathname?.startsWith('/pt-br') ? 'pt-br' : pathname?.startsWith('/es') ? 'es' : 'en'
	const ui = footerUi[locale]
	const links = locale === 'pt-br'
		? {
			home: '/pt-br',
			courses: '/pt-br/cursos',
			universities: '/pt-br/universidades',
			studyGuide: '/pt-br/guia-de-estudos',
			about: '/pt-br/sobre',
			privacy: '/pt-br/privacidade',
			english: '/pt-br/mestrado-na-alemanha-em-ingles',
			bachelor: '/pt-br/cursos?degreeLevel=Bachelor',
			master: '/pt-br/mestrado-na-alemanha',
			publicUniversities: '/pt-br/universidades-publicas-na-alemanha',
		}
		: locale === 'es'
			? {
				home: '/es',
				courses: '/es/programas',
				universities: '/es/universidades',
				studyGuide: '/es/guia-para-estudiar',
				about: '/es/sobre',
				privacy: '/es/privacidad',
				english: '/es/programas?languageOfInstruction=English',
				bachelor: '/es/programas?degreeLevel=Bachelor',
				master: '/es/programas?degreeLevel=Master',
				publicUniversities: '/es/programas?tuitionType=No+Tuition+%2F+Semester+Fee+Only',
			}
		: {
			home: '/',
			courses: '/courses',
			universities: '/universities',
			studyGuide: '/study-guide',
			about: '/about',
			privacy: '/privacy',
			english: '/courses?languageOfInstruction=English',
			bachelor: '/courses?degreeLevel=Bachelor',
			master: '/courses?degreeLevel=Master',
			publicUniversities: '/courses?tuitionType=No+Tuition+%2F+Semester+Fee+Only',
		}

	return (
		<>
			<footer>
				<div className="section-footer-11 position-relative overflow-hidden">
					<div className="container-fluid">
						<div className="container position-relative z-2">
							<div className="row pt-120 pb-120 g-lg-0 g-5">
								<div className="col-lg-3">
									<div className="text-center position-relative">
										<div data-aos="fade-up" className="line-border position-absolute top-0 start-0" />
										<div data-aos="fade-up" className="line-border position-absolute top-0 end-0 d-lg-none d-block" />
										<h6 className="pb-3 text-white">{ui.explore}</h6>
										<div className="d-flex flex-column">
											<Link href={links.courses}><p className="hover-effect-1 opacity-75 text-white">{ui.courses}</p></Link>
											<Link href={links.universities}><p className="hover-effect-1 opacity-75 text-white">{ui.universities}</p></Link>
											<Link href={links.studyGuide}><p className="hover-effect-1 opacity-75 text-white">{ui.studyGuide}</p></Link>
											<Link href={links.about}><p className="hover-effect-1 opacity-75 text-white">{ui.about}</p></Link>
											<Link href="/impressum"><p className="hover-effect-1 opacity-75 text-white">Impressum</p></Link>
											<Link href={links.privacy}><p className="hover-effect-1 opacity-75 text-white">{ui.privacy}</p></Link>
										</div>
									</div>
								</div>
								<div className="col-lg-6">
									<div className="position-relative text-center">
										<Link href={links.home} className="d-flex align-items-center gap-2 d-inline-flex">
											<img src="/logo.png" alt="Study in DACH" style={{ width: 190, height: 60, objectFit: 'contain' }} />
										</Link>
										<p className="fw-regular mt-5 mb-4 text-center px-md-10 px-0 opacity-75 text-white">
											{ui.description}
										</p>
										<p className="fw-regular mb-4 text-center px-md-8 px-0 opacity-75 text-white fs-7">
											{ui.disclaimer}
										</p>
										<a href="mailto:y3591vy@gmail.com">
											<p className="mb-0 text-white mt-3">y3591vy@gmail.com</p>
										</a>
										<div data-aos="fade-up" className="line-border position-absolute top-0 start-0" />
										<div data-aos="fade-up" className="line-border position-absolute top-0 end-0" />
									</div>
								</div>
								<div className="col-lg-3">
									<div className="text-center position-relative">
										<div data-aos="fade-up" className="line-border position-absolute top-0 start-0 d-lg-none d-block" />
										<div data-aos="fade-up" className="line-border position-absolute top-0 end-0" />
										<h6 className="pb-3 text-white">{ui.popularFilters}</h6>
										<div className="d-flex flex-column">
											<Link href={links.english}><p className="hover-effect-1 opacity-75 text-white">{ui.englishPrograms}</p></Link>
											<Link href={links.bachelor}><p className="hover-effect-1 opacity-75 text-white">{ui.bachelor}</p></Link>
											<Link href={links.master}><p className="hover-effect-1 opacity-75 text-white">{ui.master}</p></Link>
											<Link href={links.publicUniversities}><p className="hover-effect-1 opacity-75 text-white">{ui.publicUniversities}</p></Link>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-green-3 rounded-3 p-md-5 p-4 text-center text-lg-start d-flex align-items-center justify-content-lg-between justify-content-center flex-wrap position-relative overflow-hidden">
								<h5 className="mb-lg-0 mb-4">
									{ui.cta}
								</h5>
								<Link href={links.courses} className="btn btn-primary hover-up">
									{ui.browse}
									<svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none">
										<path d="M15.8167 7.55759C15.8165 7.5574 15.8163 7.55719 15.8161 7.557L12.5504 4.307C12.3057 4.06353 11.91 4.06444 11.6665 4.30912C11.423 4.55378 11.4239 4.9495 11.6686 5.193L13.8612 7.375H0.625C0.279813 7.375 0 7.65481 0 8C0 8.34519 0.279813 8.625 0.625 8.625H13.8612L11.6686 10.807C11.4239 11.0505 11.423 11.4462 11.6665 11.6909C11.91 11.9356 12.3058 11.9364 12.5504 11.693L15.8162 8.443C15.8163 8.44281 15.8165 8.44259 15.8167 8.4424C16.0615 8.19809 16.0607 7.80109 15.8167 7.55759Z" fill="white" />
									</svg>
								</Link>
							</div>
							<div className="text-center py-4 d-flex align-items-center justify-content-center flex-wrap">
								<p className="text-white opacity-50 mb-0">© {new Date().getFullYear()} Study in DACH. {ui.rights}</p>
							</div>
						</div>
					</div>
					<div className="bg-primary position-absolute top-0 start-0 w-100 h-100" />
				</div>
			</footer>
		</>
	)
}
