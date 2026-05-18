import Link from 'next/link'

export default function Footer() {
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
										<h6 className="pb-3 text-white">Company</h6>
										<div className="d-flex flex-column">
											<Link href="/#">
												<p className="hover-effect-1 opacity-75 text-white">About</p>
											</Link>
											<Link href="/#">
												<p className="hover-effect-1 opacity-75 text-white">Features</p>
											</Link>
											<Link href="/#">
												<p className="hover-effect-1 opacity-75 text-white">Works</p>
											</Link>
											<Link href="/#">
												<p className="hover-effect-1 opacity-75 text-white">Career</p>
											</Link>
										</div>
									</div>
								</div>
								<div className="col-lg-6">
									<div className="position-relative text-center">
										<Link href="/elearning-home.htm" className="d-flex align-items-center gap-2 d-inline-flex">
											<svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} viewBox="0 0 40 40" fill="none">
												<g>
													<path className="fill-green-3" d="M24.5043 9.79724L22.7082 18.3981L35.2929 17.1948L37.1117 7.00605L24.5043 9.79724Z" />
													<path className="fill-green-3" d="M31.9171 17.6837L23.2697 20.6189L30.6333 30.3865L40.723 26.6545L31.9171 17.6837Z" />
													<path className="fill-green-3" d="M28.4204 27.86L21.4605 22.2312L16.332 33.3249L24.7296 39.7347L28.4204 27.86Z" />
													<path className="fill-green-3" d="M17.5913 29.998L19.1912 21.3633L6.63465 22.8288L5.04812 33.0511L17.5913 29.998Z" />
													<path className="fill-green-3" d="M10.2917 22.1777L18.8717 19.0632L11.2859 9.45346L1.28177 13.3945L10.2917 22.1777Z" />
													<path className="fill-green-3" d="M13.7243 12.2243L20.8121 17.7054L25.6875 6.50938L17.1442 0.277556L13.7243 12.2243Z" />
												</g>
											</svg>
											<h5 className="mb-0 text-white">Astrax</h5>
										</Link>
										<p className="fw-regular mt-5 mb-6 text-center px-md-10 px-0 opacity-75 text-white">
											Astrax embarks on a journey of learning <br className="d-block" />
											&amp; skill-building today.
										</p>
										<Link href="/https://maps.google.com/maps?q=1st+avenue,New+York">
											<p className="mb-0 text-white">
												12/A, New Booston Tower, <br />
												Tokyo, China
											</p>
										</Link>
										<Link href="/#">
											<p className="mb-0 text-white mt-3">info@astrax.com</p>
										</Link>
										<div data-aos="fade-up" className="line-border position-absolute top-0 start-0" />
										<div data-aos="fade-up" className="line-border position-absolute top-0 end-0" />
									</div>
								</div>
								<div className="col-lg-3">
									<div className="text-center position-relative">
										<div data-aos="fade-up" className="line-border position-absolute top-0 start-0 d-lg-none d-block" />
										<div data-aos="fade-up" className="line-border position-absolute top-0 end-0" />
										<h6 className="pb-3 text-white">Subject</h6>
										<div className="d-flex flex-column">
											<Link href="/#">
												<p className="hover-effect-1 opacity-75 text-white">Web Design</p>
											</Link>
											<Link href="/#">
												<p className="hover-effect-1 opacity-75 text-white">iOs App Development</p>
											</Link>
											<Link href="/#">
												<p className="hover-effect-1 opacity-75 text-white">Consultancy</p>
											</Link>
											<Link href="/#">
												<p className="hover-effect-1 opacity-75 text-white">Gym &amp; Yoga</p>
											</Link>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-green-3 rounded-3 p-md-5 p-4 text-center text-lg-start d-flex align-items-center justify-content-lg-between justify-content-center flex-wrap position-relative overflow-hidden">
								<div className="position-absolute top-50 start-50 translate-middle ps-5 opacity-10 z-0">
									<svg xmlns="http://www.w3.org/2000/svg" width={403} height={460} viewBox="0 0 403 460" fill="none">
										<path d="M38.3353 366.902V137.235L201.233 44.1543L364.171 137.235V322.748L201.233 415.846L115 366.563V181.723L201.233 132.446L287.5 181.723V278.254L201.233 327.537L191.671 322.075V226.222L239.867 198.668L201.233 176.6L153.335 203.987V344.31L201.233 371.692L325.835 300.489V159.488L201.233 88.3085L76.6705 159.488V388.798L201.233 460L402.5 345V115L201.233 0L0 115V345L38.3353 366.902Z" fill="#01473C" />
									</svg>
								</div>
								<h5 className="mb-lg-0 mb-4">
									Take action now to ensure compliance and <br />
									grow your business stress-free.
								</h5>
								<Link href="/contact" className="btn btn-primary hover-up">
									book a call
									<svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none">
										<g clipPath="url(#clip0_999_753)">
											<path d="M15.8167 7.55759C15.8165 7.5574 15.8163 7.55719 15.8161 7.557L12.5504 4.307C12.3057 4.06353 11.91 4.06444 11.6665 4.30912C11.423 4.55378 11.4239 4.9495 11.6686 5.193L13.8612 7.375H0.625C0.279813 7.375 0 7.65481 0 8C0 8.34519 0.279813 8.625 0.625 8.625H13.8612L11.6686 10.807C11.4239 11.0505 11.423 11.4462 11.6665 11.6909C11.91 11.9356 12.3058 11.9364 12.5504 11.693L15.8162 8.443C15.8163 8.44281 15.8165 8.44259 15.8167 8.4424C16.0615 8.19809 16.0607 7.80109 15.8167 7.55759Z" fill="white" />
										</g>
									</svg>
								</Link>
							</div>
							<div className="text-center py-4 d-flex align-items-center justify-content-center flex-wrap">
								<p className="text-white opacity-50 mb-0">Copyright &amp; design by</p>
								<Link href="/#" className="text-white">
									<span className="text-white opacity-100 fw-medium">&nbsp; ©Alithemes &nbsp;</span>
								</Link>
								<p className="text-white opacity-50 mb-0">{new Date().getFullYear()}, All Rights Reserved</p>
							</div>
						</div>
					</div>
					<div className="bg-primary position-absolute top-0 start-0 w-100 h-100" />
				</div>
			</footer>

		</>
	)
}
