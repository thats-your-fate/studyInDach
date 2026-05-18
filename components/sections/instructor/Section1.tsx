
export default function Section1() {
	return (
		<>

			<section className="elearning-intructor-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="banner-line">
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop-reverse" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop d-none d-lg-block" />
					<div className="vertical-effect border-opacity-10 border-end border-white d-none d-lg-block" />
				</div>
				<div className="position-absolute bottom-0 start-0 z-2">
					<img className="w-100" src="/assets/imgs/pages/learning/page-about/pattern.png" alt="AstraX" />
				</div>
				<div className="container position-relative pt-8 text-lg-start text-center">
					<div className="row align-items-center">
						<div className="col-12 text-center">
							<span className="content-top btn-text fw-bold text-white">
								<i className="ri-git-repository-line text-green-3" />
								&nbsp; #01 learning platform
							</span>
							<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">
								Our
								<span className="position-relative">
									instructors
									<span className="position-absolute top-0 start-0 pt-5 z-0 d-none d-md-block">
										<svg xmlns="http://www.w3.org/2000/svg" width={411} height={22} viewBox="0 0 411 22" fill="none">
											<path d="M2 20C107.909 12.6711 337.581 -1.06621 409 2.61526" stroke="#D5D52B" strokeWidth={3} strokeLinecap="round" />
										</svg>
									</span>
								</span>
							</h1>
						</div>
					</div>
				</div>
			</section>


		</>
	)
}
