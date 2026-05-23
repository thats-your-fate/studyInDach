import Layout from "@/components/layout/Layout"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
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

async function updateProgramDuplicate(formData: FormData) {
	"use server"

	const id = Number(formData.get("id"))
	const selectedCanonicalId = Number(formData.get("canonicalId"))
	const manualCanonicalId = Number(formData.get("manualCanonicalId"))
	const canonicalId = Number.isFinite(manualCanonicalId) && manualCanonicalId > 0 ? manualCanonicalId : selectedCanonicalId
	const action = String(formData.get("action") || "")
	if (!Number.isFinite(id) || id <= 0) return

	if (action === "clear") {
		await prisma.degreeProgram.update({
			where: { id },
			data: { duplicateStatus: "unique", canonicalProgramId: null, duplicateNotes: null, isPublished: true },
		})
	} else if (action === "mark" && await validCanonicalProgramId(id, canonicalId)) {
		await prisma.degreeProgram.update({
			where: { id },
			data: {
				duplicateStatus: "duplicate",
				canonicalProgramId: canonicalId,
				duplicateNotes: `Duplicate candidate. Canonical program ID: ${canonicalId}`,
			},
		})
	} else if (action === "hide" && await validCanonicalProgramId(id, canonicalId)) {
		await prisma.degreeProgram.update({
			where: { id },
			data: {
				duplicateStatus: "duplicate",
				canonicalProgramId: canonicalId,
				isPublished: false,
				duplicateNotes: `Hidden duplicate. Canonical program ID: ${canonicalId}`,
			},
		})
	}

	revalidatePublicDuplicatePaths()
}

async function validCanonicalProgramId(id: number, canonicalId: number) {
	if (!Number.isFinite(canonicalId) || canonicalId <= 0 || canonicalId === id) {
		return false
	}
	const canonical = await prisma.degreeProgram.findUnique({
		where: { id: canonicalId },
		select: { id: true },
	})
	return Boolean(canonical)
}

async function updateUniversityDuplicate(formData: FormData) {
	"use server"

	const id = String(formData.get("id") || "")
	const canonicalId = String(formData.get("canonicalId") || "")
	const action = String(formData.get("action") || "")
	if (!id) return

	if (action === "clear") {
		await prisma.university.update({
			where: { id },
			data: { duplicateStatus: "unique", canonicalUniversityId: null, duplicateNotes: null },
		})
	} else if ((action === "mark" || action === "hide") && canonicalId && canonicalId !== id) {
		await prisma.university.update({
			where: { id },
			data: {
				duplicateStatus: "duplicate",
				canonicalUniversityId: canonicalId,
				duplicateNotes: `${action === "hide" ? "Hidden duplicate" : "Duplicate candidate"}. Canonical university ID: ${canonicalId}`,
			},
		})
	}

	revalidatePublicDuplicatePaths()
}

function revalidatePublicDuplicatePaths() {
	revalidatePath("/courses")
	revalidatePath("/pt-br/cursos")
	revalidatePath("/es/programas")
	revalidatePath("/universities")
	revalidatePath("/pt-br/universidades")
	revalidatePath("/es/universidades")
	revalidatePath("/sitemap.xml")
	revalidatePath("/admin/data-quality")
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
		(program) => normalizeProgramUrlAcrossLanguageVariants(program.programUrl || ""),
	).filter((group) => group.items.length > 1)
	const duplicateProgramNames = duplicateGroups(
		programs,
		(program) => [
			program.universityId,
			normalizeName(program.degreeLevel || ""),
			normalizeProgramTitleForDuplicate(program.programName),
		].join("|"),
	).filter((group) => {
		const [, degreeLevel, title] = group.key.split("|")
		return Boolean(degreeLevel && title && group.items.length > 1)
	})
	const similarProgramNames = duplicateGroups(
		programs,
		(program) => `${program.universityId}|${normalizeName(program.degreeLevel || "")}|${similarTitleKey(program.programName)}`,
	).filter((group) => group.key.split("|").at(-1) && group.items.length > 1)
	const duplicateLocalizedNames = duplicateGroups(
		programs.flatMap((program) => localizedExactNameKeys(program).map((key) => ({ key, program }))),
		(item) => item.key,
	)
		.filter((group) => group.items.length > 1)
		.map((group) => ({
			key: group.key,
			items: uniquePrograms(group.items.map((item) => item.program)),
		}))
		.filter((group) => group.items.length > 1)
	const similarLocalizedNames = duplicateGroups(
		programs.flatMap((program) => localizedNameKeys(program).map((key) => ({ key, program }))),
		(item) => item.key,
	)
		.filter((group) => group.items.length > 1)
		.map((group) => ({
			key: group.key,
			items: uniquePrograms(group.items.map((item) => item.program)),
		}))
		.filter((group) => group.items.length > 1)
	const duplicateAcademicFieldTitles = duplicateGroups(
		programs,
		(program) => [
			program.universityId,
			normalizeName(program.academicDegree || ""),
			normalizeName(program.studyField || program.subjectArea || ""),
			similarTitleKey(program.programName),
		].join("|"),
	).filter((group) => {
		const [, academicDegree, studyField, titleKey] = group.key.split("|")
		return Boolean(academicDegree && studyField && titleKey && group.items.length > 1)
	})
	const duplicateSourcePaths = duplicateGroups(
		programs.filter((program) => useful(program.programUrl)),
		(program) => `${program.universityId}|${normalizeSourcePath(program.programUrl || "")}`,
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
							<DuplicateProgramTable title="Duplicate program URLs across language variants" groups={duplicateUrls} />
						</div>

						<div className="col-12">
							<DuplicateProgramTable title="Same university + same degree level + same normalized title" groups={duplicateProgramNames} />
						</div>

						<div className="col-12">
							<DuplicateProgramTable title="Same university + same degree level + very similar program name" groups={similarProgramNames} />
						</div>

						<div className="col-12">
							<DuplicateProgramTable title="Same university + same localized program name after normalization" groups={duplicateLocalizedNames} />
						</div>

						<div className="col-12">
							<DuplicateProgramTable title="Same university + same degree level + similar localized title" groups={similarLocalizedNames} />
						</div>

						<div className="col-12">
							<DuplicateProgramTable title="Same university + same academic degree + study field + similar title" groups={duplicateAcademicFieldTitles} />
						</div>

						<div className="col-12">
							<DuplicateProgramTable title="Same source URL path across language variants" groups={duplicateSourcePaths} />
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
											<div className="fs-8">
												{program.duplicateStatus || "unique"}
												{program.canonicalProgramId ? ` · canonical #${program.canonicalProgramId}` : ""}
												{program.isPublished ? "" : " · hidden"}
											</div>
											<ProgramDuplicateActions program={program} candidates={group.items} />
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
											<div className="fs-8">
												{university.duplicateStatus || "unique"}
												{university.canonicalUniversityId ? ` · canonical ${university.canonicalUniversityId}` : ""}
											</div>
											<UniversityDuplicateActions university={university} candidates={group.items} />
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

function ProgramDuplicateActions({ program, candidates }: { program: ProgramWithQaData; candidates: ProgramWithQaData[] }) {
	const canonicalOptions = candidates.filter((candidate) => candidate.id !== program.id)

	return (
		<form action={updateProgramDuplicate} className="d-flex flex-wrap gap-2 align-items-center mt-2">
			<input type="hidden" name="id" value={program.id} />
			<select name="canonicalId" defaultValue={program.canonicalProgramId || canonicalOptions[0]?.id || ""} className="form-select form-select-sm" style={{ maxWidth: 320 }}>
				<option value="">Choose canonical program</option>
				{canonicalOptions.map((candidate) => (
					<option key={candidate.id} value={candidate.id}>
						#{candidate.id} {candidate.programName.slice(0, 70)}
					</option>
				))}
			</select>
			<input
				name="manualCanonicalId"
				type="number"
				min="1"
				placeholder="or program ID"
				className="form-control form-control-sm"
				style={{ maxWidth: 160 }}
			/>
			<button name="action" value="mark" className="btn btn-outline-secondary btn-sm" type="submit">Mark duplicate</button>
			<button name="action" value="hide" className="btn btn-outline-secondary btn-sm" type="submit">Hide duplicate</button>
			<button name="action" value="clear" className="btn btn-outline-secondary btn-sm" type="submit">Restore as unique</button>
		</form>
	)
}

function UniversityDuplicateActions({ university, candidates }: { university: UniversityWithQaData; candidates: UniversityWithQaData[] }) {
	const canonicalOptions = candidates.filter((candidate) => candidate.id !== university.id)
	if (!canonicalOptions.length) return null

	return (
		<form action={updateUniversityDuplicate} className="d-flex flex-wrap gap-2 align-items-center mt-2">
			<input type="hidden" name="id" value={university.id} />
			<select name="canonicalId" defaultValue={university.canonicalUniversityId || canonicalOptions[0]?.id} className="form-select form-select-sm" style={{ maxWidth: 320 }}>
				{canonicalOptions.map((candidate) => (
					<option key={candidate.id} value={candidate.id}>
						{candidate.name.slice(0, 70)}
					</option>
				))}
			</select>
			<button name="action" value="mark" className="btn btn-outline-secondary btn-sm" type="submit">Mark duplicate</button>
			<button name="action" value="hide" className="btn btn-outline-secondary btn-sm" type="submit">Hide from indexes</button>
			<button name="action" value="clear" className="btn btn-outline-secondary btn-sm" type="submit">Clear</button>
		</form>
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

function localizedNameKeys(program: ProgramWithQaData) {
	const names = [
		program.programName,
		...program.translations.map((translation) => translation.localizedProgramName),
	]
	return Array.from(new Set(names
		.map((name) => normalizeProgramTitleForDuplicate(name))
		.filter(Boolean)
		.map((name) => `${program.universityId}|${normalizeName(program.degreeLevel || "")}|${name}`)))
}

function localizedExactNameKeys(program: ProgramWithQaData) {
	return Array.from(new Set(program.translations
		.map((translation) => `${translation.locale}|${normalizeProgramTitleForDuplicate(translation.localizedProgramName)}`)
		.filter((key) => !key.endsWith("|"))
		.map((key) => `${program.universityId}|${key}`)))
}

function uniquePrograms(programs: ProgramWithQaData[]) {
	const byId = new Map<number, ProgramWithQaData>()
	programs.forEach((program) => byId.set(program.id, program))
	return Array.from(byId.values())
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

function normalizeProgramUrlAcrossLanguageVariants(value: string) {
	try {
		const parsed = new URL(value)
		const host = parsed.hostname.toLowerCase().replace(/^www\./, "")
		const path = normalizeLanguageVariantPath(parsed.pathname)
		return `${host}${path}`
	} catch {
		return normalizeLanguageVariantPath(normalizeUrl(value))
	}
}

function normalizeSourcePath(value: string) {
	try {
		const parsed = new URL(value)
		return normalizeLanguageVariantPath(parsed.pathname)
	} catch {
		return normalizeLanguageVariantPath(normalizeUrl(value))
	}
}

function normalizeLanguageVariantPath(value: string) {
	return `/${value}`
		.toLowerCase()
		.replace(/\/+/g, "/")
		.replace(/\/(en|de|es|pt|pt-br|fr|it)(?=\/|$)/g, "")
		.replace(/\/(english|deutsch|german|spanish|espanol|portuguese|portugues)(?=\/|$)/g, "")
		.replace(/\/index\.(html?|php)$/g, "")
		.replace(/[?#].*$/g, "")
		.replace(/\/+$/g, "")
		.replace(/^\/?/, "/")
}

function normalizeProgramTitleForDuplicate(value: string | null | undefined) {
	return normalizeName(value || "")
		.replace(/\b(bachelor|master|doctorate|phd|b a|b sc|m a|m sc|msc|ma|ba|bsc|licenciatura|maestria|mestrado|bacharelado|doutorado|degree|program|programme|studiengang|studium)\b/g, " ")
		.replace(/\b(in|im|em|en|of|de|der|die|das|und|and|y|e)\b/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}

function similarTitleKey(value: string | null | undefined) {
	const normalized = normalizeProgramTitleForDuplicate(value)
	const tokens = normalized
		.split(/\s+/)
		.filter((token) => token.length > 2)
		.filter((token) => !titleStopWords.has(token))
	if (tokens.length < 2) {
		return ""
	}
	return Array.from(new Set(tokens)).sort().slice(0, 8).join(" ")
}

const titleStopWords = new Set([
	"and",
	"und",
	"der",
	"die",
	"das",
	"for",
	"with",
	"auf",
	"zum",
	"zur",
	"fur",
	"from",
	"the",
])

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
