import Link from 'next/link'

export default function Section1() {
	return (
		<>

			<section className="elearning-home-section-1 position-relative pt-300 pb-200 bg-primary rounded-bottom-4">
				<div className="banner-line">
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white d-none d-lg-block" />
					<div className="vertical-effect border-opacity-10 border-end border-white d-none d-lg-block" />
				</div>
				<div className="position-absolute bottom-0 end-0 mb-80 me-10 z-0">
					<img className="w-100" src="/assets/imgs/pages/learning/page-home/home-section-1/pattern.png" alt="Study in DACH" />
				</div>
				<div className="container position-relative pt-lg-10 text-lg-start text-center">
					<div className="row align-items-center">
						<div className="col-lg-6 col-md-12 px-md-0 ">
							<span className="content-top btn-text fw-bold text-white">
								<i className="ri-git-repository-line text-green-3" />
								&nbsp; degree discovery platform
							</span>
							<h1 className="text-white ds-1 lh-sm mb-5 text-anime-style-3">
								Find your degree <br /> in 
								<span className="text-green-3 position-relative   ps-3">
									 DACH
									<span className="position-absolute top-0 start-0 pt-5 z-0 d-none d-md-block">
										<svg xmlns="http://www.w3.org/2000/svg" width={370} height={22} viewBox="0 0 370 22" fill="none">
											<path d="M1.5 20.0001C97 12.8334 304.1 -0.599919 368.5 3.00008" stroke="#D5D52B" strokeWidth={3} strokeLinecap="round" />
										</svg>
									</span>
								</span>
							</h1>
							<form action="#" className="d-none d-md-block">
								<div className="input-group">
									<input type="text" className="form-control border-0 search rounded-start-4" aria-label="Search degree programs" placeholder="Search AI masters in Germany taught in English" />
									<button type="submit" aria-label="Industry" className="btn btn-yellow border-0 bg-white dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
										<span className="text-dark">Country</span>
									</button>
									<ul className="dropdown-menu dropdown-menu-end">
										<li><Link className="dropdown-item text-capitalize" href="/courses">Germany</Link></li>
										<li><Link className="dropdown-item text-capitalize" href="/courses">Austria</Link></li>
										<li><Link className="dropdown-item text-capitalize" href="/courses">Switzerland</Link></li>
										<li>
											<hr className="dropdown-divider" />
										</li>
										<li><Link className="dropdown-item text-capitalize" href="/courses">English-taught</Link></li>
										<li><Link className="dropdown-item text-capitalize" href="/courses">Master programs</Link></li>
									</ul>
									<button type="submit" aria-label="Search now" className="btn btn-white bg-green-3 rounded-end-4"><span className="text-dark">search
										now</span></button>
								</div>
							</form>
						</div>
					</div>
				</div>
				<div className="banner-girl position-absolute bottom-0 start-50 z-2 d-none d-lg-block">
					<div className="position-relative z-1 overflow-hidden">
						<div className="parallax-item">
							<img src="/assets/imgs/pages/learning/page-home/home-section-1/banner-girl.png" alt="Student exploring degree programs" />
						</div>
					</div>
				</div>
			</section>

		</>
	)
}
