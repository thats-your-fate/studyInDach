import { contactUi, optionLabel, type PublicLocale } from "@/lib/i18n"

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
	locale?: PublicLocale
}

export default function Section2({ action, selectedProgram, sent, error, programContactMode = false, locale = "en" }: Section2Props) {
	const ui = contactUi[locale]
	const contactPath = locale === "pt-br" ? "/pt-br/contato" : "/contact"
	const sourcePath = selectedProgram ? `${contactPath}?programId=${selectedProgram.id}` : contactPath

	return (
		<section className={`elearning-contact-section-2 position-relative overflow-hidden py-120 ${programContactMode ? "program-contact-page" : ""}`}>
			<div className="container">
				<div className="row g-5">
					<div className="col-lg-7 pe-lg-8 col-12">
						<span className="content-top btn-text fw-bold text-primary fs-7">
							<i className="ri-compass-3-line text-primary opacity-50" />
							&nbsp; {ui.freeOrientation}
						</span>
						<h2 className={`mb-4 mt-3 ${programContactMode ? "" : "text-anime-style-2"}`}>{ui.title}</h2>
						<p className="pb-3">{ui.intro}</p>

						{selectedProgram && (
							<div className="selected-program-box mb-5">
								<span>{ui.selectedProgram}</span>
								<h6>{selectedProgram.name}</h6>
								<p className="mb-0">{[selectedProgram.universityName, selectedProgram.location].filter(Boolean).join(" · ")}</p>
							</div>
						)}

						{sent && (
							<div className="contact-form-alert success mb-4">
								{ui.sent}
							</div>
						)}
						{error && <div className="contact-form-alert mb-4">{errorMessage(error, locale)}</div>}

						<form action={action} className="input-group mt-4 position-relative wow img-custom-anim-left">
							<input type="hidden" name="programId" value={selectedProgram?.id || ""} />
							<input type="hidden" name="sourcePath" value={sourcePath} />
							<input type="hidden" name="locale" value={locale} />
							<input className="inquiry-honeypot" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
							<input className="inquiry-honeypot" tabIndex={-1} autoComplete="off" name="companyUrl" aria-hidden="true" />

							<div className="row">
								<div className="col-md-6">
									<label htmlFor="name" className="fs-7 fw-bold mb-3 text-primary">{ui.name}</label>
									<input type="text" className="py-3 form-control username" name="name" placeholder={ui.namePlaceholder} id="name" maxLength={120} />
								</div>
								<div className="col-md-6">
									<label htmlFor="email" className="fs-7 fw-bold mb-3 text-primary">{ui.email}</label>
									<input type="email" className="py-3 form-control email" name="email" placeholder="you@example.com" id="email" maxLength={180} required />
								</div>
								<div className="col-md-6 mt-5">
									<label htmlFor="countryOfResidence" className="fs-7 fw-bold mb-3 text-primary">{ui.countryOfResidence}</label>
									<input type="text" className="py-3 form-control" name="countryOfResidence" placeholder={ui.countryPlaceholder} id="countryOfResidence" maxLength={120} />
								</div>
								<div className="col-md-6 mt-5">
									<label htmlFor="preferredStudyCountry" className="fs-7 fw-bold mb-3 text-primary">{ui.preferredStudyCountry}</label>
									<select className="py-3 form-control" name="preferredStudyCountry" id="preferredStudyCountry">
										<option value="">{ui.notSure}</option>
										<option value="Germany">{optionLabel("Germany", locale)}</option>
										<option value="Austria">{optionLabel("Austria", locale)}</option>
										<option value="Switzerland">{optionLabel("Switzerland", locale)}</option>
										<option value="DACH region">{ui.dachRegion}</option>
									</select>
								</div>
								<div className="col-12 mt-5">
									<label htmlFor="message" className="fs-7 fw-bold mb-3 text-primary">{ui.message}</label>
									<textarea name="message" id="message" cols={30} rows={8} className="py-3 form-control website" placeholder={ui.messagePlaceholder} maxLength={3000} required />
								</div>
								<div className="col-12 mt-4">
									<label className="inquiry-consent">
										<input type="checkbox" name="consent" required />
										<span>{ui.consent}</span>
									</label>
								</div>
								<div className="col-12 mt-5">
									<button className="btn btn-primary hover-up" type="submit">
										{ui.button}
									</button>
								</div>
							</div>
						</form>
					</div>
					<div className="col-lg-5 ms-lg-auto">
						<span className="content-top btn-text fw-bold text-primary fs-7">
							<i className="ri-mail-open-line text-primary opacity-50" />
							&nbsp; {ui.contactInfo}
						</span>
						<h2 className={`mb-6 mt-3 ${programContactMode ? "" : "text-anime-style-2"}`}>Study in DACH</h2>
						<p className="pb-4">{ui.sideText}</p>
						<div className="contact-orientation-card">
							<i className="ri-mail-open-line fs-1 text-primary" />
							<a href="mailto:y3591vy@gmail.com">
								<h6 className="mt-4 mb-3 fs-20">y3591vy@gmail.com</h6>
							</a>
							<p className="mb-0">{ui.emailFallback}</p>
							<div className="contact-socials">
								<a href="#" aria-label="Facebook"><i className="ri-facebook-fill" /></a>
								<a href="#" aria-label="X"><i className="ri-twitter-x-line" /></a>
								<a href="#" aria-label="LinkedIn"><i className="ri-linkedin-fill" /></a>
							</div>
						</div>
						<p className="contact-disclaimer mt-4">{ui.disclaimer}</p>
					</div>
				</div>
			</div>
		</section>
	)
}

function errorMessage(error: string, locale: PublicLocale) {
	const errors = contactUi[locale].errors
	return errors[error as keyof typeof errors] || errors.default
}
