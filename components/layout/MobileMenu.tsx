'use client'
import { navItemsByLocale } from '@/lib/i18n'
import { getLocalizedStaticUrl, staticRouteKeyFromPath, type LocalizedStaticRouteKey } from '@/lib/localized-static-urls'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function MobileMenu({ isMobileMenu, handleMobileMenu }: any) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const locale = pathname?.startsWith('/pt-br') ? 'pt-br' : pathname?.startsWith('/es') ? 'es' : 'en'
	const navItems = navItemsByLocale[locale]
	const fallbackLanguageLinks = useMemo(() => buildLanguageLinks(pathname || '/', searchParams.toString()), [pathname, searchParams])
	const [languageLinks, setLanguageLinks] = useState(fallbackLanguageLinks)

	useEffect(() => {
		setLanguageLinks(readDocumentLanguageLinks(fallbackLanguageLinks, locale))
	}, [fallbackLanguageLinks, locale])

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
								{['bi-facebook', 'bi-twitter-x', 'bi-linkedin'].map((icon) => (
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
	const routeKey = staticRouteKeyFromPath(pathname) || dynamicIndexRouteKey(pathname)
	const enPath = routeKey ? withQuery(getLocalizedStaticUrl(routeKey, 'en'), query) : '/'
	const ptPath = routeKey ? withQuery(getLocalizedStaticUrl(routeKey, 'pt-br'), query) : '/pt-br'
	const esPath = routeKey ? withQuery(getLocalizedStaticUrl(routeKey, 'es'), query) : '/es'

	return {
		en: enPath,
		pt: ptPath,
		'pt-br': ptPath,
		es: esPath,
	}
}

function dynamicIndexRouteKey(pathname: string): LocalizedStaticRouteKey | null {
	if (/^\/(pt-br\/cursos|es\/programas|courses)\//.test(pathname)) return 'courses'
	if (/^\/(pt-br\/universidades|es\/universidades|universities)\//.test(pathname)) return 'universities'
	return null
}

function withQuery(pathname: string, query: string) {
	if (!query || pathname.includes('?')) return pathname
	return `${pathname}?${query}`
}

function readDocumentLanguageLinks<T extends Record<'en' | 'pt-br' | 'es', string>>(fallbackLinks: T, currentLocale: string): T {
	if (typeof document === 'undefined') return fallbackLinks
	const nextLinks = { ...fallbackLinks }
	const canonical = pathFromAbsoluteUrl(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || '')
	if (canonical) {
		if (currentLocale === 'pt-br') nextLinks['pt-br'] = canonical
		if (currentLocale === 'es') nextLinks.es = canonical
		if (currentLocale === 'en') nextLinks.en = canonical
	}
	document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]').forEach((link) => {
		const hrefLang = link.getAttribute('hreflang') || ''
		const href = pathFromAbsoluteUrl(link.href)
		if (!href) return
		if (hrefLang.toLowerCase() === 'en') nextLinks.en = href
		if (hrefLang.toLowerCase() === 'pt-br') nextLinks['pt-br'] = href
		if (hrefLang.toLowerCase() === 'es') nextLinks.es = href
	})
	return nextLinks as T
}

function pathFromAbsoluteUrl(value: string) {
	if (!value) return ''
	try {
		const url = new URL(value, window.location.origin)
		return `${url.pathname}${url.search}`
	} catch {
		return value
	}
}

function setLocaleCookie(locale: 'en' | 'pt-br' | 'es') {
	document.cookie = `studyindach_locale=${locale}; path=/; max-age=31536000; samesite=lax`
}
