import Layout from "@/components/layout/Layout"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

type ProgramWithQaData = Awaited<ReturnType<typeof loadPrograms>>[number]
type UniversityWithQaData = Awaited<ReturnType<typeof loadUniversities>>[number]

type ProgramIssueRow = {
	id: number
	universityId: string
	universityName: string
	programName: string
	issues: string[]
}

type DuplicateGroup<T> = {
	key: string
	items: T[]
}

const visibleProgramFields = [
	"degreeLevel",
	"academicDegree",
	"subjectArea",
	"languageOfInstruction",
	"campusLocation",
	"duration",
	"startTerms",
	"applicationDeadlines",
	"tuitionOrFees",
	"studyMode",
	"restrictedAdmission",
	"studyField",
	"secondaryStudyField",
	"internationalStudentFit",
	"onlineOrOnCampus",
	"fullTimeOrPartTime",
	"applicationDifficulty",
	"tuitionType",
	"workExperienceRequired",
	"metadataConfidence",
] as const

const visibleTranslationFields = [
	"localizedProgramName",
	"subjectArea",
	"languageOfInstruction",
	"campusLocation",
	"duration",
	"startTerms",
	"applicationDeadlines",
	"admissionRequirements",
	"tuitionOrFees",
	"studyMode",
	"restrictedAdmission",
	"summary",
	"seoTitle",
	"seoDescription",
] as const

async function loadPrograms() {
	return prisma.degreeProgram.findMany({
		include: {
			university: true,
			translations: true,
		},
		orderBy: [{ university: { name: "asc" } }, { programName: "asc" }],
	})
}

async function loadUniversities() {
	return prisma.university.findMany({
		include: {
			_count: {
				select: { programs: true },
			},
		},
		orderBy: { name: "asc" },
	})
}

export default async function AdminDataQualityPage() {
	const [programs, universities] = await Promise.all([loadPrograms(), loadUniversities()])
	const totalPrograms = programs.length
	const withPt = programs.filter((program) => hasTranslation(program, "pt")).length
	const withEs = programs.filter((program) => hasTranslation(program, "es")).length
	const missingPt = programs.filter((program) => !hasTranslation(program, "pt"))
	const missingEs = programs.filter((program) => !hasTranslation(program, "es"))
	const programIssues = buildProgramIssues(programs)
	const duplicateUrls = duplicateGroups(
		programs.filter((program) => useful(program.programUrl)),
		(program) => normalizeUrl(program.programUrl || ""),
	).filter((group) => group.items.length > 1)
	const duplicateProgramNames = duplicateGroups(
		programs,
		(program) => `${program.universityId}|${normalizeName(program.programName)}|${normalizeName(program.degreeLevel || "")}`,
	).filter((group) => group.items.length > 1)
	const duplicateUniversityWebsites = duplicateGroups(
		universities.filter((university) => useful(university.websiteUrl)),
		(university) => normalizeUrl(university.websiteUrl || ""),
	).filter((group) => group.items.length > 1)
	const similarUniversities = duplicateGroups(
		universities.filter((university) => useful(university.location)),
		(university) => `${normalizeName(university.location || "")}|${normalizeUniversityName(university.name)}`,
	).filter((group) => group.items.length > 1)

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<AdminHeader title="Data quality" />

					<div className="row g-4 mb-5">
						<MetricCard label="Total degree programs" value={totalPrograms} />
						<MetricCard label="Programs with PT translation" value={withPt} note={`${missingPt.length} missing`} />
						<MetricCard label="Programs with ES translation" value={withEs} note={`${missingEs.length} missing`} />
					</div>

					<div className="row g-4">
						<div className="col-12">
							<ProgramTable
								title="Program quality flags"
								description="Localization wording, Unknown display values, missing summaries, SEO text, and program URLs."
								rows={programIssues}
							/>
						</div>

						<div className="col-lg-6">
							<MissingTranslationTable title="Missing PT translations" rows={missingPt.slice(0, 80)} total={missingPt.length} />
						</div>
						<div className="col-lg-6">
							<MissingTranslationTable title="Missing ES translations" rows={missingEs.slice(0, 80)} total={missingEs.length} />
						</div>

						<div className="col-12">
							<DuplicateProgramTable title="Duplicate program URLs" groups={duplicateUrls} />
						</div>

						<div className="col-12">
							<DuplicateProgramTable title="Same university + same normalized program name + same degree level" groups={duplicateProgramNames} />
						</div>

						<div className="col-12">
							<DuplicateUniversityTable title="Duplicate university website URLs" groups={duplicateUniversityWebsites} />
						</div>

						<div className="col-12">
							<DuplicateUniversityTable title="Same location + similar university name" groups={similarUniversities} />
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}

function AdminHeader({ title }: { title: string }) {
	return (
		<div className="d-flex flex-wrap align-items-end justify-content-between gap-4 mb-6">
			<div>
				<span className="content-top btn-text fw-bold text-primary">
					<i className="ri-pulse-line text-green-3" />
					&nbsp; Mini admin
				</span>
				<h1 className="ds-3 text-primary mb-0">{title}</h1>
			</div>
			<div className="d-flex flex-wrap gap-2">
				<Link href="/admin" className="btn btn-outline-secondary">Program admin</Link>
				<Link href="/admin/program-review" className="btn btn-outline-secondary">Program review</Link>
				<Link href="/admin/inquiries" className="btn btn-outline-secondary">Inquiries</Link>
				<Link href="/courses" className="btn btn-primary">View programs</Link>
			</div>
		</div>
	)
}

function MetricCard({ label, value, note }: { label: string; value: number; note?: string }) {
	return (
		<div className="col-md-4">
			<div className="admin-panel bg-white rounded-3 p-5 h-100">
				<span className="fs-7 text-uppercase text-primary fw-bold">{label}</span>
				<h2 className="ds-4 text-primary mb-1">{value}</h2>
				{note && <p className="mb-0">{note}</p>}
			</div>
		</div>
	)
}

function ProgramTable({ title, description, rows }: { title: string; description: string; rows: ProgramIssueRow[] }) {
	return (
		<div className="admin-panel bg-white rounded-3 p-5">
			<TableHeading title={title} description={description} count={rows.length} />
			<div className="table-responsive">
				<table className="table align-middle">
					<thead>
						<tr>
							<th>Program</th>
							<th>University</th>
							<th>Flags</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{rows.slice(0, 250).map((row) => (
							<tr key={row.id}>
								<td>
									<strong>{row.programName}</strong>
									<div className="fs-8 text-uppercase">ID {row.id}</div>
								</td>
								<td>{row.universityName}</td>
								<td>{row.issues.join(" · ")}</td>
								<td className="text-end">
									<Link href={programEditHref(row.universityId, row.id)} className="btn-text text-primary">Edit</Link>
								</td>
							</tr>
						))}
						{rows.length === 0 && <EmptyTableRow colSpan={4} text="No issues found." />}
					</tbody>
				</table>
			</div>
			{rows.length > 250 && <p className="fs-7 mb-0">Showing first 250 rows.</p>}
		</div>
	)
}

function MissingTranslationTable({ title, rows, total }: { title: string; rows: ProgramWithQaData[]; total: number }) {
	return (
		<div className="admin-panel bg-white rounded-3 p-5 h-100">
			<TableHeading title={title} description="Programs without a translation row for this locale." count={total} />
			<div className="table-responsive">
				<table className="table align-middle">
					<tbody>
						{rows.map((program) => (
							<tr key={program.id}>
								<td>
									<strong>{program.programName}</strong>
									<div>{program.university.name}</div>
								</td>
								<td className="text-end">
									<Link href={programEditHref(program.universityId, program.id)} className="btn-text text-primary">Edit</Link>
								</td>
							</tr>
						))}
						{total === 0 && <EmptyTableRow colSpan={2} text="No missing translations." />}
					</tbody>
				</table>
			</div>
			{total > rows.length && <p className="fs-7 mb-0">Showing first {rows.length} rows.</p>}
		</div>
	)
}

function DuplicateProgramTable({ title, groups }: { title: string; groups: Array<DuplicateGroup<ProgramWithQaData>> }) {
	return (
		<div className="admin-panel bg-white rounded-3 p-5">
			<TableHeading title={title} description="Review candidates only. No automatic merging is performed." count={groups.length} />
			<div className="table-responsive">
				<table className="table align-middle">
					<thead>
						<tr>
							<th>Duplicate key</th>
							<th>Rows</th>
						</tr>
					</thead>
					<tbody>
						{groups.slice(0, 80).map((group) => (
							<tr key={group.key}>
								<td className="text-break">{group.key}</td>
								<td>
									{group.items.map((program) => (
										<div key={program.id} className="mb-2">
											<Link href={programEditHref(program.universityId, program.id)} className="fw-bold text-primary">
												#{program.id} {program.programName}
											</Link>
											<div>{program.university.name}</div>
										</div>
									))}
								</td>
							</tr>
						))}
						{groups.length === 0 && <EmptyTableRow colSpan={2} text="No duplicate candidates found." />}
					</tbody>
				</table>
			</div>
		</div>
	)
}

function DuplicateUniversityTable({ title, groups }: { title: string; groups: Array<DuplicateGroup<UniversityWithQaData>> }) {
	return (
		<div className="admin-panel bg-white rounded-3 p-5">
			<TableHeading title={title} description="Review candidate duplicate university rows before merging manually." count={groups.length} />
			<div className="table-responsive">
				<table className="table align-middle">
					<thead>
						<tr>
							<th>Duplicate key</th>
							<th>Universities</th>
						</tr>
					</thead>
					<tbody>
						{groups.slice(0, 80).map((group) => (
							<tr key={group.key}>
								<td className="text-break">{group.key}</td>
								<td>
									{group.items.map((university) => (
										<div key={university.id} className="mb-2">
											<Link href={`/admin?university=${university.id}`} className="fw-bold text-primary">
												{university.name}
											</Link>
											<div>{[university.location, university.state].filter(Boolean).join(", ")} · {university._count.programs} programs</div>
										</div>
									))}
								</td>
							</tr>
						))}
						{groups.length === 0 && <EmptyTableRow colSpan={2} text="No duplicate candidates found." />}
					</tbody>
				</table>
			</div>
		</div>
	)
}

function TableHeading({ title, description, count }: { title: string; description: string; count: number }) {
	return (
		<div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
			<div>
				<h5 className="text-primary mb-1">{title}</h5>
				<p className="mb-0">{description}</p>
			</div>
			<span className="btn btn-white bg-green-3 text-primary">{count}</span>
		</div>
	)
}

function EmptyTableRow({ colSpan, text }: { colSpan: number; text: string }) {
	return (
		<tr>
			<td colSpan={colSpan}>{text}</td>
		</tr>
	)
}

function buildProgramIssues(programs: ProgramWithQaData[]): ProgramIssueRow[] {
	return programs.flatMap((program) => {
		const issues = [
			...baseProgramIssues(program),
			...program.translations.flatMap((translation) => translationIssues(translation)),
		]

		if (!issues.length) {
			return []
		}

		return [{
			id: program.id,
			universityId: program.universityId,
			universityName: program.university.name,
			programName: program.programName,
			issues,
		}]
	})
}

function baseProgramIssues(program: ProgramWithQaData) {
	const issues: string[] = []
	const unknownFields = visibleProgramFields.filter((field) => isUnknown(program[field]))

	if (unknownFields.length) {
		issues.push(`base Unknown: ${unknownFields.join(", ")}`)
	}
	if (!useful(program.summary)) {
		issues.push("missing base summary")
	}
	if (!useful(program.programUrl)) {
		issues.push("missing programUrl")
	}

	return issues
}

function translationIssues(translation: ProgramWithQaData["translations"][number]) {
	const issues: string[] = []
	const locale = translation.locale
	const unknownFields = visibleTranslationFields.filter((field) => isUnknown(translation[field]))

	if (locale === "pt" && /\bmestre\s+em\b/i.test(translation.localizedProgramName || "")) {
		issues.push("pt wording: localizedProgramName contains Mestre em")
	}
	if (unknownFields.length) {
		issues.push(`${locale} Unknown: ${unknownFields.join(", ")}`)
	}
	if (!useful(translation.summary)) {
		issues.push(`${locale} missing summary`)
	}
	if (!useful(translation.seoTitle)) {
		issues.push(`${locale} missing seoTitle`)
	}
	if (!useful(translation.seoDescription)) {
		issues.push(`${locale} missing seoDescription`)
	}

	return issues
}

function hasTranslation(program: ProgramWithQaData, locale: string) {
	return program.translations.some((translation) => translation.locale === locale)
}

function duplicateGroups<T>(items: T[], keyFor: (item: T) => string) {
	const groups = new Map<string, T[]>()
	for (const item of items) {
		const key = keyFor(item)
		if (!key) continue
		groups.set(key, [...(groups.get(key) || []), item])
	}
	return Array.from(groups.entries()).map(([key, groupItems]) => ({ key, items: groupItems }))
}

function programEditHref(universityId: string, programId: number) {
	return `/admin?university=${encodeURIComponent(universityId)}&program=${programId}`
}

function useful(value: string | null | undefined) {
	return Boolean(String(value || "").trim())
}

function isUnknown(value: string | null | undefined) {
	return String(value || "").trim().toLowerCase() === "unknown"
}

function normalizeUrl(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "")
		.replace(/\/+$/, "")
}

function normalizeName(value: string) {
	return value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, " ")
		.replace(/\b(the|of|and|for|in)\b/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}

function normalizeUniversityName(value: string) {
	return normalizeName(value)
		.replace(/\btechnical university\b/g, "tu")
		.replace(/\buniversity of technology\b/g, "tu")
		.replace(/\btechnische universitat\b/g, "tu")
		.replace(/\btechnische universitaet\b/g, "tu")
		.replace(/\buniversity\b/g, "uni")
		.replace(/\s+/g, " ")
		.trim()
}
