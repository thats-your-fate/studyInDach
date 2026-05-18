'use client'

import type { ProgramCard, UniversityFilter } from "@/lib/study-programs"
import Link from "next/link"
import type { ReactNode } from "react"
import { useMemo, useState } from "react"

type Section2Props = {
	courses: ProgramCard[]
	universities: UniversityFilter[]
}

type FilterKey =
	| "country"
	| "degreeLevel"
	| "studyField"
	| "language"
	| "fullTimeOrPartTime"
	| "state"
	| "location"
	| "internationalStudentFit"
	| "tuitionType"
	| "applicationDifficulty"
	| "onlineOrOnCampus"
	| "startTerms"
	| "ects"
	| "duration"
	| "workExperienceRequired"
	| "metadataConfidence"

type FilterState = Record<FilterKey, string[]>

const emptyFilters: FilterState = {
	country: [],
	degreeLevel: [],
	studyField: [],
	language: [],
	fullTimeOrPartTime: [],
	state: [],
	location: [],
	internationalStudentFit: [],
	tuitionType: [],
	applicationDifficulty: [],
	onlineOrOnCampus: [],
	startTerms: [],
	ects: [],
	duration: [],
	workExperienceRequired: [],
	metadataConfidence: [],
}

const filterLabels: Record<FilterKey, string> = {
	country: "Country",
	degreeLevel: "Degree",
	studyField: "Study field",
	language: "Language",
	fullTimeOrPartTime: "Pace",
	state: "State / Canton",
	location: "City",
	internationalStudentFit: "International fit",
	tuitionType: "Tuition",
	applicationDifficulty: "Admission",
	onlineOrOnCampus: "Format",
	startTerms: "Start term",
	ects: "ECTS",
	duration: "Duration",
	workExperienceRequired: "Work experience",
	metadataConfidence: "Data confidence",
}

const languageAliases: Record<string, string> = {
	deutsch: "German",
	german: "German",
	englisch: "English",
	english: "English",
	franzosisch: "French",
	"franzoesisch": "French",
	french: "French",
	francais: "French",
	italian: "Italian",
	italiano: "Italian",
	spanish: "Spanish",
	spanisch: "Spanish",
}

export default function Section2({ courses }: Section2Props) {
	const [filters, setFilters] = useState<FilterState>(emptyFilters)
	const [search, setSearch] = useState("")
	const [fieldSearch, setFieldSearch] = useState("")
	const [showMoreFilters, setShowMoreFilters] = useState(false)
	const [showAdvanced, setShowAdvanced] = useState(false)

	const allOptions = useMemo(() => buildOptions(courses, emptyFilters, ""), [courses])
	const inferredFilters = useMemo(() => inferFiltersFromSearch(search, allOptions), [search, allOptions])
	const activeFilters = useMemo(() => mergeFilters(filters, inferredFilters), [filters, inferredFilters])
	const options = useMemo(() => buildOptions(courses, activeFilters, search), [courses, activeFilters, search])

	const filteredCourses = useMemo(
		() => courses.filter((course) => matchesCourse(course, activeFilters, search)),
		[courses, activeFilters, search],
	)

	const activeChips = useMemo(() => {
		return (Object.keys(filters) as FilterKey[]).flatMap((key) =>
			filters[key].map((value) => ({ key, value, label: `${filterLabels[key]}: ${value}` })),
		)
	}, [filters])

	const setSingleFilter = (key: FilterKey, value: string) => {
		setFilters((current) => ({ ...current, [key]: value ? [value] : [] }))
	}

	const toggleFilter = (key: FilterKey, value: string) => {
		setFilters((current) => {
			const values = current[key]
			return {
				...current,
				[key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
			}
		})
	}

	const removeFilter = (key: FilterKey, value: string) => {
		setFilters((current) => ({ ...current, [key]: current[key].filter((item) => item !== value) }))
	}

	const clearFilters = () => {
		setFilters(emptyFilters)
		setSearch("")
		setFieldSearch("")
	}

	const filteredStudyFields = options.studyField.filter((field) => normalize(field).includes(normalize(fieldSearch)))

	return (
		<section className="study-course-finder position-relative pt-80 pb-120 bg-secondary-2 z-20">
			<div className="container">
				<div className="course-search-shell">
					<div className="d-flex flex-column flex-xl-row gap-3 align-items-xl-center justify-content-between">
						<div>
							<p className="fs-7 text-uppercase fw-bold text-primary mb-2">Program finder</p>
							<h2 className="ds-5 mb-0 text-primary">Find your course in DACH</h2>
						</div>
						<div className="course-result-count text-xl-end">
							<strong>{filteredCourses.length}</strong>
							<span> of {courses.length} programs</span>
						</div>
					</div>

					<div className="course-search-box mt-4">
						<i className="ri-search-line" />
						<input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search AI masters in Germany taught in English"
							aria-label="Search programs"
						/>
					</div>

					<div className="quick-filter-row mt-4" aria-label="High-frequency filters">
						<QuickSelect label="Country" value={filters.country[0] || ""} options={options.country} onChange={(value) => setSingleFilter("country", value)} />
						<QuickSelect label="Degree level" value={filters.degreeLevel[0] || ""} options={options.degreeLevel} onChange={(value) => setSingleFilter("degreeLevel", value)} />
						<QuickSelect label="Study field" value={filters.studyField[0] || ""} options={options.studyField} onChange={(value) => setSingleFilter("studyField", value)} />
						<QuickSelect label="Language" value={filters.language[0] || ""} options={options.language} onChange={(value) => setSingleFilter("language", value)} />
						<button type="button" className="quick-filter-button" onClick={() => setShowMoreFilters((value) => !value)}>
							<i className="ri-equalizer-2-line" />
							<span>More filters</span>
						</button>
					</div>

					{activeChips.length > 0 && (
						<div className="active-filter-row mt-3">
							{activeChips.map((chip) => (
								<button key={`${chip.key}-${chip.value}`} type="button" onClick={() => removeFilter(chip.key, chip.value)}>
									{chip.label}
									<i className="ri-close-line" />
								</button>
							))}
							<button type="button" className="clear-filters" onClick={clearFilters}>Clear all</button>
						</div>
					)}
				</div>

				<div className={`course-filter-layout mt-5 ${showMoreFilters ? "show-filters" : ""}`}>
					<aside className="course-filter-panel">
						<div className="d-flex align-items-center justify-content-between mb-4">
							<div>
								<p className="fs-8 text-uppercase fw-bold text-primary mb-1">Power filters</p>
								<h6 className="mb-0">Refine results</h6>
							</div>
							<button type="button" className="filter-close d-xl-none" aria-label="Close filters" onClick={() => setShowMoreFilters(false)}>
								<i className="ri-close-line" />
							</button>
						</div>

						<FilterSection title="Academic basics">
							<CheckboxGroup label="Degree level" filterKey="degreeLevel" options={options.degreeLevel} filters={filters} onToggle={toggleFilter} />
							<div className="filter-group">
								<label>Study field</label>
								<input className="filter-search-input" value={fieldSearch} onChange={(event) => setFieldSearch(event.target.value)} placeholder="Search study field..." />
								<div className="checkbox-stack compact">
									{filteredStudyFields.slice(0, 12).map((option) => (
										<label key={option} className="check-row">
											<input type="checkbox" checked={filters.studyField.includes(option)} onChange={() => toggleFilter("studyField", option)} />
											<span>{option}</span>
										</label>
									))}
								</div>
							</div>
						</FilterSection>

						<FilterSection title="Location">
							<ChipGroup filterKey="country" options={options.country} filters={filters} onToggle={toggleFilter} />
							<CheckboxGroup label="State / Canton" filterKey="state" options={options.state} filters={filters} onToggle={toggleFilter} />
							<CheckboxGroup label="City" filterKey="location" options={options.location} filters={filters} onToggle={toggleFilter} />
						</FilterSection>

						<FilterSection title="Language & accessibility">
							<ChipGroup filterKey="language" options={options.language} filters={filters} onToggle={toggleFilter} />
							<ChipGroup filterKey="internationalStudentFit" options={options.internationalStudentFit} filters={filters} onToggle={toggleFilter} />
						</FilterSection>

						<FilterSection title="Cost & admission">
							<ChipGroup filterKey="tuitionType" options={options.tuitionType} filters={filters} onToggle={toggleFilter} />
							<ChipGroup filterKey="applicationDifficulty" options={options.applicationDifficulty} filters={filters} onToggle={toggleFilter} />
						</FilterSection>

						<FilterSection title="Flexibility">
							<ChipGroup filterKey="onlineOrOnCampus" options={options.onlineOrOnCampus} filters={filters} onToggle={toggleFilter} />
							<ChipGroup filterKey="fullTimeOrPartTime" options={options.fullTimeOrPartTime} filters={filters} onToggle={toggleFilter} />
							<CheckboxGroup label="Start term" filterKey="startTerms" options={options.startTerms} filters={filters} onToggle={toggleFilter} />
						</FilterSection>

						<div className="advanced-toggle">
							<button type="button" onClick={() => setShowAdvanced((value) => !value)}>
								<span>Advanced</span>
								<i className={showAdvanced ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} />
							</button>
						</div>

						{showAdvanced && (
							<FilterSection title="Advanced">
								<CheckboxGroup label="ECTS" filterKey="ects" options={options.ects} filters={filters} onToggle={toggleFilter} />
								<CheckboxGroup label="Duration" filterKey="duration" options={options.duration} filters={filters} onToggle={toggleFilter} />
								<ChipGroup filterKey="workExperienceRequired" options={options.workExperienceRequired} filters={filters} onToggle={toggleFilter} />
								<ChipGroup filterKey="metadataConfidence" options={options.metadataConfidence} filters={filters} onToggle={toggleFilter} />
							</FilterSection>
						)}
					</aside>

					<div className="course-results">
						{filteredCourses.length === 0 ? (
							<div className="empty-results">
								<h5>No programs match these filters</h5>
								<p>Try removing a chip or broadening the search terms.</p>
								<button type="button" className="btn btn-primary" onClick={clearFilters}>Reset filters</button>
							</div>
						) : (
							<div className="row g-4">
								{filteredCourses.map((course) => (
									<div key={course.id} className="col-12 col-md-6 col-xxl-4">
										<CourseCard course={course} />
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	)
}

function QuickSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
	return (
		<label className="quick-filter-select">
			<span>{label}</span>
			<select value={value} onChange={(event) => onChange(event.target.value)}>
				<option value="">Any</option>
				{options.map((option) => (
					<option key={option} value={option}>{option}</option>
				))}
			</select>
		</label>
	)
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="filter-section">
			<h6>{title}</h6>
			{children}
		</div>
	)
}

function CheckboxGroup({ label, filterKey, options, filters, onToggle }: { label: string; filterKey: FilterKey; options: string[]; filters: FilterState; onToggle: (key: FilterKey, value: string) => void }) {
	if (!options.length) {
		return null
	}

	return (
		<div className="filter-group">
			<label>{label}</label>
			<div className="checkbox-stack">
				{options.slice(0, 10).map((option) => (
					<label key={option} className="check-row">
						<input type="checkbox" checked={filters[filterKey].includes(option)} onChange={() => onToggle(filterKey, option)} />
						<span>{option}</span>
					</label>
				))}
			</div>
		</div>
	)
}

function ChipGroup({ filterKey, options, filters, onToggle }: { filterKey: FilterKey; options: string[]; filters: FilterState; onToggle: (key: FilterKey, value: string) => void }) {
	if (!options.length) {
		return null
	}

	return (
		<div className="filter-group">
			<label>{filterLabels[filterKey]}</label>
			<div className="filter-chip-group">
				{options.slice(0, 10).map((option) => (
					<button key={option} type="button" className={filters[filterKey].includes(option) ? "active" : ""} onClick={() => onToggle(filterKey, option)}>
						{option}
					</button>
				))}
			</div>
		</div>
	)
}

function CourseCard({ course }: { course: ProgramCard }) {
	const imageSrc = cardImageSrc(course)
	const tags = [course.studyField || course.subjectArea, course.secondaryStudyField, course.onlineOrOnCampus].filter(Boolean).slice(0, 3)

	return (
		<div className="course-card-modern h-100">
			<Link href={course.detailPath} className="course-card-image">
				<img src={imageSrc} alt={course.title} />
				<span>{course.internationalStudentFit || "Fit unknown"} fit</span>
			</Link>
			<div className="course-card-body">
				<div className="course-card-meta">
					<span>{course.degreeLevel}</span>
					<span>{course.country}</span>
				</div>
				<h5>
					<Link href={course.detailPath}>{course.title}</Link>
				</h5>
				<p className="course-university">{course.universityName}</p>
				<div className="course-facts">
					<span><i className="ri-map-pin-line" /> {compactLocation(course)}</span>
					<span><i className="ri-translate-2" /> {compactLanguages(course.languageOfInstruction)}</span>
					<span><i className="ri-time-line" /> {course.duration || "Duration varies"}</span>
					<span><i className="ri-bank-line" /> {course.tuitionType || "Tuition unknown"}</span>
				</div>
				<div className="course-card-tags">
					{tags.map((tag) => <span key={tag}>{tag}</span>)}
				</div>
				<Link href={course.detailPath} className="course-card-action">View Program</Link>
			</div>
		</div>
	)
}

function buildOptions(courses: ProgramCard[], filters: FilterState, search: string): FilterState {
	return filterKeys().reduce((result, key) => {
		const peerFilters = { ...filters, [key]: [] }
		const matchingCourses = courses.filter((course) => matchesCourse(course, peerFilters, search))
		result[key] = uniqueSorted(matchingCourses.flatMap((course) => courseFilterValues(course, key)))
		return result
	}, { ...emptyFilters })
}

function matchesCourse(course: ProgramCard, filters: FilterState, search: string) {
	return filterKeys().every((key) => matchesAny(courseFilterValues(course, key), filters[key])) && matchesSearch(course, search)
}

function courseFilterValues(course: ProgramCard, key: FilterKey) {
	switch (key) {
		case "country":
			return [course.country]
		case "degreeLevel":
			return [course.degreeLevel]
		case "studyField":
			return [course.studyField, course.secondaryStudyField, course.subjectArea]
		case "language":
			return splitValues(course.languageOfInstruction).map(normalizeLanguage)
		case "fullTimeOrPartTime":
			return [course.fullTimeOrPartTime || normalizePace(course.studyMode)]
		case "state":
			return [course.state]
		case "location":
			return [course.location]
		case "internationalStudentFit":
			return [course.internationalStudentFit]
		case "tuitionType":
			return [course.tuitionType]
		case "applicationDifficulty":
			return [course.applicationDifficulty || normalizeAdmission(course.restrictedAdmission)]
		case "onlineOrOnCampus":
			return [course.onlineOrOnCampus || normalizeFormat(course.studyMode)]
		case "startTerms":
			return splitValues(course.startTerms).map(normalizeStartTerm)
		case "ects":
			return [course.ects]
		case "duration":
			return [course.duration]
		case "workExperienceRequired":
			return [course.workExperienceRequired]
		case "metadataConfidence":
			return [course.metadataConfidence]
	}
}

function inferFiltersFromSearch(search: string, options: ReturnType<typeof buildOptions>): FilterState {
	const text = normalize(search)
	if (!text) {
		return emptyFilters
	}

	const inferred: FilterState = { ...emptyFilters }
	inferred.country = options.country.filter((option) => text.includes(normalize(option)))
	inferred.degreeLevel = options.degreeLevel.filter((option) => text.includes(normalize(option)) || text.includes(`${normalize(option)}s`))
	inferred.language = options.language.filter((option) => text.includes(normalize(option)))
	inferred.studyField = options.studyField.filter((option) => {
		const normalized = normalize(option)
		return text.includes(normalized) || normalized.split(" ").some((part) => part.length > 3 && text.includes(part))
	})

	if (text.includes("phd")) {
		inferred.degreeLevel = uniqueSorted([...inferred.degreeLevel, "Doctorate"])
	}
	if (text.includes("master") || text.includes("msc") || text.includes("m sc")) {
		inferred.degreeLevel = uniqueSorted([...inferred.degreeLevel, "Master"])
	}
	if (text.includes("bachelor") || text.includes("bsc") || text.includes("b sc")) {
		inferred.degreeLevel = uniqueSorted([...inferred.degreeLevel, "Bachelor"])
	}

	return inferred
}

function matchesSearch(course: ProgramCard, search: string) {
	const tokens = normalize(search)
		.split(" ")
		.filter((token) => token.length > 2 && !["the", "and", "for", "with", "in", "taught"].includes(token))

	if (!tokens.length) {
		return true
	}

	const haystack = normalize([
		course.title,
		course.universityName,
		course.country,
		course.location,
		course.state,
		course.degreeLevel,
		course.academicDegree,
		course.subjectArea,
		course.studyField,
		course.secondaryStudyField,
		course.languageOfInstruction,
		course.summary,
		course.tuitionType,
		course.applicationDifficulty,
	].join(" "))

	return tokens.every((token) => haystack.includes(token) || (token.endsWith("s") && haystack.includes(token.slice(0, -1))))
}

function mergeFilters(base: FilterState, inferred: FilterState): FilterState {
	return filterKeys().reduce((result, key) => {
		result[key] = uniqueSorted([...base[key], ...inferred[key]])
		return result
	}, { ...emptyFilters })
}

function matchesAny(values: string[], selected: string[]) {
	return !selected.length || values.some((value) => selected.includes(value))
}

function filterKeys() {
	return Object.keys(emptyFilters) as FilterKey[]
}

function splitValues(value: string) {
	return value
		.split(/[;,/|]+/)
		.map((item) => item.trim())
		.filter(Boolean)
}

function normalizeLanguage(value: string) {
	const normalized = normalize(value).replace("oe", "o")
	return languageAliases[normalized] || value.replace(/\s*\(.*?\)\s*/g, "").trim()
}

function normalizeStartTerm(value: string) {
	const normalized = normalize(value)
	if (normalized.includes("winter") || normalized.includes("fall") || normalized.includes("autumn") || normalized.includes("oktober") || normalized.includes("october")) {
		return "Winter"
	}
	if (normalized.includes("summer") || normalized.includes("sommer") || normalized.includes("april")) {
		return "Summer"
	}
	if (normalized.includes("rolling") || normalized.includes("month")) {
		return "Rolling"
	}
	return value
}

function normalizePace(value: string) {
	const normalized = normalize(value)
	if (normalized.includes("part") && normalized.includes("full")) {
		return "Both"
	}
	if (normalized.includes("part")) {
		return "Part Time"
	}
	if (normalized.includes("full") || normalized.includes("vollzeit")) {
		return "Full Time"
	}
	return ""
}

function normalizeFormat(value: string) {
	const normalized = normalize(value)
	if (normalized.includes("hybrid")) {
		return "Hybrid"
	}
	if (normalized.includes("online")) {
		return "Online"
	}
	if (normalized.includes("campus") || normalized.includes("prasenz")) {
		return "On Campus"
	}
	return ""
}

function normalizeAdmission(value: string) {
	const normalized = normalize(value)
	if (normalized.includes("no")) {
		return "Open Admission"
	}
	if (normalized.includes("yes")) {
		return "Restricted Admission"
	}
	return ""
}

function uniqueSorted(values: string[]) {
	return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value) && value !== "Unknown")))
		.sort((a, b) => a.localeCompare(b))
}

function normalize(value: string) {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
}

function cardImageSrc(course: ProgramCard) {
	const heroImageMatch = course.heroImageUrl.match(/https?:\/\/[^\s,;|]+/)
	return heroImageMatch?.[0] || course.fallbackImageUrl
}

function compactLocation(course: ProgramCard) {
	return [course.location, course.country].filter(Boolean).join(", ")
}

function compactLanguages(value: string) {
	const languages = uniqueSorted(splitValues(value).map(normalizeLanguage))
	return languages.slice(0, 2).join(" + ") || "Language varies"
}
