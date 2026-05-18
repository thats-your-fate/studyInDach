'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function MobileMenu({ isMobileMenu, handleMobileMenu }: any) {


	const [isAccordion, setIsAccordion] = useState(0)

	const handleAccordion = (key: any) => {
		setIsAccordion(prevState => prevState === key ? null : key)
	}
	return (
		<>
			<div className="mobile-menu-overlay" onClick={handleMobileMenu} />
			<div className={`mobile-header-active mobile-header-wrapper-style ${isMobileMenu ? 'sidebar-visible' : ''}`}>
				<div className="mobile-header-wrapper-inner">
					<div className="mobile-header-logo">
						<Link className="d-flex align-items-center gap-2" href="/">
							<svg className="fill-primary" xmlns="http://www.w3.org/2000/svg" width={35} height={40} viewBox="0 0 35 40" fill="none">
								<g clipPath="url(#clip0_349_1513)">
									<path d="M3.3335 31.9045V11.9335L17.4985 3.8395L31.667 11.9335V28.065L17.4985 36.1605L10 31.875V15.802L17.4985 11.517L25 15.802V24.196L17.4985 28.4815L16.667 28.0065V19.6715L20.858 17.2755L17.4985 15.3565L13.3335 17.738V29.94L17.4985 32.321L28.3335 26.1295V13.8685L17.4985 7.679L6.667 13.8685V33.8085L17.4985 40L35 30V10L17.4985 0L0 10V30L3.3335 31.9045Z" fill="#794AFF" />
								</g>
							</svg>
							<h5 className="mb-0">Astrax</h5>
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
										<li>
											<Link href="/">Homepages</Link>
										</li>
										<li>
											<Link href="/about">About Us</Link>
										</li>
										<li className="has-children">
											<span className="menu-expand" onClick={() => handleAccordion(1)}><i className="arrow-small-down" /></span>
											<Link href="/#">Courses</Link>
											<ul className="sub-menu" style={{ display: `${isAccordion  == 1 ? "block" : "none"}` }}>
												<li><Link href="/courses">All Our Courses</Link></li>
												<li><Link href="/single-courses">Finance &amp; Accounting</Link></li>
												<li><Link href="/single-courses">IT &amp; Software</Link></li>
												<li><Link href="/single-courses">Office Productivity</Link></li>
												<li><Link href="/single-courses">Personal Development</Link></li>
												<li><Link href="/single-courses">Photography &amp; Video</Link></li>
												<li><Link href="/single-courses">Health &amp; Fitness</Link></li>
											</ul>
										</li>
										<li className="has-children">
											<Link href="/#">Instructor</Link>
											<span className="menu-expand" onClick={() => handleAccordion(2)}><i className="arrow-small-down" /></span>
											<ul className="sub-menu" style={{ display: `${isAccordion  == 2 ? "block" : "none"}` }}>
												<li><Link href="/instructor">All Instructors</Link></li>
												<li><Link href="/instructor-details">Instructor Details</Link></li>
											</ul>
										</li>
										<li className="has-children">
											<span className="menu-expand" onClick={() => handleAccordion(3)}><i className="arrow-small-down" /></span>
											<Link href="/#">Blog</Link>
											<ul className="sub-menu" style={{ display: `${isAccordion  == 3 ? "block" : "none"}` }}>
												<li><Link href="/blog">Blog Listing</Link></li>
												<li><Link href="/blog-details">Blog Details</Link></li>
											</ul>
										</li>
										<li><Link href="/contact">Contact</Link></li>
									</ul>
								</nav>
							</div>
						</div>
					</div>
					<div className="tgmobile__menu-bottom mt-auto">
						<div className="contact-info">
							<ul className="list-wrap">
								<li><span className="opacity-50">Mail:</span> <Link href="/mailto:info@valom.com">info@astrax.com</Link></li>
								<li><span className="opacity-50">Phone:</span> <Link href="/tel:0123456789">+123 888 9999</Link>
								</li>
							</ul>
						</div>
						<div className="social-links">
							<div className="social-icons gap-4 mt-4">
								<Link href="/#" className="border border-opacity-10 border-white icon-shape icon-md">
									<i className="bi bi-facebook" />
								</Link>
								<Link href="/#" className="border border-opacity-10 border-white icon-shape icon-md">
									<i className="bi bi-twitter-x" />
								</Link>
								<Link href="/#" className="border border-opacity-10 border-white icon-shape icon-md">
									<i className="bi bi-linkedin" />
								</Link>
								<Link href="/#" className="border border-opacity-10 border-white icon-shape icon-md">
									<i className="bi bi-behance" />
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
