import type { ProgramCard, ProgramDetail } from "@/lib/study-programs"
import Link from "next/link"

type Section2Props = {
	program: ProgramDetail | null
}

type Fact = {
	icon: string
	label: string
	value: string
}

export default function Section2({ program }: Section2Props) {
	if (!program) {
		return (
			<section className="program-detail-page">
				<div className="container">
					<div className="program-empty-state">
						<h4>No study program found</h4>
						<p>Seed the SQLite database from the CSV, then open this page again.</p>
						<Link href="/courses" className="btn btn-primary">Back to programs</Link>
					</div>
				</div>
			</section>
		)
	}

	const applyUrl = program.applicationUrl || program.programUrl
	const heroImage = program.heroImageUrl || "/assets/imgs/pages/learning/page-signle-courses/img-1.png"
	const quickFacts: Fact[] = [
		{ icon: "ri-graduation-cap-line", label: "Degree", value: program.academicDegree || program.degreeLevel },
		{ icon: "ri-time-line", label: "Duration", value: program.duration },
		{ icon: "ri-translate-2", label: "Language", value: compactLanguages(program.languageOfInstruction) },
		{ icon: "ri-map-pin-line", label: "Location", value: [program.location, program.country].filter(Boolean).join(", ") },
		{ icon: "ri-bank-line", label: "Tuition", value: program.tuitionType || program.tuitionOrFees },
		{ icon: "ri-calendar-line", label: "Start", value: compactStart(program.startTerms) },
		{ icon: "ri-shield-check-line", label: "Admission", value: program.applicationDifficulty || normalizeAdmission(program.restrictedAdmission) },
		{ icon: "ri-layout-line", label: "Mode", value: [program.onlineOrOnCampus, program.fullTimeOrPartTime].filter(Boolean).join(" / ") },
	].filter((fact) => fact.value)
	const heroChips = [
		compactLanguages(program.languageOfInstruction),
		program.duration,
		program.tuitionType,
		program.state || program.country,
	].filter(Boolean)
	const highlights = buildHighlights(program)
	const admissionItems = buildAdmissionItems(program)
	const costItems = buildCostItems(program)
	const sectionNav = [
		["Overview", "overview"],
		["Admissions", "admissions"],
		["Tuition", "tuition"],
		["Careers", "careers"],
		["University", "university"],
	]

	return (
		<section className="program-detail-page">
			<div className="container">
				<div className="program-hero">
					<div className="program-hero-main">
						<div className="program-university-mark">
							<div className="program-logo">{initials(program.universityName)}</div>
							<div>
								<p>{program.universityName}</p>
								<span>{[program.location, program.state, program.country].filter(Boolean).join(", ")}</span>
							</div>
						</div>
						<h1>{program.title}</h1>
						<div className="program-hero-chips">
							{heroChips.map((chip) => <span key={chip}>{chip}</span>)}
						</div>
						{program.summary && <p className="program-hero-summary">{program.summary}</p>}
						<div className="program-hero-actions">
							<Link href={applyUrl} target="_blank" className="btn btn-primary">Apply now</Link>
							<button type="button" className="program-secondary-action"><i className="ri-bookmark-line" /> Save</button>
							<button type="button" className="program-secondary-action"><i className="ri-scales-3-line" /> Compare</button>
						</div>
					</div>

					<aside className="program-quick-facts">
						<div className="quick-facts-header">
							<span>Quick facts</span>
							<strong>{program.degreeLevel}</strong>
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
						<Link href={applyUrl} target="_blank" className="quick-facts-cta">View university page</Link>
					</aside>
				</div>

				<nav className="program-section-nav" aria-label="Program sections">
					{sectionNav.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
				</nav>

				<div className="program-content-layout">
					<main className="program-content-main">
						<section id="overview" className="program-detail-section">
							<div className="section-heading">
								<p>Overview</p>
								<h2>Why this program?</h2>
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
								<p>AI summary</p>
								<h2>Good fit, outcomes, and skills</h2>
							</div>
							<div className="program-summary-grid">
								<SummaryCard title="Best for" body={program.bestFor || program.targetAudience || fallbackBestFor(program)} />
								<SummaryCard title="Career outcomes" body={program.careerOutcomes || fallbackCareers(program)} list />
								<SummaryCard title="Skills you will learn" body={program.skillsYouWillLearn || fallbackSkills(program)} list />
							</div>
						</section>

						<section id="admissions" className="program-detail-section">
							<div className="section-heading">
								<p>Admissions</p>
								<h2>Requirements at a glance</h2>
							</div>
							<div className="program-info-grid">
								{admissionItems.map((item) => <InfoCard key={item.label} {...item} />)}
							</div>
						</section>

						<section id="tuition" className="program-detail-section">
							<div className="section-heading">
								<p>Tuition & costs</p>
								<h2>What to budget for</h2>
							</div>
							<div className="program-info-grid">
								{costItems.map((item) => <InfoCard key={item.label} {...item} />)}
							</div>
						</section>

						<section id="careers" className="program-detail-section">
							<div className="section-heading">
								<p>Careers</p>
								<h2>Where this can lead</h2>
							</div>
							<div className="career-list">
								{splitList(program.careerOutcomes || fallbackCareers(program)).map((career) => (
									<span key={career}>{career}</span>
								))}
							</div>
						</section>

						<section id="university" className="program-detail-section">
							<div className="section-heading">
								<p>University</p>
								<h2>{program.universityName}</h2>
							</div>
							<div className="university-panel">
								<p>{program.universityName} is located in {[program.location, program.state, program.country].filter(Boolean).join(", ")}. Open the official program page for the latest application details, deadlines, and documents.</p>
								<div className="university-panel-actions">
									<Link href={program.websiteUrl || program.programUrl} target="_blank">University website</Link>
									{program.contactEmail && <a href={`mailto:${program.contactEmail}`}>Contact program</a>}
								</div>
							</div>
						</section>

						{program.relatedPrograms.length > 0 && (
							<section className="program-detail-section">
								<div className="section-heading">
									<p>Related programs</p>
									<h2>Similar programs</h2>
								</div>
								<div className="related-program-grid">
									{program.relatedPrograms.map((related) => <RelatedProgramCard key={related.id} program={related} />)}
								</div>
							</section>
						)}
					</main>
				</div>
			</div>
			<div className="program-mobile-cta">
				<button type="button"><i className="ri-bookmark-line" /> Save</button>
				<Link href={applyUrl} target="_blank">Apply</Link>
			</div>
		</section>
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

function RelatedProgramCard({ program }: { program: ProgramCard }) {
	return (
		<Link href={`/single-courses?id=${program.id}`} className="related-program-card">
			<span>{program.degreeLevel}</span>
			<h3>{program.title}</h3>
			<p>{program.universityName}</p>
			<div>{[program.studyField || program.subjectArea, compactLanguages(program.languageOfInstruction)].filter(Boolean).join(" • ")}</div>
		</Link>
	)
}

function buildHighlights(program: ProgramDetail) {
	const highlights = [
		program.internationalStudentFit === "High" ? "International-student friendly" : "",
		compactLanguages(program.languageOfInstruction).includes("English") ? "English-friendly instruction" : "",
		program.tuitionType.includes("No Tuition") ? "No tuition fees or semester-fee only" : "",
		program.onlineOrOnCampus || "",
		program.studyField || program.subjectArea,
		...splitList(program.programHighlights),
	].filter(Boolean)

	return Array.from(new Set(highlights)).slice(0, 5)
}

function buildAdmissionItems(program: ProgramDetail) {
	return [
		{ icon: "ri-shield-check-line", label: "Admission type", value: program.applicationDifficulty || normalizeAdmission(program.restrictedAdmission) || "Check with university" },
		{ icon: "ri-file-list-3-line", label: "Requirements", value: program.admissionRequirements || "See official university page" },
		{ icon: "ri-calendar-event-line", label: "Deadline", value: program.applicationDeadlines || "Varies by semester" },
		{ icon: "ri-translate-2", label: "Language", value: compactLanguages(program.languageOfInstruction) || "Check program page" },
	].filter((item) => item.value)
}

function buildCostItems(program: ProgramDetail) {
	return [
		{ icon: "ri-bank-line", label: "Tuition", value: program.tuitionType || "Check with university" },
		{ icon: "ri-money-euro-circle-line", label: "Fees", value: program.tuitionOrFees || "Semester fee may apply" },
		{ icon: "ri-home-4-line", label: "Living costs", value: estimatedLivingCosts(program.country) },
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

function initials(value: string) {
	return value
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase()
}

function estimatedLivingCosts(country: string) {
	if (country === "Switzerland") {
		return "Approx. CHF 1,500-2,200/month"
	}
	if (country === "Austria") {
		return "Approx. EUR 950-1,300/month"
	}
	return "Approx. EUR 850-1,200/month"
}

function fallbackBestFor(program: ProgramDetail) {
	return `Students looking for a ${program.degreeLevel.toLowerCase()} program in ${program.studyField || program.subjectArea} at ${program.universityName}.`
}

function fallbackCareers(program: ProgramDetail) {
	return [program.studyField || program.subjectArea, "Research", "Consulting", "Public or private sector roles"].join("; ")
}

function fallbackSkills(program: ProgramDetail) {
	return [program.subjectArea, "Analytical thinking", "Research methods", "Professional communication"].filter(Boolean).join("; ")
}
