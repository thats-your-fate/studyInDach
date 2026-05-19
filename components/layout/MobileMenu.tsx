'use client'
import { navItemsByLocale } from '@/lib/i18n'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export default function MobileMenu({ isMobileMenu, handleMobileMenu }: any) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const locale = pathname?.startsWith('/pt-br') ? 'pt-br' : pathname?.startsWith('/es') ? 'es' : 'en'
	const navItems = navItemsByLocale[locale]
	const languageLinks = buildLanguageLinks(pathname || '/', searchParams.toString())

	return (
		<>
			<div className="mobile-menu-overlay" onClick={handleMobileMenu} />
			<div className={`mobile-header-active mobile-header-wrapper-style ${isMobileMenu ? 'sidebar-visible' : ''}`}>
				<div className="mobile-header-wrapper-inner">
					<div className="mobile-header-logo">
						<Link className="d-flex align-items-center gap-2" href={locale === 'pt-br' ? '/pt-br' : locale === 'es' ? '/es' : '/'}>
							<img src="/logo.png" alt="Study in DACH" style={{ width: 150, height: 48, objectFit: 'contain' }} />
						</Link>
						<div className={`burger-icon burger-icon-white border rounded-circle ${isMobileMenu ? 'burger-close' : ''}`} onClick={handleMobileMenu}>
							<span className="burger-icon-top" />
							<span className="burger-icon-mid" />
							<span className="burger-icon-bottom" />
						</div>
					</div>
					<div className="mobile-header-content-area">
						<div className="perfect-scroll">
							<div className="mobile-menu-wrap mobile-header-border">
								<nav>
									<ul className="mobile-menu ps-0">
										{navItems.map((item) => (
											<li key={item.href}><Link href={item.href}>{item.label}</Link></li>
										))}
									</ul>
								</nav>
							</div>
							<div className="mobile-language-switcher">
								<label htmlFor="mobile-language-select">{locale === 'pt-br' || locale === 'es' ? 'Idioma' : 'Language'}</label>
								<select
									id="mobile-language-select"
									value={locale}
									onChange={(event) => {
										const nextLocale = event.target.value as 'en' | 'pt-br' | 'es'
										setLocaleCookie(nextLocale)
										window.location.href = languageLinks[nextLocale]
									}}
								>
									<option value="en">🇺🇸 English</option>
									<option value="pt-br">🇧🇷 Português</option>
									<option value="es">🇪🇸 Español</option>
								</select>
							</div>
						</div>
					</div>
					<div className="tgmobile__menu-bottom mt-auto">
						<div className="contact-info">
							<ul className="list-wrap">
								<li><span className="opacity-50">Mail:</span> <a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></li>
							</ul>
						</div>
						<div className="social-links">
							<div className="social-icons gap-4 mt-4">
								{['bi-facebook', 'bi-twitter-x', 'bi-linkedin', 'bi-behance'].map((icon) => (
									<Link key={icon} href="#" className="border border-opacity-10 border-white icon-shape icon-md">
										<i className={`bi ${icon}`} />
									</Link>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

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
