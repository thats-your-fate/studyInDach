import Link from 'next/link'

export default function Section2() {
	return (
		<>

			<section className="elearning-intructor-details-section-2 position-relative pb-120 rounded-bottom-4 bg-secondary-2 z-30">
				<div className="container position-relative ">
					<div className="row pb-100 pt-lg-0 pt-10">
						<div className="col-lg-4 position-relative z-0" data-aos="fade-up">
							<img className="position-lg-absolute bottom-0 start-0 rounded-5" src="/assets\imgs\pages\learning\page-instructor-details\img-1.png" alt="AstraX" />
						</div>
						<div className="col-lg-8 ps-7">
							<h5 className="mt-7 text-anime-style-2">Biography</h5>
							<p className="mb-0">For instance, a simple webpage might use HTML to create a text box and CSS to make it visually appealing. Hands-on practice with code editors like VS Code helps solidify these skills. Free platforms like Codecademy or W3Schools provide excellent tutorials for beginners.</p>
						</div>
					</div>
					<div className="row g-lg-5 g-md-4 g-3">
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={100}>
							<div className="card-news position-relative hover-up">
								<Link href="/single-courses" className="card-news-img position-relative d-block">
									<img className="w-100 rounded-top-3" src="/assets/imgs/pages/learning/page-home/home-section-3/img-1.png" alt="AstraX" />
									<span className="text-uppercase text-dark bg-green-3 rounded-2 px-2 py-1 position-absolute top-100 end-0 translate-middle-y me-5 fs-8 fw-bold">price: $39</span>
								</Link>
								<div className="card-news-body p-5 pb-4 bg-white rounded-bottom-3">
									<div className="d-flex gap-2">
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
									</div>
									<div className="card-news-title mt-3">
										<h6 className="fs-6">
											<Link href="/single-courses"> The IBM Data Science Professional Certificate </Link>
										</h6>
									</div>
									<div className="d-flex card-news-information mt-4 gap-4 border-bottom pb-3">
										<div className="d-flex align-items-center gap-1">
											<i className="ri-book-marked-fill text-primary" />
											<p className="fs-7 mb-0">30 Lessons</p>
										</div>
										<div className="d-flex align-items-center gap-1">
											<i className="ri-group-fill text-primary" />
											<p className="fs-7 mb-0">110+ Students</p>
										</div>
									</div>
									<div className="d-flex align-items-center mt-4">
										<div className="d-flex align-items-center gap-2">
											<img className="icon-shape icon-40 rounded-circle" src="/assets/imgs/pages/learning/page-home/home-section-3/author-1.png" alt="AstraX" />
											<p className="fs-7 mb-0 text-uppercase fw-medium">
												<Link href="/#" className="text-primary">ronald d.</Link>
											</p>
										</div>
										<div className="d-flex align-items-center gap-1 ms-auto">
											<p className="fs-7 mb-0 text-uppercase fw-bold">
												<Link href="/#" className="text-primary">technology</Link>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={200}>
							<div className="card-news position-relative hover-up">
								<Link href="/single-courses" className="card-news-img position-relative d-block">
									<img className="w-100 rounded-top-3" src="/assets/imgs/pages/learning/page-home/home-section-3/img-2.png" alt="AstraX" />
									<span className="text-uppercase text-dark bg-green-3 rounded-2 px-2 py-1 position-absolute top-100 end-0 translate-middle-y me-5 fs-8 fw-bold">price: $39</span>
								</Link>
								<div className="card-news-body p-5 pb-4 bg-white rounded-bottom-3">
									<div className="d-flex gap-2">
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
									</div>
									<div className="card-news-title mt-3">
										<h6 className="fs-6">
											<Link href="/single-courses"> The Coursera Full-Stack Development Specialization </Link>
										</h6>
									</div>
									<div className="d-flex card-news-information mt-4 gap-4 border-bottom pb-3">
										<div className="d-flex align-items-center gap-1">
											<i className="ri-book-marked-fill text-primary" />
											<p className="fs-7 mb-0">30 Lessons</p>
										</div>
										<div className="d-flex align-items-center gap-1">
											<i className="ri-group-fill text-primary" />
											<p className="fs-7 mb-0">110+ Students</p>
										</div>
									</div>
									<div className="d-flex align-items-center mt-4">
										<div className="d-flex align-items-center gap-2">
											<img className="icon-shape icon-40 rounded-circle" src="/assets/imgs/pages/learning/page-home/home-section-3/author-2.png" alt="AstraX" />
											<p className="fs-7 mb-0 text-uppercase fw-medium">
												<Link href="/#" className="text-primary">ronald d.</Link>
											</p>
										</div>
										<div className="d-flex align-items-center gap-1 ms-auto">
											<p className="fs-7 mb-0 text-uppercase fw-bold">
												<Link href="/#" className="text-primary">technology</Link>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={300}>
							<div className="card-news position-relative hover-up">
								<Link href="/single-courses" className="card-news-img position-relative d-block">
									<img className="w-100 rounded-top-3" src="/assets/imgs/pages/learning/page-home/home-section-3/img-3.png" alt="AstraX" />
									<span className="text-uppercase text-dark bg-green-3 rounded-2 px-2 py-1 position-absolute top-100 end-0 translate-middle-y me-5 fs-8 fw-bold">price: $39</span>
								</Link>
								<div className="card-news-body p-5 pb-4 bg-white rounded-bottom-3">
									<div className="d-flex gap-2">
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
									</div>
									<div className="card-news-title mt-3">
										<h6 className="fs-6">
											<Link href="/single-courses"> The Adobe Creative Cloud Mastery Certification </Link>
										</h6>
									</div>
									<div className="d-flex card-news-information mt-4 gap-4 border-bottom pb-3">
										<div className="d-flex align-items-center gap-1">
											<i className="ri-book-marked-fill text-primary" />
											<p className="fs-7 mb-0">30 Lessons</p>
										</div>
										<div className="d-flex align-items-center gap-1">
											<i className="ri-group-fill text-primary" />
											<p className="fs-7 mb-0">110+ Students</p>
										</div>
									</div>
									<div className="d-flex align-items-center mt-4">
										<div className="d-flex align-items-center gap-2">
											<img className="icon-shape icon-40 rounded-circle" src="/assets/imgs/pages/learning/page-home/home-section-3/author-3.png" alt="AstraX" />
											<p className="fs-7 mb-0 text-uppercase fw-medium">
												<Link href="/#" className="text-primary">ronald d.</Link>
											</p>
										</div>
										<div className="d-flex align-items-center gap-1 ms-auto">
											<p className="fs-7 mb-0 text-uppercase fw-bold">
												<Link href="/#" className="text-primary">technology</Link>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={400}>
							<div className="card-news position-relative hover-up">
								<Link href="/single-courses" className="card-news-img position-relative d-block">
									<img className="w-100 rounded-top-3" src="/assets/imgs/pages/learning/page-home/home-section-3/img-4.png" alt="AstraX" />
									<span className="text-uppercase text-dark bg-green-3 rounded-2 px-2 py-1 position-absolute top-100 end-0 translate-middle-y me-5 fs-8 fw-bold">price: $39</span>
								</Link>
								<div className="card-news-body p-5 pb-4 bg-white rounded-bottom-3">
									<div className="d-flex gap-2">
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
									</div>
									<div className="card-news-title mt-3">
										<h6 className="fs-6">
											<Link href="/single-courses"> The Google Data Analytics Professional Certificate </Link>
										</h6>
									</div>
									<div className="d-flex card-news-information mt-4 gap-4 border-bottom pb-3">
										<div className="d-flex align-items-center gap-1">
											<i className="ri-book-marked-fill text-primary" />
											<p className="fs-7 mb-0">30 Lessons</p>
										</div>
										<div className="d-flex align-items-center gap-1">
											<i className="ri-group-fill text-primary" />
											<p className="fs-7 mb-0">110+ Students</p>
										</div>
									</div>
									<div className="d-flex align-items-center mt-4">
										<div className="d-flex align-items-center gap-2">
											<img className="icon-shape icon-40 rounded-circle" src="/assets/imgs/pages/learning/page-home/home-section-3/author-4.png" alt="AstraX" />
											<p className="fs-7 mb-0 text-uppercase fw-medium">
												<Link href="/#" className="text-primary">ronald d.</Link>
											</p>
										</div>
										<div className="d-flex align-items-center gap-1 ms-auto">
											<p className="fs-7 mb-0 text-uppercase fw-bold">
												<Link href="/#" className="text-primary">technology</Link>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={500}>
							<div className="card-news position-relative hover-up">
								<Link href="/single-courses" className="card-news-img position-relative d-block">
									<img className="w-100 rounded-top-3" src="/assets/imgs/pages/learning/page-home/home-section-3/img-5.png" alt="AstraX" />
									<span className="text-uppercase text-dark bg-green-3 rounded-2 px-2 py-1 position-absolute top-100 end-0 translate-middle-y me-5 fs-8 fw-bold">price: $39</span>
								</Link>
								<div className="card-news-body p-5 pb-4 bg-white rounded-bottom-3">
									<div className="d-flex gap-2">
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
									</div>
									<div className="card-news-title mt-3">
										<h6 className="fs-6">
											<Link href="/single-courses"> The SANS Cybersecurity Leadership Professional Certificate </Link>
										</h6>
									</div>
									<div className="d-flex card-news-information mt-4 gap-4 border-bottom pb-3">
										<div className="d-flex align-items-center gap-1">
											<i className="ri-book-marked-fill text-primary" />
											<p className="fs-7 mb-0">30 Lessons</p>
										</div>
										<div className="d-flex align-items-center gap-1">
											<i className="ri-group-fill text-primary" />
											<p className="fs-7 mb-0">110+ Students</p>
										</div>
									</div>
									<div className="d-flex align-items-center mt-4">
										<div className="d-flex align-items-center gap-2">
											<img className="icon-shape icon-40 rounded-circle" src="/assets/imgs/pages/learning/page-home/home-section-3/author-5.png" alt="AstraX" />
											<p className="fs-7 mb-0 text-uppercase fw-medium">
												<Link href="/#" className="text-primary">ronald d.</Link>
											</p>
										</div>
										<div className="d-flex align-items-center gap-1 ms-auto">
											<p className="fs-7 mb-0 text-uppercase fw-bold">
												<Link href="/#" className="text-primary">technology</Link>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={600}>
							<div className="card-news position-relative hover-up">
								<Link href="/single-courses" className="card-news-img position-relative d-block">
									<img className="w-100 rounded-top-3" src="/assets/imgs/pages/learning/page-home/home-section-3/img-6.png" alt="AstraX" />
									<span className="text-uppercase text-dark bg-green-3 rounded-2 px-2 py-1 position-absolute top-100 end-0 translate-middle-y me-5 fs-8 fw-bold">price: $39</span>
								</Link>
								<div className="card-news-body p-5 pb-4 bg-white rounded-bottom-3">
									<div className="d-flex gap-2">
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
									</div>
									<div className="card-news-title mt-3">
										<h6 className="fs-6">
											<Link href="/single-courses"> The PMI Agile Certified Practitioner (PMI-ACP) Certification </Link>
										</h6>
									</div>
									<div className="d-flex card-news-information mt-4 gap-4 border-bottom pb-3">
										<div className="d-flex align-items-center gap-1">
											<i className="ri-book-marked-fill text-primary" />
											<p className="fs-7 mb-0">30 Lessons</p>
										</div>
										<div className="d-flex align-items-center gap-1">
											<i className="ri-group-fill text-primary" />
											<p className="fs-7 mb-0">110+ Students</p>
										</div>
									</div>
									<div className="d-flex align-items-center mt-4">
										<div className="d-flex align-items-center gap-2">
											<img className="icon-shape icon-40 rounded-circle" src="/assets/imgs/pages/learning/page-home/home-section-3/author-6.png" alt="AstraX" />
											<p className="fs-7 mb-0 text-uppercase fw-medium">
												<Link href="/#" className="text-primary">ronald d.</Link>
											</p>
										</div>
										<div className="d-flex align-items-center gap-1 ms-auto">
											<p className="fs-7 mb-0 text-uppercase fw-bold">
												<Link href="/#" className="text-primary">technology</Link>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={400}>
							<div className="card-news position-relative hover-up">
								<Link href="/single-courses" className="card-news-img position-relative d-block">
									<img className="w-100 rounded-top-3" src="/assets/imgs/pages/learning/page-home/home-section-3/img-11.png" alt="AstraX" />
									<span className="text-uppercase text-dark bg-green-3 rounded-2 px-2 py-1 position-absolute top-100 end-0 translate-middle-y me-5 fs-8 fw-bold">price: $39</span>
								</Link>
								<div className="card-news-body p-5 pb-4 bg-white rounded-bottom-3">
									<div className="d-flex gap-2">
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
									</div>
									<div className="card-news-title mt-3">
										<h6 className="fs-6">
											<Link href="/single-courses"> The IBM Data Science Professional Certificate </Link>
										</h6>
									</div>
									<div className="d-flex card-news-information mt-4 gap-4 border-bottom pb-3">
										<div className="d-flex align-items-center gap-1">
											<i className="ri-book-marked-fill text-primary" />
											<p className="fs-7 mb-0">30 Lessons</p>
										</div>
										<div className="d-flex align-items-center gap-1">
											<i className="ri-group-fill text-primary" />
											<p className="fs-7 mb-0">110+ Students</p>
										</div>
									</div>
									<div className="d-flex align-items-center mt-4">
										<div className="d-flex align-items-center gap-2">
											<img className="icon-shape icon-40 rounded-circle" src="/assets/imgs/pages/learning/page-home/home-section-3/author-4.png" alt="AstraX" />
											<p className="fs-7 mb-0 text-uppercase fw-medium">
												<Link href="/#" className="text-primary">ronald d.</Link>
											</p>
										</div>
										<div className="d-flex align-items-center gap-1 ms-auto">
											<p className="fs-7 mb-0 text-uppercase fw-bold">
												<Link href="/#" className="text-primary">technology</Link>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={500}>
							<div className="card-news position-relative hover-up">
								<Link href="/single-courses" className="card-news-img position-relative d-block">
									<img className="w-100 rounded-top-3" src="/assets/imgs/pages/learning/page-home/home-section-3/img-9.png" alt="AstraX" />
									<span className="text-uppercase text-dark bg-green-3 rounded-2 px-2 py-1 position-absolute top-100 end-0 translate-middle-y me-5 fs-8 fw-bold">price: $39</span>
								</Link>
								<div className="card-news-body p-5 pb-4 bg-white rounded-bottom-3">
									<div className="d-flex gap-2">
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
									</div>
									<div className="card-news-title mt-3">
										<h6 className="fs-6">
											<Link href="/single-courses"> The Coursera Full-Stack Development Specialization </Link>
										</h6>
									</div>
									<div className="d-flex card-news-information mt-4 gap-4 border-bottom pb-3">
										<div className="d-flex align-items-center gap-1">
											<i className="ri-book-marked-fill text-primary" />
											<p className="fs-7 mb-0">30 Lessons</p>
										</div>
										<div className="d-flex align-items-center gap-1">
											<i className="ri-group-fill text-primary" />
											<p className="fs-7 mb-0">110+ Students</p>
										</div>
									</div>
									<div className="d-flex align-items-center mt-4">
										<div className="d-flex align-items-center gap-2">
											<img className="icon-shape icon-40 rounded-circle" src="/assets/imgs/pages/learning/page-home/home-section-3/author-5.png" alt="AstraX" />
											<p className="fs-7 mb-0 text-uppercase fw-medium">
												<Link href="/#" className="text-primary">ronald d.</Link>
											</p>
										</div>
										<div className="d-flex align-items-center gap-1 ms-auto">
											<p className="fs-7 mb-0 text-uppercase fw-bold">
												<Link href="/#" className="text-primary">technology</Link>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={600}>
							<div className="card-news position-relative hover-up">
								<Link href="/single-courses" className="card-news-img position-relative d-block">
									<img className="w-100 rounded-top-3" src="/assets/imgs/pages/learning/page-home/home-section-3/img-7.png" alt="AstraX" />
									<span className="text-uppercase text-dark bg-green-3 rounded-2 px-2 py-1 position-absolute top-100 end-0 translate-middle-y me-5 fs-8 fw-bold">price: $39</span>
								</Link>
								<div className="card-news-body p-5 pb-4 bg-white rounded-bottom-3">
									<div className="d-flex gap-2">
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
										<i className="bi bi-star-fill text-yellow fs-7" />
									</div>
									<div className="card-news-title mt-3">
										<h6 className="fs-6">
											<Link href="/single-courses"> The Adobe Creative Cloud Mastery Certification </Link>
										</h6>
									</div>
									<div className="d-flex card-news-information mt-4 gap-4 border-bottom pb-3">
										<div className="d-flex align-items-center gap-1">
											<i className="ri-book-marked-fill text-primary" />
											<p className="fs-7 mb-0">30 Lessons</p>
										</div>
										<div className="d-flex align-items-center gap-1">
											<i className="ri-group-fill text-primary" />
											<p className="fs-7 mb-0">110+ Students</p>
										</div>
									</div>
									<div className="d-flex align-items-center mt-4">
										<div className="d-flex align-items-center gap-2">
											<img className="icon-shape icon-40 rounded-circle" src="/assets/imgs/pages/learning/page-home/home-section-3/author-6.png" alt="AstraX" />
											<p className="fs-7 mb-0 text-uppercase fw-medium">
												<Link href="/#" className="text-primary">ronald d.</Link>
											</p>
										</div>
										<div className="d-flex align-items-center gap-1 ms-auto">
											<p className="fs-7 mb-0 text-uppercase fw-bold">
												<Link href="/#" className="text-primary">technology</Link>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

		</>
	)
}
