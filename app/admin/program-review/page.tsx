import Layout from "@/components/layout/Layout"
import { prisma } from "@/lib/prisma"
import { publicProgramWhere } from "@/lib/study-programs"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export const dynamic = "force-dynamic"

type SearchParams = {
	status?: string
	contentType?: string
	sitemap?: string
}

const contentTypeOptions = [
	"degree_program",
	"bridge_program",
	"preparatory_program",
	"certificate_program",
	"module_or_project",
	"uncertain",
]

async function reviewProgram(formData: FormData) {
	"use server"

	const id = Number(formData.get("id"))
	const action = String(formData.get("action") || "")
	if (!Number.isFinite(id) || id <= 0) return

	const data = action === "valid"
		? {
			reviewStatus: "reviewed",
			isPublished: true,
			isLikelyDegreeProgram: true,
			contentType: "degree_program",
			isSitemapIncluded: true,
			publicCatalogPriority: 10,
			qualityFlags: null,
		}
		: action === "hide"
			? {
				reviewStatus: "hidden",
				isPublished: false,
				isLikelyDegreeProgram: false,
				contentType: "module_or_project",
				isSitemapIncluded: false,
			}
			: action === "noindex"
				? {
					reviewStatus: "noindex",
					isPublished: true,
					isSitemapIncluded: false,
				}
				: action === "exclude-sitemap"
					? {
						isSitemapIncluded: false,
						reviewNotes: "Manually excluded from sitemap.",
					}
					: action === "canonical-degree"
						? {
							reviewStatus: "reviewed",
							isPublished: true,
							isLikelyDegreeProgram: true,
							contentType: "degree_program",
							isSitemapIncluded: true,
							publicCatalogPriority: 10,
							qualityFlags: null,
							reviewNotes: "Manually marked as canonical degree program.",
						}
						: null

	if (!data) return

	await prisma.degreeProgram.update({
		where: { id },
		data,
	})

	revalidatePath("/admin/program-review")
	revalidatePath("/courses")
	revalidatePath("/pt-br/cursos")
	revalidatePath("/es/programas")
	revalidatePath("/sitemap.xml")
}

export default async function ProgramReviewPage({ searchParams }: { searchParams?: SearchParams }) {
	const status = searchParams?.status || "needs-review"
	const contentType = contentTypeOptions.includes(searchParams?.contentType || "") ? searchParams?.contentType : ""
	const sitemap = ["included", "excluded", "default"].includes(searchParams?.sitemap || "") ? searchParams?.sitemap : ""
	const statusWhere = status === "all"
		? {}
		: status === "hidden"
			? { reviewStatus: "hidden" }
			: status === "noindex"
				? { reviewStatus: "noindex" }
				: {
					reviewStatus: "pending",
					OR: [
						{ isLikelyDegreeProgram: false },
						{ isPublished: false },
						{ qualityFlags: { not: null } },
					],
				}
	const where = {
		...statusWhere,
		...(contentType ? { contentType } : {}),
		...(sitemap === "included" ? { isSitemapIncluded: true } : {}),
		...(sitemap === "excluded" ? { isSitemapIncluded: false } : {}),
		...(sitemap === "default" ? { isSitemapIncluded: null } : {}),
	}

	const [programs, publishedValidPrograms, hiddenSuspiciousRows, pendingReviewRows] = await Promise.all([
		prisma.degreeProgram.findMany({
			where,
			include: { university: true },
			orderBy: [{ reviewStatus: "asc" }, { id: "asc" }],
			take: 250,
		}),
		prisma.degreeProgram.count({
			where: publicProgramWhere,
		}),
		prisma.degreeProgram.count({
			where: {
				OR: [
					{ isPublished: false },
					{ isLikelyDegreeProgram: false },
				],
			},
		}),
		prisma.degreeProgram.count({
			where: {
				reviewStatus: "pending",
				OR: [
					{ isLikelyDegreeProgram: false },
					{ isPublished: false },
					{ qualityFlags: { not: null } },
				],
			},
		}),
	])

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<AdminHeader title="Program review" />

					<div className="row g-4 mb-5">
						<MetricCard label="Published valid programs" value={publishedValidPrograms} />
						<MetricCard label="Hidden / suspicious rows" value={hiddenSuspiciousRows} />
						<MetricCard label="Pending review rows" value={pendingReviewRows} />
					</div>

					<div className="admin-panel bg-white rounded-3 p-5">
						<div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-5">
							<div>
								<div className="section-heading mb-0">
									<p>Quality gate</p>
									<h2>Review scraped rows before indexing</h2>
								</div>
								<p className="mb-0">Flagged rows are not deleted. Mark valid, hide from catalog, or keep public but noindex.</p>
							</div>
							<div className="d-flex flex-wrap gap-2">
								<Link href="/admin/program-review" className="btn btn-outline-secondary">Needs review</Link>
								<Link href="/admin/program-review?status=noindex" className="btn btn-outline-secondary">Noindex</Link>
								<Link href="/admin/program-review?status=hidden" className="btn btn-outline-secondary">Hidden</Link>
								<Link href="/admin/program-review?status=all" className="btn btn-outline-secondary">All</Link>
							</div>
						</div>
						<form className="row g-3 align-items-end mb-5" method="get" action="/admin/program-review">
							<input type="hidden" name="status" value={status} />
							<label className="col-md-4 col-lg-3">
								<span className="fs-7 text-uppercase text-primary fw-bold">Content type</span>
								<select name="contentType" defaultValue={contentType} className="form-select mt-1">
									<option value="">All content types</option>
									{contentTypeOptions.map((option) => <option value={option} key={option}>{option}</option>)}
								</select>
							</label>
							<label className="col-md-4 col-lg-3">
								<span className="fs-7 text-uppercase text-primary fw-bold">Sitemap inclusion</span>
								<select name="sitemap" defaultValue={sitemap} className="form-select mt-1">
									<option value="">All sitemap states</option>
									<option value="default">Default rules</option>
									<option value="included">Manual include</option>
									<option value="excluded">Manual exclude</option>
								</select>
							</label>
							<div className="col-md-4 col-lg-3">
								<button className="btn btn-primary" type="submit">Apply filters</button>
							</div>
						</form>

						<div className="table-responsive">
							<table className="table align-middle">
								<thead>
									<tr>
										<th>Program</th>
										<th>University</th>
										<th>Degree</th>
										<th>Summary</th>
										<th>Flags</th>
										<th>Index controls</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{programs.map((program) => (
										<tr key={program.id}>
											<td style={{ minWidth: 260 }}>
												<strong>{program.programName}</strong>
												<div className="fs-8 text-uppercase">ID {program.id} · {program.reviewStatus}</div>
												<a href={program.programUrl} target="_blank" className="fs-8">Program URL</a>
											</td>
											<td>{program.university.name}</td>
											<td>
												<div>{program.degreeLevel || "-"}</div>
												<div className="fs-8">{program.academicDegree || "No academic degree"}</div>
											</td>
											<td style={{ minWidth: 280 }}>{preview(program.summary || "")}</td>
											<td style={{ minWidth: 220 }}>{program.qualityFlags || "-"}</td>
											<td style={{ minWidth: 220 }}>
												<div>{program.contentType}</div>
												<div className="fs-8">Sitemap: {sitemapLabel(program.isSitemapIncluded)}</div>
												<div className="fs-8">Priority: {program.publicCatalogPriority}</div>
												{program.reviewNotes && <div className="fs-8">{program.reviewNotes}</div>}
											</td>
											<td>
												<div className="d-grid gap-2">
													<ActionButton id={program.id} action="valid" label="Mark as valid degree program" />
													<ActionButton id={program.id} action="canonical-degree" label="Canonical degree + sitemap" />
													<ActionButton id={program.id} action="exclude-sitemap" label="Exclude from sitemap" />
													<ActionButton id={program.id} action="hide" label="Hide from public catalog" />
													<ActionButton id={program.id} action="noindex" label="Noindex only" />
													<Link href={`/admin?university=${program.universityId}&program=${program.id}`} className="btn btn-outline-secondary btn-sm">Edit row</Link>
												</div>
											</td>
										</tr>
									))}
									{programs.length === 0 && (
										<tr>
											<td colSpan={7} className="text-center py-5">No rows in this review bucket.</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
						{programs.length === 250 && <p className="fs-7 mb-0">Showing first 250 rows.</p>}
					</div>
				</div>
			</section>
		</Layout>
	)
}

function MetricCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="col-md-4">
			<div className="admin-panel bg-white rounded-3 p-5 h-100">
				<span className="fs-7 text-uppercase text-primary fw-bold">{label}</span>
				<h2 className="ds-4 text-primary mb-0">{value}</h2>
			</div>
		</div>
	)
}

function ActionButton({ id, action, label }: { id: number; action: string; label: string }) {
	return (
		<form action={reviewProgram}>
			<input type="hidden" name="id" value={id} />
			<input type="hidden" name="action" value={action} />
			<button className="btn btn-primary btn-sm w-100" type="submit">{label}</button>
		</form>
	)
}

function AdminHeader({ title }: { title: string }) {
	return (
		<div className="d-flex flex-wrap align-items-end justify-content-between gap-4 mb-6">
			<div>
				<span className="content-top btn-text fw-bold text-primary">
					<i className="ri-shield-check-line text-green-3" />
					&nbsp; Mini admin
				</span>
				<h1 className="ds-3 text-primary mb-0">{title}</h1>
			</div>
			<div className="d-flex flex-wrap gap-2">
				<Link href="/admin" className="btn btn-outline-secondary">Program admin</Link>
				<Link href="/admin/data-quality" className="btn btn-outline-secondary">Data quality</Link>
				<Link href="/admin/inquiries" className="btn btn-outline-secondary">Inquiries</Link>
				<Link href="/admin/blog" className="btn btn-outline-secondary">Blog posts</Link>
				<Link href="/courses" className="btn btn-primary">View programs</Link>
			</div>
		</div>
	)
}

function preview(value: string) {
	return value.length > 220 ? `${value.slice(0, 220)}...` : value || "-"
}

function sitemapLabel(value: boolean | null) {
	if (value === true) return "manual include"
	if (value === false) return "manual exclude"
	return "default"
}
