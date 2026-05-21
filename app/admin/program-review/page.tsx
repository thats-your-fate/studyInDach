import Layout from "@/components/layout/Layout"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export const dynamic = "force-dynamic"

type SearchParams = {
	status?: string
}

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
			qualityFlags: null,
		}
		: action === "hide"
			? {
				reviewStatus: "hidden",
				isPublished: false,
				isLikelyDegreeProgram: false,
			}
			: action === "noindex"
				? {
					reviewStatus: "noindex",
					isPublished: true,
					isLikelyDegreeProgram: false,
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
}

export default async function ProgramReviewPage({ searchParams }: { searchParams?: SearchParams }) {
	const status = searchParams?.status || "needs-review"
	const where = status === "all"
		? {}
		: status === "hidden"
			? { reviewStatus: "hidden" }
			: status === "noindex"
				? { reviewStatus: "noindex" }
				: {
					OR: [
						{ isLikelyDegreeProgram: false },
						{ isPublished: false },
						{ qualityFlags: { not: null } },
					],
				}

	const [programs, publishedValidPrograms, hiddenSuspiciousRows, pendingReviewRows] = await Promise.all([
		prisma.degreeProgram.findMany({
			where,
			include: { university: true },
			orderBy: [{ reviewStatus: "asc" }, { id: "asc" }],
			take: 250,
		}),
		prisma.degreeProgram.count({
			where: { isPublished: true, isLikelyDegreeProgram: true, duplicateStatus: { not: "duplicate" }, canonicalProgramId: null },
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

						<div className="table-responsive">
							<table className="table align-middle">
								<thead>
									<tr>
										<th>Program</th>
										<th>University</th>
										<th>Degree</th>
										<th>Summary</th>
										<th>Flags</th>
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
											<td>
												<div className="d-grid gap-2">
													<ActionButton id={program.id} action="valid" label="Mark as valid degree program" />
													<ActionButton id={program.id} action="hide" label="Hide from public catalog" />
													<ActionButton id={program.id} action="noindex" label="Noindex only" />
													<Link href={`/admin?university=${program.universityId}&program=${program.id}`} className="btn btn-outline-secondary btn-sm">Edit row</Link>
												</div>
											</td>
										</tr>
									))}
									{programs.length === 0 && (
										<tr>
											<td colSpan={6} className="text-center py-5">No rows in this review bucket.</td>
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
				<Link href="/courses" className="btn btn-primary">View programs</Link>
			</div>
		</div>
	)
}

function preview(value: string) {
	return value.length > 220 ? `${value.slice(0, 220)}...` : value || "-"
}
