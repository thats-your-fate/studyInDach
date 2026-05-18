export type ContactProgram = {
	id: number
	name: string
	universityName: string
	location: string
}

type Section2Props = {
	action: (formData: FormData) => Promise<void>
	selectedProgram: ContactProgram | null
	sent: boolean
	error: string
	programContactMode?: boolean
}

export default function Section2({ action, selectedProgram, sent, error, programContactMode = false }: Section2Props) {
	const sourcePath = selectedProgram ? `/contact?programId=${selectedProgram.id}` : "/contact"

	return (
		<section className={`elearning-contact-section-2 position-relative overflow-hidden py-120 ${programContactMode ? "program-contact-page" : ""}`}>
			<div className="container">
				<div className="row g-5">
					<div className="col-lg-7 pe-lg-8 col-12">
						<span className="content-top btn-text fw-bold text-primary fs-7">
							<i className="ri-compass-3-line text-primary opacity-50" />
							&nbsp; free orientation
						</span>
						<h2 className={`mb-4 mt-3 ${programContactMode ? "" : "text-anime-style-2"}`}>Free Study Orientation</h2>
						<p className="pb-3">Tell us what you want to study and where you are in the process. We will help you understand the program and compare realistic options across Germany, Austria, and Switzerland.</p>

						{selectedProgram && (
							<div className="selected-program-box mb-5">
								<span>Selected program</span>
								<h6>{selectedProgram.name}</h6>
								<p className="mb-0">{[selectedProgram.universityName, selectedProgram.location].filter(Boolean).join(" · ")}</p>
							</div>
						)}

						{sent && (
							<div className="contact-form-alert success mb-4">
								Thanks. Your inquiry was received, and we will reply by email.
							</div>
						)}
						{error && <div className="contact-form-alert mb-4">{errorMessage(error)}</div>}

						<form action={action} className="input-group mt-4 position-relative wow img-custom-anim-left">
							<input type="hidden" name="programId" value={selectedProgram?.id || ""} />
							<input type="hidden" name="sourcePath" value={sourcePath} />
							<input type="hidden" name="locale" value="en" />
							<input className="inquiry-honeypot" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
							<input className="inquiry-honeypot" tabIndex={-1} autoComplete="off" name="companyUrl" aria-hidden="true" />

							<div className="row">
								<div className="col-md-6">
									<label htmlFor="name" className="fs-7 fw-bold mb-3 text-primary">Name</label>
									<input type="text" className="py-3 form-control username" name="name" placeholder="Your name" id="name" maxLength={120} />
								</div>
								<div className="col-md-6">
									<label htmlFor="email" className="fs-7 fw-bold mb-3 text-primary">Email address</label>
									<input type="email" className="py-3 form-control email" name="email" placeholder="you@example.com" id="email" maxLength={180} required />
								</div>
								<div className="col-md-6 mt-5">
									<label htmlFor="countryOfResidence" className="fs-7 fw-bold mb-3 text-primary">Country of residence</label>
									<input type="text" className="py-3 form-control" name="countryOfResidence" placeholder="Where do you live now?" id="countryOfResidence" maxLength={120} />
								</div>
								<div className="col-md-6 mt-5">
									<label htmlFor="preferredStudyCountry" className="fs-7 fw-bold mb-3 text-primary">Preferred study country</label>
									<select className="py-3 form-control" name="preferredStudyCountry" id="preferredStudyCountry">
										<option value="">Not sure yet</option>
										<option value="Germany">Germany</option>
										<option value="Austria">Austria</option>
										<option value="Switzerland">Switzerland</option>
										<option value="DACH region">Germany, Austria, or Switzerland</option>
									</select>
								</div>
								<div className="col-12 mt-5">
									<label htmlFor="message" className="fs-7 fw-bold mb-3 text-primary">Message</label>
									<textarea name="message" id="message" cols={30} rows={8} className="py-3 form-control website" placeholder="Tell us about your background, target degree, language preference, budget, and questions." maxLength={3000} required />
								</div>
								<div className="col-12 mt-4">
									<label className="inquiry-consent">
										<input type="checkbox" name="consent" required />
										<span>I agree to be contacted by Study in DACH regarding my inquiry.</span>
									</label>
								</div>
								<div className="col-12 mt-5">
									<button className="btn btn-primary hover-up" type="submit">
										Get free orientation
									</button>
								</div>
							</div>
						</form>
					</div>
					<div className="col-lg-5 ms-lg-auto">
						<span className="content-top btn-text fw-bold text-primary fs-7">
							<i className="ri-mail-open-line text-primary opacity-50" />
							&nbsp; contact info
						</span>
						<h2 className={`mb-6 mt-3 ${programContactMode ? "" : "text-anime-style-2"}`}>Study in DACH</h2>
						<p className="pb-4">Use the form for program questions, shortlisting, or help understanding public admission information. You can also email us directly.</p>
						<div className="contact-orientation-card">
							<i className="ri-mail-open-line fs-1 text-primary" />
							<a href="mailto:y3591vy@gmail.com">
								<h6 className="mt-4 mb-3 fs-20">y3591vy@gmail.com</h6>
							</a>
							<p className="mb-0">You can also contact us directly by email.</p>
							<div className="contact-socials">
								<a href="#" aria-label="Facebook"><i className="ri-facebook-fill" /></a>
								<a href="#" aria-label="X"><i className="ri-twitter-x-line" /></a>
								<a href="#" aria-label="LinkedIn"><i className="ri-linkedin-fill" /></a>
							</div>
						</div>
						<p className="contact-disclaimer mt-4">Study in DACH is not the official university. We provide orientation based on public program information. Always verify deadlines, fees, and admission requirements on the official university website.</p>
					</div>
				</div>
			</div>
		</section>
	)
}

function errorMessage(error: string) {
	if (error === "email") {
		return "Please enter a valid email address."
	}
	if (error === "message") {
		return "Please add a short message so we know how to help."
	}
	if (error === "consent") {
		return "Please confirm that Study in DACH may contact you about this inquiry."
	}
	return "Something went wrong. Please check the form and try again."
}
