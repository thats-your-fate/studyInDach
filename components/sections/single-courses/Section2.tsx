import { optionLabel, programUi, t, type PublicLocale } from "@/lib/i18n"
import type { ProgramCard, ProgramDetail } from "@/lib/study-programs"
import Link from "next/link"

type Section2Props = {
	program: ProgramDetail | null
	locale?: PublicLocale
}

type Fact = {
	icon: string
	label: string
	value: string
}

export default function Section2({ program, locale = "en" }: Section2Props) {
	const ui = programUi[locale]
	if (!program) {
		return (
			<section className="program-detail-page">
				<div className="container">
					<div className="program-empty-state">
						<h4>{ui.notFoundTitle}</h4>
						<p>{ui.notFoundText}</p>
						<Link href={locale === "pt-br" ? "/pt-br/cursos" : "/courses"} className="btn btn-primary">{ui.backToPrograms}</Link>
					</div>
				</div>
			</section>
		)
	}

	const applyUrl = program.applicationUrl || program.programUrl
	const orientationUrl = locale === "pt-br" ? `/pt-br/contato?programId=${program.id}` : `/contact?programId=${program.id}`
	const heroImage = extractImageUrl(program.heroImageUrl) || program.fallbackImageUrl
	const quickFacts: Fact[] = [
		{ icon: "ri-graduation-cap-line", label: ui.facts.degree, value: localizedValue(program.academicDegree || program.degreeLevel, locale) },
		{ icon: "ri-time-line", label: ui.facts.duration, value: localizedValue(program.duration, locale) },
		{ icon: "ri-translate-2", label: ui.facts.language, value: localizedValue(compactLanguages(program.languageOfInstruction), locale) },
		{ icon: "ri-map-pin-line", label: ui.facts.location, value: localizedLocation([program.location, program.country], locale) },
		{ icon: "ri-bank-line", label: ui.facts.tuition, value: localizedValue(program.tuitionType || program.tuitionOrFees, locale) },
		{ icon: "ri-calendar-line", label: ui.facts.start, value: localizedValue(compactStart(program.startTerms), locale) },
		{ icon: "ri-shield-check-line", label: ui.facts.admission, value: localizedValue(program.applicationDifficulty || normalizeAdmission(program.restrictedAdmission), locale) },
		{ icon: "ri-layout-line", label: ui.facts.mode, value: localizedList([program.onlineOrOnCampus, program.fullTimeOrPartTime], locale, " / ") },
	].filter((fact) => fact.value)
	const heroChips = [
		localizedValue(compactLanguages(program.languageOfInstruction), locale),
		localizedValue(program.duration, locale),
		localizedValue(program.tuitionType, locale),
		localizedValue(program.state || program.country, locale),
	].filter(Boolean)
	const heroMeta = heroChips.join(" · ")
	const highlights = buildHighlights(program, locale)
	const admissionItems = buildAdmissionItems(program, locale)
	const costItems = buildCostItems(program, locale)
	const sectionNav = [
		[ui.overview, "overview"],
		[ui.admissions, "admissions"],
		[ui.tuition, "tuition"],
		[ui.careers, "careers"],
		[ui.university, "university"],
	]
	const showOriginalTitle = program.originalTitle && program.originalTitle !== program.title

	return (
		<section className="program-detail-page">
			<div className="container">
				<div className="program-hero">
					<div className="program-hero-main">
							<div className="program-university-mark">
								<div className="program-logo">{initials(program.universityName)}</div>
								<div>
									<p>{program.universityName}</p>
								<span>{localizedLocation([program.location, program.state, program.country], locale)}</span>
								</div>
							</div>
						<h1>{program.title}</h1>
						{showOriginalTitle && <p className="program-original-title">{ui.originalTitle} {program.originalTitle}</p>}
						{heroMeta && <div className="program-hero-chips"><span>{heroMeta}</span></div>}
						{program.summary && <p className="program-hero-summary">{program.summary}</p>}
						<div className="program-hero-actions">
							<Link href={applyUrl} target="_blank" className="btn btn-primary">{ui.applyNow}</Link>
						</div>
					</div>

					<aside className="program-quick-facts">
						<div className="quick-facts-header">
							<span>{ui.quickFacts}</span>
							<strong>{localizedValue(program.degreeLevel, locale)}</strong>
						</div>
						{quickFacts.map((fact) => (
							<div className="quick-fact-row" key={fact.label}>
								<i className={fact.icon} />
								<div>
									<span>{fact.label}</span>
									<strong>{fact.value}</strong>
								</div>
							</div>
						))}
						<Link href={applyUrl} target="_blank" className="quick-facts-cta">{ui.viewUniversityPage}</Link>
						<ProgramOrientationCta
							href={orientationUrl}
							label={ui.freeOrientation}
							heading={ui.ctaHeading}
							text={ui.ctaText}
							button={ui.ctaButton}
							compact
						/>
					</aside>
				</div>

				<nav className="program-section-nav" aria-label={locale === "pt-br" ? "Seções do programa" : "Program sections"}>
					{sectionNav.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
				</nav>

				<div className="program-content-layout">
					<main className="program-content-main">
						<section id="overview" className="program-detail-section">
							<div className="section-heading">
								<p>{ui.overview}</p>
								<h2>{ui.whyThisProgram}</h2>
							</div>
							<div className="program-highlight-grid">
								{highlights.map((highlight) => (
									<div className="program-highlight-card" key={highlight}>
										<i className="ri-check-line" />
										<span>{highlight}</span>
									</div>
								))}
							</div>
						</section>

						<div className="program-media">
							<img src={heroImage} alt={program.title} />
						</div>

						<section className="program-detail-section">
							<div className="section-heading">
								<p>{ui.programSummary}</p>
								<h2>{ui.goodFit}</h2>
							</div>
							<div className="program-summary-grid">
								<SummaryCard title={ui.bestFor} body={program.bestFor || program.targetAudience || fallbackBestFor(program, locale)} />
								<SummaryCard title={ui.careerOutcomes} body={program.careerOutcomes || fallbackCareers(program, locale)} list />
								<SummaryCard title={ui.skills} body={program.skillsYouWillLearn || fallbackSkills(program, locale)} list />
							</div>
						</section>

						<section id="admissions" className="program-detail-section">
							<div className="section-heading">
								<p>{ui.admissions}</p>
								<h2>{ui.requirementsAtGlance}</h2>
							</div>
							<div className="program-info-grid">
								{admissionItems.map((item) => <InfoCard key={item.label} {...item} />)}
							</div>
						</section>

						<ProgramOrientationCta
							href={orientationUrl}
							label={ui.freeOrientation}
							heading={ui.requirementsHeading}
							text={ui.requirementsText}
							button={ui.requirementsButton}
						/>

						<section id="tuition" className="program-detail-section">
							<div className="section-heading">
								<p>{ui.tuitionCosts}</p>
								<h2>{ui.budgetFor}</h2>
							</div>
							<div className="program-info-grid">
								{costItems.map((item) => <InfoCard key={item.label} {...item} />)}
							</div>
						</section>

						<section id="careers" className="program-detail-section">
							<div className="section-heading">
								<p>{ui.careers}</p>
								<h2>{ui.whereLead}</h2>
							</div>
							<div className="career-list">
								{splitList(program.careerOutcomes || fallbackCareers(program, locale)).map((career) => (
									<div key={career} className="career-card"><i className="ri-briefcase-line" /><span>{career}</span></div>
								))}
							</div>
						</section>

						<section id="university" className="program-detail-section">
							<div className="section-heading">
								<p>{ui.university}</p>
								<h2>{program.universityName}</h2>
							</div>
							<div className="university-panel">
								<p>{t(ui.universityDescription, {
									university: program.universityName,
									location: localizedLocation([program.location, program.state, program.country], locale),
								})}</p>
								<div className="university-panel-actions">
									<Link href={`/universities/${program.universityId}`}>{ui.universityProfile}</Link>
									<Link href={program.websiteUrl || program.programUrl} target="_blank">{ui.universityWebsite}</Link>
									{program.contactEmail && <a href={`mailto:${program.contactEmail}`}>{ui.contactProgram}</a>}
								</div>
							</div>
						</section>

						<section className="program-detail-section">
							<div className="university-panel">
								<p className="mb-0">{ui.disclaimer}</p>
							</div>
						</section>

						{program.relatedPrograms.length > 0 && (
							<section className="program-detail-section">
								<div className="section-heading">
									<p>{ui.relatedPrograms}</p>
									<h2>{ui.similarPrograms}</h2>
								</div>
								<div className="related-program-grid">
									{program.relatedPrograms.map((related) => <RelatedProgramCard key={related.id} program={related} locale={locale} />)}
								</div>
							</section>
						)}

						<ProgramOrientationCta
							href={orientationUrl}
							label={ui.freeOrientation}
							heading={ui.compareHeading}
							text={ui.compareText}
							button={ui.ctaButton}
						/>
					</main>
				</div>
			</div>
			<div className="program-mobile-cta">
				<Link href={applyUrl} target="_blank">{ui.mobileApply}</Link>
			</div>
		</section>
	)
}

function ProgramOrientationCta({
	href,
	label,
	heading,
	text,
	button,
	compact = false,
}: {
	href: string
	label: string
	heading: string
	text: string
	button: string
	compact?: boolean
}) {
	return (
		<div className={compact ? "program-orientation-cta compact" : "program-orientation-cta"}>
			<div>
				<span>{label}</span>
				<h3>{heading}</h3>
				<p>{text}</p>
			</div>
			<Link href={href}>{button}</Link>
		</div>
	)
}

function SummaryCard({ title, body, list = false }: { title: string; body: string; list?: boolean }) {
	const items = splitList(body)
	return (
		<div className="program-summary-card">
			<h3>{title}</h3>
			{list ? (
				<ul>
					{items.map((item) => <li key={item}>{item}</li>)}
				</ul>
			) : (
				<p>{body}</p>
			)}
		</div>
	)
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
	return (
		<div className="program-info-card">
			<i className={icon} />
			<div>
				<span>{label}</span>
				<strong>{value}</strong>
			</div>
		</div>
	)
}

function RelatedProgramCard({ program, locale }: { program: ProgramCard; locale: PublicLocale }) {
	return (
		<Link href={program.detailPath} className="related-program-card">
			<span>{optionLabel(program.degreeLevel, locale)}</span>
			<h3>{program.title}</h3>
			<p>{program.universityName}</p>
			<div>{[optionLabel(program.studyField || program.subjectArea, locale), optionLabel(compactLanguages(program.languageOfInstruction), locale)].filter(Boolean).join(" • ")}</div>
		</Link>
	)
}

function buildHighlights(program: ProgramDetail, locale: PublicLocale) {
	const ui = programUi[locale]
	const highlights = [
		program.internationalStudentFit === "High" ? ui.highlights.internationalFriendly : "",
		compactLanguages(program.languageOfInstruction).includes("English") || compactLanguages(program.languageOfInstruction).includes("Inglês") ? ui.highlights.englishFriendly : "",
		program.tuitionType.includes("No Tuition") ? ui.highlights.noTuition : "",
		localizedValue(program.onlineOrOnCampus, locale),
		localizedValue(program.studyField || program.subjectArea, locale),
		...splitList(program.programHighlights),
	].filter(Boolean)

	return Array.from(new Set(highlights)).slice(0, 5)
}

function buildAdmissionItems(program: ProgramDetail, locale: PublicLocale) {
	const ui = programUi[locale]
	return [
		{ icon: "ri-shield-check-line", label: ui.admissionType, value: localizedValue(program.applicationDifficulty || normalizeAdmission(program.restrictedAdmission), locale) || ui.checkWithUniversity },
		{ icon: "ri-file-list-3-line", label: ui.requirements, value: program.admissionRequirements || ui.seeOfficialPage },
		{ icon: "ri-calendar-event-line", label: ui.deadline, value: program.applicationDeadlines || ui.variesBySemester },
		{ icon: "ri-translate-2", label: ui.facts.language, value: localizedValue(compactLanguages(program.languageOfInstruction), locale) || ui.checkProgramPage },
	].filter((item) => item.value)
}

function buildCostItems(program: ProgramDetail, locale: PublicLocale) {
	const ui = programUi[locale]
	return [
		{ icon: "ri-bank-line", label: ui.facts.tuition, value: localizedValue(program.tuitionType, locale) || ui.checkWithUniversity },
		{ icon: "ri-money-euro-circle-line", label: ui.fees, value: program.tuitionOrFees || ui.semesterFeeMayApply },
		{ icon: "ri-home-4-line", label: ui.livingCosts, value: estimatedLivingCosts(program.country, locale) },
	]
}

function compactLanguages(value: string) {
	const languages = splitList(value).map((language) => language.replace(/\s*\(.*?\)\s*/g, "").trim())
	return Array.from(new Set(languages)).slice(0, 2).join(" / ") || value
}

function compactStart(value: string) {
	if (!value) {
		return ""
	}
	const normalized = value.toLowerCase()
	if (normalized.includes("winter") && normalized.includes("summer")) {
		return "Winter / Summer"
	}
	if (normalized.includes("winter")) {
		return "Winter"
	}
	if (normalized.includes("summer")) {
		return "Summer"
	}
	return value
}

function normalizeAdmission(value: string) {
	if (!value) {
		return ""
	}
	return value.toLowerCase().includes("no") ? "Open admission" : value.toLowerCase().includes("yes") ? "Restricted admission" : value
}

function splitList(value: string) {
	return value
		.split(/[;|]/)
		.map((item) => item.trim())
		.filter(Boolean)
}

function extractImageUrl(value: string) {
	return value.match(/https?:\/\/[^\s,;|]+/)?.[0] || ""
}

function initials(value: string) {
	return value
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase()
}

function estimatedLivingCosts(country: string, locale: PublicLocale = "en") {
	if (locale === "pt-br") {
		if (country === "Switzerland") {
			return "Aprox. CHF 1.500-2.200/mês"
		}
		if (country === "Austria") {
			return "Aprox. EUR 950-1.300/mês"
		}
		return "Aprox. EUR 850-1.200/mês"
	}
	if (country === "Switzerland") {
		return "Approx. CHF 1,500-2,200/month"
	}
	if (country === "Austria") {
		return "Approx. EUR 950-1,300/month"
	}
	return "Approx. EUR 850-1,200/month"
}

function fallbackBestFor(program: ProgramDetail, locale: PublicLocale = "en") {
	if (locale === "pt-br") {
		return `Estudantes procurando um programa de ${program.degreeLevel.toLowerCase()} em ${program.studyField || program.subjectArea} na ${program.universityName}.`
	}
	return `Students looking for a ${program.degreeLevel.toLowerCase()} program in ${program.studyField || program.subjectArea} at ${program.universityName}.`
}

function fallbackCareers(program: ProgramDetail, locale: PublicLocale = "en") {
	return [localizedValue(program.studyField || program.subjectArea, locale), ...programUi[locale].fallbacks.careers].filter(Boolean).join("; ")
}

function fallbackSkills(program: ProgramDetail, locale: PublicLocale = "en") {
	return [localizedValue(program.subjectArea, locale), ...programUi[locale].fallbacks.skills].filter(Boolean).join("; ")
}

function localizedValue(value: string, locale: PublicLocale) {
	if (!value) {
		return ""
	}
	const direct = optionLabel(value, locale)
	if (direct !== value) {
		return direct
	}
	return value
		.split(" / ")
		.map((part) => optionLabel(part.trim(), locale))
		.join(" / ")
}

function localizedList(values: string[], locale: PublicLocale, separator = ", ") {
	return values
		.filter(Boolean)
		.map((value) => localizedValue(value, locale))
		.join(separator)
}

function localizedLocation(values: string[], locale: PublicLocale) {
	return localizedList(values, locale, ", ")
}
