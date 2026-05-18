import Link from 'next/link'

export default function Section9() {
	return (
		<>

			<section className="elearning-home-section-8 pt-120 pb-120 position-relative overflow-hidden rounded-bottom-4 bg-white z-20">
				<div className="container">
					<div className="row">
						<div className="text-center mb-80">
							<span className="btn-text fw-bold fw-bold text-primary">
								<i className="ri-book-marked-fill opacity-25" />
								&nbsp; insihgts
							</span>
							<h2 className="text-anime-style-2">
								Company
								<span className="position-relative">
									insights
									<span className="position-absolute top-0 start-0 pt-5 z-0 d-none d-md-block">
										<svg className="stroke-green-3" xmlns="http://www.w3.org/2000/svg" width={180} height={22} viewBox="0 0 180 22" fill="none">
											<path d="M2 20C47.7984 12.6711 147.116 -1.06621 178 2.61526" stroke="#D5D52B" strokeWidth={3} strokeLinecap="round" />
										</svg>
									</span>
								</span>
							</h2>
						</div>
					</div>
					<div className="row g-5">
						<div className="col-lg-4 col-md-6">
							<div data-aos="fade-up" data-aos-delay={0}>
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">education</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-home/home-section-8/img-1.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>The premier choice for business marketing highly.</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6">
							<div data-aos="fade-up" data-aos-delay={200}>
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">learning</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-home/home-section-8/img-2.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>We help you find the perfect tutor. It's completely free.</h6>
								</Link>
							</div>
						</div>
						<div className="col-lg-4 col-md-6">
							<div data-aos="fade-up" data-aos-delay={400}>
								<div className="d-flex justify-content-between">
									<span className="btn-text fw-bold text-secondary-2">by <Link href="/#" className="text-primary">alonso</Link></span>
									<span className="btn-text fw-bold text-primary">lms</span>
								</div>
								<div className="rounded-4 overflow-hidden my-5 d-inline-flex position-relative">
									<Link href="/blog-details" className="zoom-img">
										<img src="/assets/imgs/pages/learning/page-home/home-section-8/img-3.png" alt="AstraX" />
									</Link>
									<div className="position-absolute top-0 end-0 m-4">
										<div className="icon-shape icon-80 rounded-4 bg-green-3 text-center d-flex flex-column justify-content-center">
											<h5 className="text-primary mb-0">10</h5>
											<p className="text-primary fs-7 mb-0">Nov</p>
										</div>
									</div>
								</div>
								<Link href="/blog-details">
									<h6>Grow sales and stay ahead in the competitive market...</h6>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

		</>
	)
}
