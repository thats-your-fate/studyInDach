'use client'

import { coursesUi, optionLabel, t, type PublicLocale } from "@/lib/i18n"
import type { CourseFilterKey, CourseFilterState, ProgramCard, UniversityFilter } from "@/lib/study-programs"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useEffect, useMemo, useState, useTransition } from "react"

type Section2Props = {
	courses: ProgramCard[]
	universities: UniversityFilter[]
	totalPrograms: number
	totalMatching: number
	page: number
	totalPages: number
	pageSize: number
	initialFilters: CourseFilterState
	initialSearch: string
	filterOptions: CourseFilterState
	locale?: PublicLocale
}

type FilterKey = CourseFilterKey
type FilterState = CourseFilterState

const emptyFilters: FilterState = {
	country: [],
	degreeLevel: [],
	studyField: [],
	university: [],
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

const languageAliases: Record<string, string> = {
	deutsch: "German",
	allemand: "German",
	german: "German",
	englisch: "English",
	anglais: "English",
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

export default function Section2({ courses, totalPrograms, totalMatching, page, totalPages, initialFilters, initialSearch, filterOptions, locale = "en" }: Section2Props) {
	const router = useRouter()
	const pathname = usePathname()
	const ui = coursesUi[locale]
	const [isPending, startTransition] = useTransition()
	const [filters, setFilters] = useState<FilterState>(initialFilters)
	const [search, setSearch] = useState(initialSearch)
	const [fieldSearch, setFieldSearch] = useState("")
	const [showAdvanced, setShowAdvanced] = useState(false)
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

	useEffect(() => {
		setFilters(initialFilters)
		setSearch(initialSearch)
	}, [initialFilters, initialSearch])

	const options = useMemo(() => mergeFilters(filterOptions, filters), [filterOptions, filters])
	const visibleCourses = courses

	const activeChips = useMemo(() => {
		return (Object.keys(filters) as FilterKey[]).flatMap((key) =>
			filters[key].map((value) => ({ key, value, label: optionLabel(value, locale) })),
		)
	}, [filters, locale])

	const navigate = (nextFilters: FilterState, nextSearch: string, nextPage = 1) => {
		const params = buildCourseParams(nextFilters, nextSearch, nextPage)
		const href = params.toString() ? `${pathname}?${params.toString()}` : pathname
		startTransition(() => {
			router.push(href, { scroll: false })
		})
	}

	const setSingleFilter = (key: FilterKey, value: string) => {
		const nextFilters = { ...filters, [key]: value ? [value] : [] }
		setFilters(nextFilters)
		navigate(nextFilters, search)
	}

	const toggleFilter = (key: FilterKey, value: string) => {
		const values = filters[key]
		const nextFilters = {
			...filters,
			[key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
		}
		setFilters(nextFilters)
		navigate(nextFilters, search)
	}

	const removeFilter = (key: FilterKey, value: string) => {
		const nextFilters = { ...filters, [key]: filters[key].filter((item) => item !== value) }
		setFilters(nextFilters)
		navigate(nextFilters, search)
	}

	const clearFilters = () => {
		setFilters(emptyFilters)
		setSearch("")
		setFieldSearch("")
		navigate(emptyFilters, "")
	}

	const filteredStudyFields = options.studyField.filter((field) => normalize(field).includes(normalize(fieldSearch)))
	const visibleStudyFields = expandedGroups.studyField ? filteredStudyFields : filteredStudyFields.slice(0, 12)
	const toggleExpandedGroup = (group: string) => {
		setExpandedGroups((current) => ({ ...current, [group]: !current[group] }))
	}

	return (
		<section className="study-course-finder position-relative pt-80 pb-120 bg-secondary-2 z-20">
			<div className="container">
				<div className="course-search-shell">
					<div className="d-flex flex-column flex-xl-row gap-3 align-items-xl-center justify-content-between">
						<div>
							<p className="fs-7 text-uppercase fw-bold text-primary mb-2">{ui.programFinder}</p>
							<h2 className="ds-5 mb-0 text-primary">{ui.findCourse}</h2>
							<p className="course-results-intro mb-0 mt-2">
								{ui.intro}
							</p>
						</div>
						<div className="course-result-count text-xl-end">
							<strong>{totalMatching}</strong>
							<span> {t(ui.ofPrograms, { total: totalPrograms })}</span>
						</div>
					</div>

					<form className="course-search-box mt-4" onSubmit={(event) => {
						event.preventDefault()
						navigate(filters, search)
					}}>
						<i className="ri-search-line" />
						<input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder={ui.searchPlaceholder}
							aria-label={ui.searchAria}
						/>
					</form>

					<div className="quick-filter-row mt-4" aria-label="High-frequency filters">
						<QuickSelect label={ui.filterLabels.country} value={filters.country[0] || ""} options={options.country} locale={locale} anyLabel={ui.any} onChange={(value) => setSingleFilter("country", value)} />
						<QuickSelect label={ui.filterLabels.degreeLevel} value={filters.degreeLevel[0] || ""} options={options.degreeLevel} locale={locale} anyLabel={ui.any} onChange={(value) => setSingleFilter("degreeLevel", value)} />
						<QuickSelect label={ui.filterLabels.studyField} value={filters.studyField[0] || ""} options={options.studyField} locale={locale} anyLabel={ui.any} onChange={(value) => setSingleFilter("studyField", value)} />
						<QuickSelect label={ui.filterLabels.language} value={filters.language[0] || ""} options={options.language} locale={locale} anyLabel={ui.any} onChange={(value) => setSingleFilter("language", value)} />
					</div>

				</div>

				<div className="course-filter-layout mt-5">
					<aside className="course-filter-panel">
						<div className="d-flex align-items-center justify-content-between mb-4">
							<div>
								<p className="fs-8 text-uppercase fw-bold text-primary mb-1">{ui.powerFilters}</p>
								<h6 className="mb-0">{ui.refineResults}</h6>
							</div>
						</div>

						<FilterSection title={ui.academicBasics}>
							<CheckboxGroup label={ui.filterLabels.degreeLevel} filterKey="degreeLevel" options={options.degreeLevel} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.degreeLevel} onToggleExpanded={() => toggleExpandedGroup("degreeLevel")} locale={locale} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
							<div className="filter-group">
								<label>{ui.filterLabels.studyField}</label>
								<input className="filter-search-input" value={fieldSearch} onChange={(event) => setFieldSearch(event.target.value)} placeholder={ui.searchStudyField} />
								<div className="checkbox-stack compact">
									{visibleStudyFields.map((option) => (
										<label key={option} className="check-row">
											<input type="checkbox" checked={filters.studyField.includes(option)} onChange={() => toggleFilter("studyField", option)} />
											<span>{optionLabel(option, locale)}</span>
										</label>
									))}
								</div>
								{filteredStudyFields.length > 12 && (
									<button type="button" className="filter-show-more" onClick={() => toggleExpandedGroup("studyField")}>
										{expandedGroups.studyField ? ui.showLess : t(ui.showMore, { count: filteredStudyFields.length - 12 })}
									</button>
								)}
							</div>
						</FilterSection>

						<FilterSection title={ui.location}>
							<ChipGroup filterKey="country" options={options.country} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.country} onToggleExpanded={() => toggleExpandedGroup("country")} locale={locale} labels={ui.filterLabels} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
							<CheckboxGroup label={ui.filterLabels.university} filterKey="university" options={options.university} filters={filters} onToggle={toggleFilter} limit={8} expanded={expandedGroups.university} onToggleExpanded={() => toggleExpandedGroup("university")} locale={locale} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
							<CheckboxGroup label={ui.filterLabels.state} filterKey="state" options={options.state} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.state} onToggleExpanded={() => toggleExpandedGroup("state")} locale={locale} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
							<CheckboxGroup label={ui.filterLabels.location} filterKey="location" options={options.location} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.location} onToggleExpanded={() => toggleExpandedGroup("location")} locale={locale} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
						</FilterSection>

						<FilterSection title={ui.languageAccessibility}>
							<ChipGroup filterKey="language" options={options.language} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.language} onToggleExpanded={() => toggleExpandedGroup("language")} locale={locale} labels={ui.filterLabels} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
							<ChipGroup filterKey="internationalStudentFit" options={options.internationalStudentFit} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.internationalStudentFit} onToggleExpanded={() => toggleExpandedGroup("internationalStudentFit")} locale={locale} labels={ui.filterLabels} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
						</FilterSection>

						<FilterSection title={ui.costAdmission}>
							<ChipGroup filterKey="tuitionType" options={options.tuitionType} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.tuitionType} onToggleExpanded={() => toggleExpandedGroup("tuitionType")} locale={locale} labels={ui.filterLabels} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
							<ChipGroup filterKey="applicationDifficulty" options={options.applicationDifficulty} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.applicationDifficulty} onToggleExpanded={() => toggleExpandedGroup("applicationDifficulty")} locale={locale} labels={ui.filterLabels} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
						</FilterSection>

						<FilterSection title={ui.flexibility}>
							<ChipGroup filterKey="onlineOrOnCampus" options={options.onlineOrOnCampus} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.onlineOrOnCampus} onToggleExpanded={() => toggleExpandedGroup("onlineOrOnCampus")} locale={locale} labels={ui.filterLabels} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
							<ChipGroup filterKey="fullTimeOrPartTime" options={options.fullTimeOrPartTime} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.fullTimeOrPartTime} onToggleExpanded={() => toggleExpandedGroup("fullTimeOrPartTime")} locale={locale} labels={ui.filterLabels} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
							<CheckboxGroup label={ui.filterLabels.startTerms} filterKey="startTerms" options={options.startTerms} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.startTerms} onToggleExpanded={() => toggleExpandedGroup("startTerms")} locale={locale} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
						</FilterSection>

						<div className="advanced-toggle">
							<button type="button" onClick={() => setShowAdvanced((value) => !value)}>
								<span>{ui.advanced}</span>
								<i className={showAdvanced ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} />
							</button>
						</div>

						{showAdvanced && (
							<FilterSection title={ui.advanced}>
								<CheckboxGroup label={ui.filterLabels.ects} filterKey="ects" options={options.ects} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.ects} onToggleExpanded={() => toggleExpandedGroup("ects")} locale={locale} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
								<CheckboxGroup label={ui.filterLabels.duration} filterKey="duration" options={options.duration} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.duration} onToggleExpanded={() => toggleExpandedGroup("duration")} locale={locale} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
								<ChipGroup filterKey="workExperienceRequired" options={options.workExperienceRequired} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.workExperienceRequired} onToggleExpanded={() => toggleExpandedGroup("workExperienceRequired")} locale={locale} labels={ui.filterLabels} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
								<ChipGroup filterKey="metadataConfidence" options={options.metadataConfidence} filters={filters} onToggle={toggleFilter} expanded={expandedGroups.metadataConfidence} onToggleExpanded={() => toggleExpandedGroup("metadataConfidence")} locale={locale} labels={ui.filterLabels} showLessLabel={ui.showLess} showMoreLabel={ui.showMore} />
							</FilterSection>
						)}
					</aside>

					<div className="course-results position-relative">
						{isPending && <div className="course-results-loading">{ui.updating}</div>}
						{activeChips.length > 0 && (
							<div className="active-filter-row course-results-active-filters">
								{activeChips.map((chip) => (
									<button key={`${chip.key}-${chip.value}`} type="button" onClick={() => removeFilter(chip.key, chip.value)}>
										{chip.label}
										<i className="ri-close-line" />
									</button>
								))}
								<button type="button" className="clear-filters" onClick={clearFilters}>{ui.clearAll}</button>
							</div>
						)}
						{visibleCourses.length === 0 ? (
							<div className="empty-results">
								<h5>{ui.noResultsTitle}</h5>
								<p>{ui.noResultsText}</p>
								<button type="button" className="btn btn-primary" onClick={clearFilters}>{ui.resetFilters}</button>
							</div>
						) : (
							<div className="row g-4">
								{visibleCourses.map((course) => (
									<div key={course.id} className="col-12 col-md-6 col-xxl-4">
										<CourseCard course={course} locale={locale} />
									</div>
								))}
							</div>
						)}
						{totalPages > 1 && (
							<nav className="course-pagination" aria-label="Course pagination">
								{page > 1 && <Link href={pageHref(pathname, filters, search, page - 1)}>{ui.previous}</Link>}
								{paginationItems(page, totalPages).map((item) => (
									item === "..." ? (
										<span key={`${item}-${page}`}>...</span>
									) : (
										<Link key={item} href={pageHref(pathname, filters, search, item)} className={item === page ? "active" : ""}>{item}</Link>
									)
								))}
								{page < totalPages && <Link href={pageHref(pathname, filters, search, page + 1)}>{ui.next}</Link>}
							</nav>
						)}
					</div>
				</div>
			</div>
		</section>
	)
}

function buildCourseParams(filters: FilterState, search: string, page: number) {
	const params = new URLSearchParams()
	if (search.trim()) {
		params.set("q", search.trim())
	}
	filterKeys().forEach((key) => {
		filters[key].forEach((value) => {
			params.append(key, value)
		})
	})
	if (page > 1) {
		params.set("page", String(page))
	}
	return params
}

function pageHref(pathname: string, filters: FilterState, search: string, page: number) {
	const params = buildCourseParams(filters, search, page)
	return params.toString() ? `${pathname}?${params.toString()}` : pathname
}

function paginationItems(page: number, totalPages: number) {
	const items: Array<number | "..."> = []
	for (let candidate = 1; candidate <= totalPages; candidate += 1) {
		if (candidate === 1 || candidate === totalPages || Math.abs(candidate - page) <= 1) {
			items.push(candidate)
			continue
		}
		if (items[items.length - 1] !== "...") {
			items.push("...")
		}
	}
	return items
}

function QuickSelect({
	label,
	value,
	options,
	locale,
	anyLabel,
	onChange,
}: {
	label: string
	value: string
	options: string[]
	locale: PublicLocale
	anyLabel: string
	onChange: (value: string) => void
}) {
	return (
		<label className="quick-filter-select">
			<span>{label}</span>
			<select value={value} onChange={(event) => onChange(event.target.value)}>
				<option value="">{anyLabel}</option>
				{options.map((option) => (
					<option key={option} value={option}>{optionLabel(option, locale)}</option>
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

function CheckboxGroup({
	label,
	filterKey,
	options,
	filters,
	onToggle,
	limit = 10,
	expanded = false,
	onToggleExpanded,
	locale,
	showLessLabel,
	showMoreLabel,
}: {
	label: string
	filterKey: FilterKey
	options: string[]
	filters: FilterState
	onToggle: (key: FilterKey, value: string) => void
	limit?: number
	expanded?: boolean
	onToggleExpanded?: () => void
	locale: PublicLocale
	showLessLabel: string
	showMoreLabel: string
}) {
	if (!options.length) {
		return null
	}

	const visibleOptions = expanded ? options : options.slice(0, limit)

	return (
		<div className="filter-group">
			<label>{label}</label>
			<div className="checkbox-stack">
				{visibleOptions.map((option) => (
					<label key={option} className="check-row">
						<input type="checkbox" checked={filters[filterKey].includes(option)} onChange={() => onToggle(filterKey, option)} />
						<span>{optionLabel(option, locale)}</span>
					</label>
				))}
			</div>
			{options.length > limit && onToggleExpanded && (
				<button type="button" className="filter-show-more" onClick={onToggleExpanded}>
					{expanded ? showLessLabel : t(showMoreLabel, { count: options.length - limit })}
				</button>
			)}
		</div>
	)
}

function ChipGroup({
	filterKey,
	options,
	filters,
	onToggle,
	limit = 10,
	expanded = false,
	onToggleExpanded,
	locale,
	labels,
	showLessLabel,
	showMoreLabel,
}: {
	filterKey: FilterKey
	options: string[]
	filters: FilterState
	onToggle: (key: FilterKey, value: string) => void
	limit?: number
	expanded?: boolean
	onToggleExpanded?: () => void
	locale: PublicLocale
	labels: Record<FilterKey, string>
	showLessLabel: string
	showMoreLabel: string
}) {
	if (!options.length) {
		return null
	}

	const visibleOptions = expanded ? options : options.slice(0, limit)

	return (
		<div className="filter-group">
			<label>{labels[filterKey]}</label>
			<div className="filter-chip-group">
				{visibleOptions.map((option) => (
					<button key={option} type="button" className={filters[filterKey].includes(option) ? "active" : ""} onClick={() => onToggle(filterKey, option)}>
						{optionLabel(option, locale)}
					</button>
				))}
			</div>
			{options.length > limit && onToggleExpanded && (
				<button type="button" className="filter-show-more" onClick={onToggleExpanded}>
					{expanded ? showLessLabel : t(showMoreLabel, { count: options.length - limit })}
				</button>
			)}
		</div>
	)
}

function CourseCard({ course, locale }: { course: ProgramCard; locale: PublicLocale }) {
	const ui = coursesUi[locale]
	const imageSrc = cardImageSrc(course)
	const tags = [course.studyField || course.subjectArea, course.secondaryStudyField, course.onlineOrOnCampus]
		.filter(isUsefulValue)
		.map((tag) => optionLabel(tag, locale))
		.slice(0, 3)
	const metaItems = uniqueInOrder([course.degreeLevel, compactAcademicDegree(course.academicDegree), course.location, course.country].filter(isUsefulValue))
		.map((item) => optionLabel(item, locale))
	const degreeLabel = metaItems.join(" · ")
	const studyMode = [course.onlineOrOnCampus, course.fullTimeOrPartTime].filter(isUsefulValue).map((item) => optionLabel(item, locale)).join(" / ") || usefulValue(course.studyMode)
	const tuition = optionLabel(usefulValue(course.tuitionType) || usefulValue(course.tuitionOrFees), locale)
	const summary = course.summary?.trim()

	return (
		<div className="course-card-modern h-100">
			<Link href={course.detailPath} className="course-card-image">
				<img src={imageSrc} alt={course.title} />
				<span>{optionLabel(course.internationalStudentFit, locale) || ui.fitUnknown}</span>
			</Link>
			<div className="course-card-body">
				<div className="course-card-meta">
					<span>{degreeLabel || ui.degreeProgram}</span>
				</div>
				<h5>
					<Link href={course.detailPath}>{course.title}</Link>
				</h5>
				<p className="course-university">{course.universityName}</p>
				<div className="course-facts">
					{usefulValue(compactLocation(course)) && <span><i className="ri-map-pin-line" /> {compactLocation(course)}</span>}
					{usefulValue(compactLanguages(course.languageOfInstruction)) && <span><i className="ri-translate-2" /> {optionLabel(compactLanguages(course.languageOfInstruction), locale)}</span>}
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
		case "university":
			return [course.universityName]
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
	if (!normalized || /^\d+$/.test(normalized) || /^\d{1,2}\s+\d{1,2}\s*\d{0,4}$/.test(normalized)) {
		return ""
	}
	if (
		normalized.includes("winter")
		|| normalized.includes("fall")
		|| normalized.includes("autumn")
		|| normalized.includes("automne")
		|| normalized.includes("herbst")
		|| normalized.includes("september")
		|| normalized.includes("october")
		|| normalized.includes("oktober")
		|| normalized.includes("november")
	) {
		return "Winter"
	}
	if (
		normalized.includes("summer")
		|| normalized.includes("sommer")
		|| normalized.includes("spring")
		|| normalized.includes("printemps")
		|| normalized.includes("march")
		|| normalized.includes("maerz")
		|| normalized.includes("marz")
		|| normalized.includes("april")
	) {
		return "Summer"
	}
	if (normalized.includes("rolling") || normalized.includes("month") || normalized.includes("anytime") || normalized.includes("various")) {
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
	return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => isUsefulValue(value))))
		.sort((a, b) => a.localeCompare(b))
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
	return [course.location, course.state, course.country].filter(Boolean).join(", ")
}

function compactLanguages(value: string) {
	const languages = uniqueSorted(splitValues(value).map(normalizeLanguage))
	return languages.slice(0, 2).join(" + ")
}

function isUsefulValue(value: string | null | undefined): value is string {
	const normalized = normalize(String(value || ""))
	return Boolean(normalized) && !["unknown", "n a", "na", "null", "undefined"].includes(normalized)
}

function usefulValue(value: string | null | undefined) {
	return isUsefulValue(value) ? value.trim() : ""
}

function compactAcademicDegree(value: string) {
	const normalized = normalize(value)
	const parenthetical = value.match(/\(([A-Z][A-Za-z. ]{1,12})\)/)?.[1]?.replace(/\s+/g, "")
	if (parenthetical) {
		return parenthetical
	}
	if (normalized.includes("master of science")) {
		return "M.Sc."
	}
	if (normalized.includes("bachelor of science")) {
		return "B.Sc."
	}
	if (normalized.includes("master of arts")) {
		return "M.A."
	}
	if (normalized.includes("bachelor of arts")) {
		return "B.A."
	}
	if (normalized.includes("master of engineering")) {
		return "M.Eng."
	}
	if (normalized.includes("bachelor of engineering")) {
		return "B.Eng."
	}
	return value
}
