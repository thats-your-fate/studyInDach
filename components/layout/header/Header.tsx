'use client'

import { navItemsByLocale } from '@/lib/i18n'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import MobileMenu from '../MobileMenu'

function SiteLogo() {
	return (
		<img src="/logo.png" alt="Study in DACH" style={{ width: 170, height: 54, objectFit: 'contain' }} />
	)
}

export default function Header({ scroll, isMobileMenu, handleMobileMenu }: any) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const locale = pathname?.startsWith('/pt-br') ? 'pt-br' : pathname?.startsWith('/es') ? 'es' : 'en'
	const navItems = navItemsByLocale[locale]
	const coursesPath = locale === 'pt-br' ? '/pt-br/cursos' : locale === 'es' ? '/es/programas' : '/courses'
	const languageLinks = buildLanguageLinks(pathname || '/', searchParams.toString())
	const contactHeader = pathname === '/contact' || pathname === '/pt-br/contato'

	return (
		<>
			<header>
				<div className="position-absolute top-0 start-0 w-100 header-11">
					<div className="top-bar bg-primary @@display position-relative z-2">
						<div className="container d-flex flex-wrap gap-2 justify-content-md-between justify-content-center align-items-center">
							<div className="d-flex justify-content-center gap-3 align-self-stretch">
								<a href="mailto:y3591vy@gmail.com" className="fs-7 d-flex align-items-center border-start border-end border-opacity-10 border-white px-3">
									<i className="ri-mail-open-line text-white" />
									<span className="text-secondary-2 border-opacity-10"> &nbsp; y3591vy@gmail.com </span>
								</a>
							</div>
							<div className="social-icons d-none d-md-flex">
								{['bi-facebook', 'bi-twitter-x', 'bi-linkedin', 'bi-behance'].map((icon, index) => (
									<Link key={icon} href="#" className={`border border-top-0 text-white border-bottom-0 border-opacity-10 border-white icon-shape icon-md ${index === 0 ? 'border-end-0' : ''}`}>
										<span className="text-white">
											<i className={`bi ${icon}`} />
										</span>
									</Link>
								))}
							</div>
						</div>
					</div>
					<nav className={`navbar navbar-expand-lg navbar-transparent border-bottom border-top border-white border-opacity-10 p-0 shadow-none ${contactHeader ? 'contact-navbar-solid' : ''} ${scroll ? 'navbar-stick top-0 position-fixed' : ''}`}>
						<div className="container">
							<Link className="navbar-brand py-5" href={locale === 'pt-br' ? '/pt-br' : locale === 'es' ? '/es' : '/'}>
								<SiteLogo />
							</Link>
							<div className="d-none d-lg-flex me-auto ms-5 align-self-stretch z-35 position-relative">
								<ul className="navbar-nav mx-auto gap-4 align-items-lg-center">
									{navItems.map((item) => (
										<li className="nav-item" key={item.href}>
											<Link className="nav-link text-uppercase" href={item.href}>{item.label}</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="d-flex align-items-center gap-4 align-self-stretch">
								<LanguageSwitcher currentLocale={locale} links={languageLinks} />
								<form action={coursesPath} className="input-group position-relative d-none d-md-flex w-auto">
									<input type="text" className="form-control rounded-start-4 text-white bg-white bg-opacity-25 border-0" name="q" placeholder={locale === 'pt-br' ? 'Buscar programas...' : locale === 'es' ? 'Buscar programas...' : 'Search programs...'} />
									<div className="border-0 rounded-end-4 bg-white bg-opacity-25 ms-0">
										<button className="btn btn-yellow px-4 bg-transparent h-100 rounded-4 aos-init aos-animate" type="submit" id="button-search" aria-label="search">
											<i className="ri-search-line text-green-3" />
										</button>
									</div>
								</form>
								<div className="burger-icon burger-icon-white border rounded-3 top-0 end-0" onClick={handleMobileMenu}>
									<span className="burger-icon-top" />
									<span className="burger-icon-mid" />
									<span className="burger-icon-bottom" />
								</div>
							</div>
						</div>
					</nav>
					<div className="offCanvas__info">
						<div className="offCanvas__close-icon menu-close">
							<button className="btn-close" aria-label="Close"><i className="ri-close-line" /></button>
						</div>
						<div className="offCanvas__logo mb-30">
							<Link className="d-flex align-items-center gap-2" href={locale === 'pt-br' ? '/pt-br' : locale === 'es' ? '/es' : '/'}>
								<SiteLogo />
							</Link>
						</div>
						<div className="offCanvas__side-info mb-30">
							<div className="contact-list mb-30">
								<h4>Study in DACH</h4>
								<p>{locale === 'pt-br' ? 'Encontre programas de estudo na Alemanha, Áustria e Suíça.' : locale === 'es' ? 'Encuentra programas de estudio en Alemania, Austria y Suiza.' : 'Find degree programs across Germany, Austria, and Switzerland.'}</p>
							</div>
							<div className="contact-list mb-30">
								<h4>Email</h4>
								<p><a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></p>
							</div>
						</div>
						<div className="offCanvas__social-icon mt-30">
							{['bi-facebook', 'bi-twitter-x', 'bi-linkedin', 'bi-behance'].map((icon) => (
								<Link key={icon} href="#"><i className={`bi ${icon}`} /></Link>
							))}
						</div>
					</div>
					<div className="offCanvas__overly" />
					<MobileMenu isMobileMenu={isMobileMenu} handleMobileMenu={handleMobileMenu} />
				</div>
			</header>
		</>
	)
}

function LanguageSwitcher({ currentLocale, links }: { currentLocale: string; links: Record<'en' | 'pt-br' | 'es', string> }) {
	const currentLanguage = languages.find((language) => language.locale === currentLocale) || languages[0]
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div
			className={`language-switcher language-dropdown d-none d-lg-flex ${isOpen ? 'open' : ''}`}
			aria-label={currentLocale === 'pt-br' ? 'Seletor de idioma' : currentLocale === 'es' ? 'Selector de idioma' : 'Language switcher'}
			onMouseEnter={() => setIsOpen(true)}
		>
			<button
				type="button"
				className="language-dropdown-toggle"
				aria-haspopup="true"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((value) => !value)}
			>
				<span aria-hidden="true">{currentLanguage.flag}</span>
				<span>{currentLanguage.short}</span>
				<i className="ri-arrow-down-s-line" />
			</button>
			<div className="language-dropdown-menu">
				{languages.map((language) => (
					<Link
						key={language.locale}
						href={links[language.locale]}
						className={currentLocale === language.locale ? 'active' : ''}
						hrefLang={language.hrefLang}
						onClick={() => {
							setLocaleCookie(language.locale)
							setIsOpen(false)
						}}
					>
						<span aria-hidden="true">{language.flag}</span>
						<span>{language.label}</span>
					</Link>
				))}
			</div>
		</div>
	)
}

const languages: Array<{ locale: 'en' | 'pt-br' | 'es'; hrefLang: string; flag: string; short: string; label: string }> = [
	{ locale: 'en', hrefLang: 'en', flag: '🇺🇸', short: 'EN', label: 'English' },
	{ locale: 'pt-br', hrefLang: 'pt-BR', flag: '🇧🇷', short: 'PT', label: 'Português' },
	{ locale: 'es', hrefLang: 'es', flag: '🇪🇸', short: 'ES', label: 'Español' },
]

function buildLanguageLinks(pathname: string, query: string) {
	const suffix = query ? `?${query}` : ''
	const localePairs: Record<string, string> = {
		'/': '/pt-br',
		'/courses': '/pt-br/cursos',
		'/universities': '/pt-br/universidades',
		'/study-guide': '/pt-br/guia-de-estudos',
		'/about': '/pt-br/sobre',
		'/contact': '/pt-br/contato',
		'/privacy': '/pt-br/privacidade',
	}
	const esPairs: Record<string, string> = {
		'/': '/es',
		'/courses': '/es/programas',
		'/universities': '/es/universidades',
		'/study-guide': '/es/guia-para-estudiar',
		'/about': '/es/sobre',
		'/contact': '/es/contacto',
		'/privacy': '/es/privacidad',
	}
	const reversePairs = Object.fromEntries(Object.entries(localePairs).map(([en, pt]) => [pt, en]))
	const reverseEsPairs = Object.fromEntries(Object.entries(esPairs).map(([en, es]) => [es, en]))
	const enPath = pathname.startsWith('/pt-br/cursos/')
		? pathname.replace(/^\/pt-br\/cursos/, '/courses')
		: pathname.startsWith('/es/programas/')
			? pathname.replace(/^\/es\/programas/, '/courses')
		: pathname.startsWith('/pt-br/universidades/')
			? pathname.replace(/^\/pt-br\/universidades/, '/universities')
		: pathname.startsWith('/es/universidades/')
			? pathname.replace(/^\/es\/universidades/, '/universities')
		: reversePairs[pathname] || reverseEsPairs[pathname] || pathname.replace(/^\/(pt-br|es)/, '') || '/'
	const ptPath = pathname.startsWith('/courses/')
		? pathname.replace(/^\/courses/, '/pt-br/cursos')
		: pathname.startsWith('/universities/')
			? pathname.replace(/^\/universities/, '/pt-br/universidades')
		: localePairs[pathname] || (pathname.startsWith('/pt-br') ? pathname : pathname)
	const esPath = pathname.startsWith('/courses/')
		? pathname.replace(/^\/courses/, '/es/programas')
		: pathname.startsWith('/universities/')
			? pathname.replace(/^\/universities/, '/es/universidades')
		: esPairs[enPath] || esPairs[pathname] || (pathname.startsWith('/es') ? pathname : enPath)

	return {
		en: `${enPath}${suffix}`,
		pt: `${ptPath}${suffix}`,
		'pt-br': `${ptPath}${suffix}`,
		es: `${esPath}${suffix}`,
	}
}

function setLocaleCookie(locale: 'en' | 'pt-br' | 'es') {
	document.cookie = `studyindach_locale=${locale}; path=/; max-age=31536000; samesite=lax`
}
