export default function Section2() {
	return (
		<>
			<section className="elearning-contact-section-2 position-relative overflow-hidden py-120">
				<div className="container">
					<div className="row g-5">
						<div className="col-lg-6 pe-lg-8 col-12">
							<span className="content-top btn-text fw-bold text-primary fs-7">
								<i className="ri-git-repository-line text-primary opacity-50" />
								&nbsp; feedback
							</span>
							<h2 className="mb-6 mt-3 text-anime-style-2">Help improve the dataset</h2>
							<form action="#" className="input-group mt-4 position-relative wow img-custom-anim-left">
								<div className="row">
									<div className="col-md-6">
										<label htmlFor="username" className="fs-7 fw-bold mb-3 text-primary">Full name</label>
										<input type="text" className="py-3 form-control username" name="name" placeholder="Enter here" id="username" />
									</div>
									<div className="col-md-6">
										<label htmlFor="email" className="fs-7 fw-bold mb-3 text-primary">Email address</label>
										<input type="text" className="py-3 form-control email" name="email" placeholder="Enter here" id="email" />
									</div>
									<div className="col-12 mt-5">
										<label htmlFor="message" className="fs-7 fw-bold mb-3 text-primary">Message</label>
										<textarea name="message" id="message" cols={30} rows={8} className="py-3 form-control website" placeholder="Share a correction, source URL, or feature idea" />
									</div>
									<div className="col-12 mt-5">
										<button className="btn btn-primary hover-up" type="submit" aria-label="submit">
											<span>submit</span>
										</button>
									</div>
								</div>
							</form>
						</div>
						<div className="col-lg-6 ms-lg-auto">
							<span className="content-top btn-text fw-bold text-primary fs-7">
								<i className="ri-git-repository-line text-primary opacity-50" />
								&nbsp; contact info
							</span>
							<h2 className="mb-6 mt-3 text-anime-style-2">Study in DACH</h2>
							<p className="pb-4">Questions, corrections, and manually collected university program links are welcome. The fastest way to improve coverage is to send official source URLs.</p>
							<div data-aos="fade-up" data-aos-delay={0}>
								<div className="icon">
									<i className="ri-mail-open-line fs-1 text-primary" />
								</div>
								<a href="mailto:y3591vy@gmail.com">
									<h6 className="mt-5 mb-3 fs-20">y3591vy@gmail.com</h6>
								</a>
								<p className="mb-0">No phone support is listed for this MVP.</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
