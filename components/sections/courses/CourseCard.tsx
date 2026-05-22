import { coursesUi, optionLabel, type PublicLocale } from "@/lib/i18n"
import { displayAcademicDegree, displayLanguageCombination, joinMetaSegments } from "@/lib/program-display"
import type { ProgramCard } from "@/lib/study-programs"
import Link from "next/link"

export default function CourseCard({ course, locale }: { course: ProgramCard; locale: PublicLocale }) {
	const ui = coursesUi[locale]
	const imageSrc = cardImageSrc(course)
	const tags = [course.studyField || course.subjectArea, course.secondaryStudyField, course.onlineOrOnCampus]
		.filter(isUsefulValue)
		.map((tag) => optionLabel(tag, locale))
		.slice(0, 3)
	const metaItems = uniqueInOrder([course.degreeLevel, displayAcademicDegree(course.academicDegree)].filter(isUsefulValue))
		.map((item) => optionLabel(item, locale))
		.filter((item) => !titleStartsWithDegree(course.title, item))
	const degreeLabel = joinMetaSegments(metaItems)
	const studyMode = [course.onlineOrOnCampus, course.fullTimeOrPartTime].filter(isUsefulValue).map((item) => optionLabel(item, locale)).join(" / ") || localizedUsefulValue(course.studyMode, locale)
	const tuition = optionLabel(usefulValue(course.tuitionType) || usefulValue(course.tuitionOrFees), locale)
	const displayLocation = compactLocation(course, locale)
	const displayLanguage = displayLanguageCombination(course.languageOfInstruction, locale)
	const cardMeta = joinMetaSegments([degreeLabel, displayLocation, displayLanguage, tuition, studyMode])
	const summary = course.summary?.trim()
	const fitLabel = isUsefulValue(course.internationalStudentFit) ? optionLabel(course.internationalStudentFit, locale) : ""

	return (
		<div className="course-card-modern h-100">
			<Link href={course.detailPath} className="course-card-image">
				<img src={imageSrc} alt={course.title} />
				{fitLabel && <span>{fitLabel}</span>}
			</Link>
			<div className="course-card-body">
				<div className="course-card-meta">
					<span>{cardMeta || ui.degreeProgram}</span>
				</div>
				<h5>
					<Link href={course.detailPath}>{course.title}</Link>
				</h5>
				<p className="course-university">{course.universityName}</p>
				<div className="course-facts">
					{usefulValue(displayLocation) && <span><i className="ri-map-pin-line" /> {displayLocation}</span>}
					{usefulValue(displayLanguage) && <span><i className="ri-translate-2" /> {displayLanguage}</span>}
					{tuition && <span><i className="ri-bank-line" /> {tuition}</span>}
					{studyMode && <span><i className="ri-computer-line" /> {studyMode}</span>}
				</div>
				{summary && <p className="course-card-summary">{summary}</p>}
				<div className="course-card-tags">
					{tags.map((tag) => <span key={tag}>{tag}</span>)}
				</div>
				<Link href={course.detailPath} className="course-card-action">{ui.viewProgram}</Link>
			</div>
		</div>
	)
}

function cardImageSrc(course: ProgramCard) {
	const heroImageMatch = course.heroImageUrl.match(/https?:\/\/[^\s,;|]+/)
	return heroImageMatch?.[0] || course.fallbackImageUrl
}

function compactLocation(course: ProgramCard, locale: PublicLocale = "en") {
	return [optionLabel(course.location, locale), optionLabel(course.state, locale), optionLabel(course.country, locale)].filter(isUsefulValue).join(", ")
}

function isUsefulValue(value: string | null | undefined): value is string {
	const normalized = normalize(String(value || ""))
	return Boolean(normalized) && !["unknown", "n a", "na", "null", "undefined"].includes(normalized)
}

function usefulValue(value: string | null | undefined) {
	return isUsefulValue(value) ? value.trim() : ""
}

function localizedUsefulValue(value: string | null | undefined, locale: PublicLocale) {
	return optionLabel(usefulValue(value), locale)
}

function uniqueInOrder(values: string[]) {
	const seen = new Set<string>()
	return values.filter((value) => {
		const key = normalize(value)
		if (!key || seen.has(key) || !isUsefulValue(value)) {
			return false
		}
		seen.add(key)
		return true
	})
}

function titleStartsWithDegree(title: string, degreeLabel: string) {
	const normalizedTitle = normalize(title)
	const normalizedDegree = normalize(degreeLabel)
	return Boolean(normalizedDegree) && normalizedTitle.startsWith(`${normalizedDegree} `)
}

function normalize(value: string) {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
}
