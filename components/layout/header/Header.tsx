import Link from 'next/link'
import MobileMenu from '../MobileMenu'

const navItems = [
	{ label: 'Home', href: '/' },
	{ label: 'Courses', href: '/courses' },
	{ label: 'Universities', href: '/universities' },
	{ label: 'Study Guide', href: '/study-guide' },
	{ label: 'About', href: '/about' },
	{ label: 'Contact', href: '/contact' },
]

function SiteLogo() {
	return (
		<img src="/logo.png" alt="Study in DACH" style={{ width: 170, height: 54, objectFit: 'contain' }} />
	)
}

export default function Header({ scroll, isMobileMenu, handleMobileMenu }: any) {
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
					<nav className={`navbar navbar-expand-lg navbar-transparent border-bottom border-top border-white border-opacity-10 p-0 shadow-none ${scroll ? 'navbar-stick top-0 position-fixed' : ''}`}>
						<div className="container">
							<Link className="navbar-brand py-5" href="/">
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
								<form action="/courses" className="input-group position-relative d-none d-md-flex w-auto">
									<input type="text" className="form-control rounded-start-4 text-white bg-white bg-opacity-25 border-0" name="q" placeholder="Search programs..." />
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
							<Link className="d-flex align-items-center gap-2" href="/">
								<SiteLogo />
							</Link>
						</div>
						<div className="offCanvas__side-info mb-30">
							<div className="contact-list mb-30">
								<h4>Study in DACH</h4>
								<p>Find degree programs across Germany, Austria, and Switzerland.</p>
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
