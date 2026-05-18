'use client'
import Isotope from "isotope-layout"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

// Define interfaces
interface Instructor {
	id: number
	name: string
	categories: string[]
	img: string
}

interface Filter {
	key: string
	label: string
	delay: number
	ariaLabel: string
}

export default function Section3() {
	const isotope = useRef<Isotope | null>(null)
	const [filterKey, setFilterKey] = useState<string>("*")

	// Instructor data
	const instructors: Instructor[] = [
		{ id: 1, name: "Natalia T. Morgan", categories: ["technology", "ui"], img: "img-1.png" },
		{ id: 2, name: "Sophia J. Carter", categories: ["business", "web"], img: "img-2.png" },
		{ id: 3, name: "Juliana P. Taylor", categories: ["web", "esports"], img: "img-3.png" },
		{ id: 4, name: "Olivia R. Bennett", categories: ["esports"], img: "img-4.png" },
		{ id: 5, name: "Victoria L. Davis", categories: ["technology", "ui", "esports"], img: "img-5.png" },
		{ id: 6, name: "Amelia K. Hamilton", categories: ["business", "web", "esports"], img: "img-6.png" },
		{ id: 7, name: "Natalia T. Morgan", categories: ["technology", "esports"], img: "img-7.png" },
		{ id: 8, name: "Gabriella S. Adams", categories: ["ui"], img: "img-8.png" },
		{ id: 9, name: "Isabella F. Monroe", categories: ["business", "web", "esports"], img: "img-9.png" },
		{ id: 10, name: "Eliana M. Thompson", categories: ["technology", "esports"], img: "img-10.png" },
		{ id: 11, name: "Penelope N. Harris", categories: ["technology", "ui"], img: "img-11.png" },
		{ id: 12, name: "Gabriella S. Adams", categories: ["business", "ui", "esports"], img: "img-12.png" },
	]

	// Filter buttons data
	const filters: Filter[] = [
		{ key: "*", label: "All", delay: 0, ariaLabel: "All" },
		{ key: "technology", label: "Technology", delay: 200, ariaLabel: "Technology" },
		{ key: "business", label: "Business", delay: 200, ariaLabel: "Business" },
		{ key: "ui", label: "UI/UX", delay: 400, ariaLabel: "UI" },
		{ key: "web", label: "Web Development", delay: 600, ariaLabel: "Web" },
		{ key: "esports", label: "Esports", delay: 800, ariaLabel: "Esports" },
	]

	// Initialize Isotope
	useEffect(() => {
		const timer = setTimeout(() => {
			isotope.current = new Isotope(".masonary-active", {
				itemSelector: ".filter-item",
				percentPosition: true,
				masonry: {
					columnWidth: ".grid-sizer",
				},
				// animationOptions: {
				// 	duration: 750,
				// 	easing: "linear",
				// 	queue: false,
				// },
			})
		}, 1000)

		return () => {
			clearTimeout(timer)
			if (isotope.current) {
				isotope.current.destroy()
			}
		}
	}, [])

	// Apply filter when filterKey changes
	useEffect(() => {
		if (isotope.current) {
			filterKey === "*"
				? isotope.current.arrange({ filter: "*" })
				: isotope.current.arrange({ filter: `.${filterKey}` })
		}
	}, [filterKey])

	// Handle filter button clicks
	const handleFilterKeyChange = useCallback((key: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		setFilterKey(key)
	}, [])

	return (
		<>
			<div className="eLearning-button-filter text-center pt-120 pb-6">
				<div className="button-group filter-button-group filter-menu-active">
					{filters.map((filter) => (
						<button
							key={filter.key}
							data-aos="fade-left"
							data-aos-delay={filter.delay}
							aria-label={filter.ariaLabel}
							className={`btn btn-md btn-filter mb-2 me-2  aos-init aos-animate ${filterKey === filter.key ? "active" : ""}`}
							onClick={handleFilterKeyChange(filter.key)}
						>
							{filter.label}
						</button>
					))}
				</div>
			</div>
			<section className="conference-speaker-section-1 team-filter position-relative pb-120 overflow-hidden">
				<div className="container" data-aos="fade-up">
					<div className="row g-5 masonary-active justify-content-between">
						<div className="grid-sizer" />
						{instructors.map((instructor) => (
							<div
								key={instructor.id}
								className={`col-lg-4 col-md-6 filter-item ${instructor.categories.join(" ")}`}
							>
								<div className="card-team-conference">
									<div className="position-relative d-inline-flex rounded-5 overflow-hidden">
										<img
											src={`/assets/imgs/pages/learning/page-instructor/${instructor.img}`}
											alt="AstraX"
										/>
										<div className="team-overlay">
											<ul className="list-unstyled d-flex mb-0 gap-2 justify-content-center position-absolute top-50 start-50 translate-middle">
												<li>
													<Link href="#">
														<span className="icon d-inline-flex text-center align-items-center justify-content-center">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
																<path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
															</svg>
														</span>
													</Link>
												</li>
												<li>
													<Link href="#">
														<span className="icon d-inline-flex text-center align-items-center justify-content-center">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
																<path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
															</svg>
														</span>
													</Link>
												</li>
												<li>
													<Link href="#">
														<span className="icon d-inline-flex text-center align-items-center justify-content-center">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
																<path d="M232 237.2c31.8-15.2 48.4-38.2 48.4-74 0-70.6-52.6-87.8-113.3-87.8H0v354.4h171.8c64.4 0 124.9-30.9 124.9-102.9 0-44.5-21.1-77.4-64.7-89.7zM77.9 135.9H151c28.1 0 53.4 7.9 53.4 40.5 0 30.1-19.7 42.2-47.5 42.2h-79v-82.7zm83.3 233.7H77.9V272h84.9c34.3 0 56 14.3 56 50.6 0 35.8-25.9 47-57.6 47zm358.5-240.7H376V94h143.7v34.9zM576 305.2c0-75.9-44.4-139.2-124.9-139.2-78.2 0-131.3 58.8-131.3 135.8 0 79.9 50.3 134.7 131.3 134.7 61.3 0 101-27.6 120.1-86.3H509c-6.7 21.9-34.3 33.5-55.7 33.5-41.3 0-63-24.2-63-65.3h185.1c.3-4.2 .6-8.7 .6-13.2zM390.4 274c2.3-33.7 24.7-54.8 58.5-54.8 35.4 0 53.2 20.8 56.2 54.8H390.4z" />
															</svg>
														</span>
													</Link>
												</li>
												<li>
													<Link href="#">
														<span className="icon d-inline-flex text-center align-items-center justify-content-center">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
																<path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
															</svg>
														</span>
													</Link>
												</li>
											</ul>
										</div>
									</div>
									<p className="btn-text text-primary mt-5">instructor</p>
									<Link href="/instructor-details">
										<h5>{instructor.name}</h5>
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	)
}