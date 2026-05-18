import Link from 'next/link'
import MobileMenu from '../MobileMenu'

export default function Header({ scroll, isMobileMenu, handleMobileMenu }: any) {
	return (
		<>
			<header>
				<div className="position-absolute top-0 start-0 w-100 header-11">
					{/* TOP-BAR 5 */}
					<div className="top-bar bg-primary @@display position-relative z-2">
						<div className="container d-flex flex-wrap gap-2 justify-content-md-between justify-content-center align-items-center">
							<div className="d-flex justify-content-center gap-3 align-self-stretch">
								<Link href="/#" className="fs-7 d-flex align-items-center border-start border-end border-opacity-10 border-white px-3">
									<i className="ri-mail-open-line text-white" />
									<span className="text-secondary-2 border-opacity-10"> &nbsp; info@astrax.com </span>
								</Link>
								<Link href="/telto:(123) 456 789 00" className="fs-7 d-flex align-items-center border-end border-opacity-10 border-white pe-3">
									<i className="ri-phone-line text-white" />
									<span className="text-secondary-2 border-opacity-10"> +(123) 456 789 00 </span>
								</Link>
							</div>
							<div className="social-icons d-none d-md-flex">
								<Link href="/#" className="border border-top-0 text-white border-bottom-0 border-end-0 border-opacity-10 border-white icon-shape icon-md">
									<span className="text-white">
										<i className="bi bi-facebook" />
									</span>
								</Link>
								<Link href="/#" className="border border-top-0 text-white border-bottom-0 border-end-0 border-opacity-10 border-white icon-shape icon-md">
									<span className="text-white">
										<i className="bi bi-twitter-x" />
									</span>
								</Link>
								<Link href="/#" className="border border-top-0 text-white border-bottom-0 border-opacity-10 border-white icon-shape icon-md">
									<span className="text-white">
										<i className="bi bi-linkedin" />
									</span>
								</Link>
								<Link href="/#" className="border border-top-0 text-white border-bottom-0 border-start-0 border-opacity-10 border-white icon-shape icon-md">
									<span className="text-white">
										<i className="bi bi-behance" />
									</span>
								</Link>
							</div>
						</div>
					</div>
					<nav className={`navbar navbar-expand-lg navbar-transparent border-bottom border-top border-white border-opacity-10 p-0 shadow-none ${scroll ? 'navbar-stick top-0 position-fixed' : ''}`}>
						<div className="container">
							<Link className="navbar-brand py-5" href="/">
								<svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} viewBox="0 0 40 40" fill="none">
									<path className="fill-green-3" d="M24.5043 9.79724L22.7082 18.3981L35.2929 17.1948L37.1117 7.00605L24.5043 9.79724Z" />
									<path className="fill-green-3" d="M31.9171 17.6837L23.2697 20.6189L30.6333 30.3865L40.723 26.6545L31.9171 17.6837Z" />
									<path className="fill-green-3" d="M28.4204 27.86L21.4605 22.2312L16.332 33.3249L24.7296 39.7347L28.4204 27.86Z" />
									<path className="fill-green-3" d="M17.5913 29.998L19.1912 21.3633L6.63465 22.8288L5.04812 33.0511L17.5913 29.998Z" />
									<path className="fill-green-3" d="M10.2917 22.1777L18.8717 19.0632L11.2859 9.45346L1.28177 13.3945L10.2917 22.1777Z" />
									<path className="fill-green-3" d="M13.7243 12.2243L20.8121 17.7054L25.6875 6.50938L17.1442 0.277556L13.7243 12.2243Z" />
								</svg>
								<h5 className="mb-0 text-white">Astrax</h5>
							</Link>
							<div className="d-none d-lg-flex me-auto ms-5 align-self-stretch z-35 position-relative">
								<ul className="navbar-nav mx-auto gap-4 align-items-lg-center">
									<li className="nav-item">
										<Link className="nav-link text-uppercase" href="/"> Home </Link>
									</li>
									<li className="nav-item">
										<Link className="nav-link text-uppercase" href="/about"> About </Link>
									</li>
									<li className="nav-item dropdown menu-item-has-children">
										<Link className="nav-link text-uppercase" href="/#" role="button" data-bs-toggle="dropdown" aria-expanded="false"> Courses </Link>
										<ul className="dropdown-menu">
											<li><Link className="dropdown-item text-capitalize" href="/courses">All Our Courses</Link>
											</li>
											<li><Link className="dropdown-item text-capitalize" href="/single-courses">Finance &amp;
												Accounting</Link></li>
											<li><Link className="dropdown-item text-capitalize" href="/single-courses">IT &amp;
												Software</Link></li>
											<li><Link className="dropdown-item text-capitalize" href="/single-courses">Office
												Productivity</Link></li>
											<li><Link className="dropdown-item text-capitalize" href="/single-courses">Personal
												Development</Link></li>
											<li><Link className="dropdown-item text-capitalize" href="/single-courses">Photography
												&amp; Video</Link></li>
											<li><Link className="dropdown-item text-capitalize" href="/single-courses">Health &amp;
												Fitness</Link></li>
										</ul>
									</li>
									<li className="nav-item dropdown menu-item-has-children">
										<Link className="nav-link text-uppercase" href="/#" role="button" data-bs-toggle="dropdown" aria-expanded="false"> Instructor </Link>
										<ul className="dropdown-menu">
											<li><Link className="dropdown-item text-capitalize" href="/instructor">All
												Instructors</Link></li>
											<li><Link className="dropdown-item text-capitalize" href="/instructor-details">Instructor Details</Link></li>
										</ul>
									</li>
									<li className="nav-item dropdown menu-item-has-children">
										<Link className="nav-link text-uppercase" href="/#" role="button" data-bs-toggle="dropdown" aria-expanded="false"> Blog </Link>
										<ul className="dropdown-menu">
											<li><Link className="dropdown-item text-capitalize" href="/blog">Blog Listing</Link></li>
											<li><Link className="dropdown-item text-capitalize" href="/blog-details">Blog
												Details</Link></li>
										</ul>
									</li>
									<li className="nav-item">
										<Link className="nav-link text-uppercase" href="/contact">Contact</Link>
									</li>
								</ul>
							</div>
							<div className="d-flex align-items-center gap-4 align-self-stretch">
								<form className="input-group position-relative d-none d-md-flex w-auto">
									<input type="text" className="form-control rounded-start-4 text-white bg-white bg-opacity-25 border-0" name="search" placeholder="Search here..." />
									<div className="border-0 rounded-end-4 bg-white bg-opacity-25 ms-0">
										<button className="btn btn-yellow px-4 bg-transparent h-100 rounded-4 aos-init aos-animate" type="submit" id="button-search" aria-label="search">
											<i className="ri-search-line text-green-3" />
										</button>
									</div>
								</form>
								<a className="menu-tigger d-none d-lg-block py-5 align-self-stretch align-items-center">
									<svg xmlns="http://www.w3.org/2000/svg" width={19} height={19} viewBox="0 0 19 19" fill="none">
										<rect width={3} height={3} fill="#D5D52B" />
										<rect y={8} width={3} height={3} fill="#D5D52B" />
										<rect y={16} width={3} height={3} fill="#D5D52B" />
										<rect x={8} width={3} height={3} fill="#D5D52B" />
										<rect x={8} y={8} width={3} height={3} fill="#D5D52B" />
										<rect x={16} y={16} width={3} height={3} fill="#D5D52B" />
										<rect x={16} width={3} height={3} fill="#D5D52B" />
										<rect x={16} y={8} width={3} height={3} fill="#D5D52B" />
									</svg>
								</a>
								<div className="burger-icon burger-icon-white border rounded-3 top-0 end-0" onClick={handleMobileMenu}>
									<span className="burger-icon-top" />
									<span className="burger-icon-mid" />
									<span className="burger-icon-bottom" />
								</div>
							</div>
						</div>
					</nav>
					{/* offCanvas-menu */}
					<div className="offCanvas__info">
						<div className="offCanvas__close-icon menu-close">
							<button className="btn-close" aria-label="Close"><i className="ri-close-line" /></button>
						</div>
						<div className="offCanvas__logo mb-30">
							<Link className="d-flex align-items-center gap-2" href="/">
								<svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} viewBox="0 0 40 40" fill="none">
									<g>
										<path className="fill-green-3" d="M24.5043 9.79724L22.7082 18.3981L35.2929 17.1948L37.1117 7.00605L24.5043 9.79724Z">
										</path>
										<path className="fill-green-3" d="M31.9171 17.6837L23.2697 20.6189L30.6333 30.3865L40.723 26.6545L31.9171 17.6837Z">
										</path>
										<path className="fill-green-3" d="M28.4204 27.86L21.4605 22.2312L16.332 33.3249L24.7296 39.7347L28.4204 27.86Z">
										</path>
										<path className="fill-green-3" d="M17.5913 29.998L19.1912 21.3633L6.63465 22.8288L5.04812 33.0511L17.5913 29.998Z">
										</path>
										<path className="fill-green-3" d="M10.2917 22.1777L18.8717 19.0632L11.2859 9.45346L1.28177 13.3945L10.2917 22.1777Z">
										</path>
										<path className="fill-green-3" d="M13.7243 12.2243L20.8121 17.7054L25.6875 6.50938L17.1442 0.277556L13.7243 12.2243Z">
										</path>
									</g>
								</svg>
								<h5 className="mb-0 text-dark">Astrax</h5>
							</Link>
						</div>
						<div className="offCanvas__side-info mb-30">
							<div className="contact-list mb-30">
								<h4>Office Address</h4>
								<p>
									123/A, Miranda City Likaoli <br />
									Prikano, Dope
								</p>
							</div>
							<div className="contact-list mb-30">
								<h4>Phone Number</h4>
								<p>+0989 7876 9865 9</p>
								<p>+(090) 8765 86543 85</p>
							</div>
							<div className="contact-list mb-30">
								<h4>Email Address</h4>
								<p>info@example.com</p>
								<p>example.mail@hum.com</p>
							</div>
						</div>
						<div className="offCanvas__social-icon mt-30">
							<Link href="/javascript:void(0)"><i className="bi bi-facebook" /></Link>
							<Link href="/javascript:void(0)"><i className="bi bi-twitter-x" /></Link>
							<Link href="/javascript:void(0)"><i className="bi bi-linkedin" /></Link>
							<Link href="/javascript:void(0)"><i className="bi bi-behance" /></Link>
						</div>
					</div>
					<div className="offCanvas__overly" />
					{/* Offcanvas search */}
					<div className="offcanvas offcanvas-top" tabIndex={-1} id="offcanvasTop">
						<div className="offcanvas-header">
							<button className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
						</div>
						<div className="offcanvas-body">
							<div className="container">
								<div className="row">
									<div className="col-8 mx-auto">
										<h3 className="mb-4">What are you looking for?</h3>
										<form className="input-group mb-3" data-aos="zoom-in">
											<input type="text" className="form-control" placeholder="Enter Your Keywords" aria-label="Enter Your Keywords" aria-describedby="button-addon2" />
											<button className="btn btn-primary rounded-end-2" type="submit" aria-label="search" id="button-addon2">
												<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
													<path d="M19.25 19.25L15.5 15.5M4.75 11C4.75 7.54822 7.54822 4.75 11 4.75C14.4518 4.75 17.25 7.54822 17.25 11C17.25 14.4518 14.4518 17.25 11 17.25C7.54822 17.25 4.75 14.4518 4.75 11Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</button>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* Offcanvas search */}
					<MobileMenu isMobileMenu={isMobileMenu} handleMobileMenu={handleMobileMenu} />
				</div>
			</header>

		</>
	)
}
