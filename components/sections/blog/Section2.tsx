import Link from 'next/link'

export default function Section2() {
	return (
		<>

			<section className="elearning-courses-section-2 position-relative pt-120 rounded-bottom-4 overflow-hidden z-20">
				<div className="container">
					<div className="row">
						<div className="col-lg-8 mx-auto mb-80" data-aos="zoom-in">
							<form action="#">
								<div className="position-relative">
									<input type="text" className="form-control search-2 py-4 rounded-4" placeholder="search here" />
									<button className="position-absolute end-0 top-50 translate-middle-y btn btn-primary me-2" type="submit" aria-label="search now">
										search now
										<svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none">
											<g clipPath="url(#clip0_1420_1980)">
												<path d="M15.8167 7.55759C15.8165 7.5574 15.8163 7.55719 15.8161 7.557L12.5504 4.307C12.3057 4.06353 11.91 4.06444 11.6665 4.30912C11.423 4.55378 11.4239 4.9495 11.6686 5.193L13.8612 7.375H0.625C0.279813 7.375 0 7.65481 0 8C0 8.34519 0.279813 8.625 0.625 8.625H13.8612L11.6686 10.807C11.4239 11.0505 11.423 11.4462 11.6665 11.6909C11.91 11.9356 12.3058 11.9364 12.5504 11.693L15.8162 8.443C15.8163 8.44281 15.8165 8.44259 15.8167 8.4424C16.0615 8.19809 16.0607 7.80109 15.8167 7.55759Z" fill="white" />
											</g>
										</svg>
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
				<div className="container">
					<div className=" row ">
						{/* prettier-ignore */}
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={0}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>The Shining: psychological impact in design</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={200}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-1.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>The X-Files: uncovering the unknown in design theory</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={400}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-2.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Narcos: the influence of culture on design narratives</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={0}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-3.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Harry Potter: navigating the world of design concepts</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={200}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-4.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>The Lion King: exploring the circle of life in design</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={400}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-5.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>The Mandalorian: merging tradition and futuristic design</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={0}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-6.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Breaking Bad: the evolution of ideas in creative design</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={200}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-7.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Coco: exploring the colorful layers of design and culture</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={400}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-8.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Titanic: navigating the highs and lows of design history</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={0}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-9.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Inception: exploring the essence and nature of design</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={200}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-10.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Casablanca: timeless elegance in the world of design</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={400}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-11.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Black Panther: exploring the cultural influence on design</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={0}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-12.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Lord of the Rings: the interplay of form and function in design</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={200}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-13.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Star Trek: boldly going into the future of design</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={400}>
							<div className="mb-8">
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">tax, finance</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-blog/bg-14.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Mulan: blending tradition with modern design</h6>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

		</>
	)
}
