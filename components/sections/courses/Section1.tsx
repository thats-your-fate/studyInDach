
type Section1Props = {
	title?: string
}

export default function Section1({ title = "Find your program" }: Section1Props) {
	return (
		<>

			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="banner-line">
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop-reverse" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop d-none d-lg-block" />
					<div className="vertical-effect border-opacity-10 border-end border-white d-none d-lg-block" />
				</div>
				<div className="position-absolute bottom-0 start-0 z-2">
					<img className="w-100" src="/assets/imgs/pages/learning/page-about/pattern.png" alt="Study in DACH" />
				</div>
				<div className="container position-relative pt-8 text-lg-start text-center">
					<div className="row align-items-center">
						<div className="col-12 text-center">
							<span className="content-top btn-text fw-bold text-white">
								<i className="ri-git-repository-line text-green-3" />
								&nbsp; Study programs in DACH
							</span>
							<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">{title}</h1>
						</div>
					</div>
				</div>
			</section>

		</>
	)
}
