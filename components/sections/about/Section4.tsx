'use client'
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

const swiperOptions = {
        modules: [Autoplay, Pagination, Navigation],
        slidesPerView: 3,
        spaceBetween: 30,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        loop: true,

        // Navigation
        navigation: {
            nextEl: '.h1n',
            prevEl: '.h1p',
        },

        // Pagination
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

				breakpoints:{
            320: {
                slidesPerView: 1,
                spaceBetween: 30,
            },
            575: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            767: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            991: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            1199: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1350: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        }
    };
	import Link from 'next/link'

export default function Section4() {
	return (
		<>

			<section className="elearning-about-section-4 position-relative overflow-hidden">
				<div className="container position-relative z-1 border-bottom border-primary py-120">
					<div className="text-center">
						<span className="btn-text text-primary fw-bold text-primary">
							<i className="ri-book-marked-fill opacity-25" />
							&nbsp; testimonials
						</span>
						<h2 className="text-anime-style-2">Happy users feedback</h2>
					</div>
					<div className="row mt-80 wow img-custom-anim-top">
						{/* Swiper */}
						<Swiper {...swiperOptions} className="swiper slider-3">
							<div className="swiper-wrapper z-1">
								<SwiperSlide>
									<div className="card-testimonial rounded-4 p-5 mb-lg-0 mb-5">
										<div className="founder d-flex justify-content-between border-bottom pb-5">
											<div className="d-flex align-items-center">
												<Link href="/#">
													<img className="rounded-circle icon-shape icon-50" src="/assets/imgs/pages/learning/page-about/avatar-1.png" alt="AstraX" />
												</Link>
												<div className="text-start ms-3">
													<Link href="/#">
														<span className="btn-text text-primary">Kristin Watson</span>
													</Link>
													<p className="mb-0 fs-7">Head Of Idea, Treve LLC</p>
												</div>
											</div>
											<div className="quote icon-shape icon-50 bg-white rounded-circle">
												<svg className="fill-primary" xmlns="http://www.w3.org/2000/svg" width={22} height={16} viewBox="0 0 22 16" fill="none">
													<g clipPath="url(#clip0_349_1387)">
														<path d="M0.0605469 -0.0449219V15.9551L8.31055 7.95508V-0.0449219H0.0605469Z" fill="#0D6EFD" />
														<path d="M13.8105 -0.0449219V15.9551L22.0605 7.95508V-0.0449219H13.8105Z" fill="#0D6EFD" />
													</g>
												</svg>
											</div>
										</div>
										<h6 className="mb-0 mt-5">" Unmatched excellence superior to all others. Highly recommended for both beginners and advanced users. "</h6>
									</div>
								</SwiperSlide>
								<SwiperSlide>
									<div className="card-testimonial rounded-4 p-5 mb-lg-0 mb-5">
										<div className="founder d-flex justify-content-between border-bottom pb-5">
											<div className="d-flex align-items-center">
												<Link href="/#">
													<img className="rounded-circle icon-shape icon-50" src="/assets/imgs/pages/learning/page-about/avatar-2.png" alt="AstraX" />
												</Link>
												<div className="text-start ms-3">
													<Link href="/#">
														<span className="btn-text text-primary">Guy Hawkins</span>
													</Link>
													<p className="mb-0 fs-7">Head Of Idea, Treve LLC</p>
												</div>
											</div>
											<div className="quote icon-shape icon-50 bg-white rounded-circle">
												<svg className="fill-primary" xmlns="http://www.w3.org/2000/svg" width={22} height={16} viewBox="0 0 22 16" fill="none">
													<g clipPath="url(#clip0_349_1387)">
														<path d="M0.0605469 -0.0449219V15.9551L8.31055 7.95508V-0.0449219H0.0605469Z" fill="#0D6EFD" />
														<path d="M13.8105 -0.0449219V15.9551L22.0605 7.95508V-0.0449219H13.8105Z" fill="#0D6EFD" />
													</g>
												</svg>
											</div>
										</div>
										<h6 className="mb-0 mt-5">" Unrivaled brilliance surpassing all others. Highly recommended for novices and experts alike. We will hire them for sure. "</h6>
									</div>
								</SwiperSlide>
								<SwiperSlide>
									<div className="card-testimonial rounded-4 p-5 mb-lg-0 mb-5">
										<div className="founder d-flex justify-content-between border-bottom pb-5">
											<div className="d-flex align-items-center">
												<Link href="/#">
													<img className="rounded-circle icon-shape icon-50" src="/assets/imgs/pages/learning/page-about/avatar-3.png" alt="AstraX" />
												</Link>
												<div className="text-start ms-3">
													<Link href="/#">
														<span className="btn-text text-primary">Jane Cooper</span>
													</Link>
													<p className="mb-0 fs-7">Head Of Idea, Treve LLC</p>
												</div>
											</div>
											<div className="quote icon-shape icon-50 bg-white rounded-circle">
												<svg className="fill-primary" xmlns="http://www.w3.org/2000/svg" width={22} height={16} viewBox="0 0 22 16" fill="none">
													<g clipPath="url(#clip0_349_1387)">
														<path d="M0.0605469 -0.0449219V15.9551L8.31055 7.95508V-0.0449219H0.0605469Z" fill="#0D6EFD" />
														<path d="M13.8105 -0.0449219V15.9551L22.0605 7.95508V-0.0449219H13.8105Z" fill="#0D6EFD" />
													</g>
												</svg>
											</div>
										</div>
										<h6 className="mb-0 mt-5">" Unmatched brilliance exceeding all others. Highly endorsed for beginners and advanced users alike. "</h6>
									</div>
								</SwiperSlide>
								<SwiperSlide>
									<div className="card-testimonial rounded-4 p-5 mb-lg-0 mb-5">
										<div className="founder d-flex justify-content-between border-bottom pb-5">
											<div className="d-flex align-items-center">
												<Link href="/#">
													<img className="rounded-circle icon-shape icon-50" src="/assets/imgs/pages/learning/page-about/avatar-2.png" alt="AstraX" />
												</Link>
												<div className="text-start ms-3">
													<Link href="/#">
														<span className="btn-text text-primary">Guy Hawkins</span>
													</Link>
													<p className="mb-0 fs-7">Head Of Idea, Treve LLC</p>
												</div>
											</div>
											<div className="quote icon-shape icon-50 bg-white rounded-circle">
												<svg className="fill-primary" xmlns="http://www.w3.org/2000/svg" width={22} height={16} viewBox="0 0 22 16" fill="none">
													<g clipPath="url(#clip0_349_1387)">
														<path d="M0.0605469 -0.0449219V15.9551L8.31055 7.95508V-0.0449219H0.0605469Z" fill="#0D6EFD" />
														<path d="M13.8105 -0.0449219V15.9551L22.0605 7.95508V-0.0449219H13.8105Z" fill="#0D6EFD" />
													</g>
												</svg>
											</div>
										</div>
										<h6 className="mb-0 mt-5">" Unrivaled brilliance surpassing all others. Highly recommended for novices and experts alike. We will hire them for sure. "</h6>
									</div>
								</SwiperSlide>
							</div>
						</Swiper>
						{/* Swiper JS */}
					</div>
				</div>
			</section>

		</>
	)
}
