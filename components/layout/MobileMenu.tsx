'use client'
import Link from 'next/link'

const navItems = [
	{ label: 'Home', href: '/' },
	{ label: 'Courses', href: '/courses' },
	{ label: 'Universities', href: '/universities' },
	{ label: 'Study Guide', href: '/study-guide' },
	{ label: 'About', href: '/about' },
	{ label: 'Contact', href: '/contact' },
]

export default function MobileMenu({ isMobileMenu, handleMobileMenu }: any) {
	return (
		<>
			<div className="mobile-menu-overlay" onClick={handleMobileMenu} />
			<div className={`mobile-header-active mobile-header-wrapper-style ${isMobileMenu ? 'sidebar-visible' : ''}`}>
				<div className="mobile-header-wrapper-inner">
					<div className="mobile-header-logo">
						<Link className="d-flex align-items-center gap-2" href="/">
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
