import Layout from "@/components/layout/Layout"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-dynamic"

async function updateInquiry(formData: FormData) {
	"use server"

	const id = Number(formData.get("id"))
	if (!Number.isFinite(id) || id <= 0) {
		return
	}

	await prisma.inquiry.update({
		where: { id },
		data: {
			status: cleanStatus(String(formData.get("status") || "new")),
			adminNotes: limit(String(formData.get("adminNotes") || "").trim(), 3000) || null,
		},
	})

	revalidatePath("/admin/inquiries")
	revalidatePath(`/admin/inquiries/${id}`)
	redirect(`/admin/inquiries/${id}`)
}

export default async function AdminInquiryDetailPage({
	params,
}: {
	params: { id: string }
}) {
	const id = Number(params.id)
	const inquiry = Number.isFinite(id)
		? await prisma.inquiry.findUnique({ where: { id } })
		: null

	if (!inquiry) {
		notFound()
	}

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="d-flex flex-wrap align-items-end justify-content-between gap-4 mb-6">
						<div>
							<span className="content-top btn-text fw-bold text-primary">
								<i className="ri-inbox-line text-green-3" />
								&nbsp; Inquiry #{inquiry.id}
							</span>
							<h1 className="ds-3 text-primary mb-0">{inquiry.name || inquiry.email}</h1>
						</div>
						<Link href="/admin/inquiries" className="btn btn-primary">
							<i className="ri-arrow-left-line me-1" />
							All inquiries
						</Link>
					</div>

					<div className="row g-4">
						<div className="col-lg-8">
							<div className="admin-panel bg-white rounded-3 p-5">
								<div className="section-heading">
									<p>Message</p>
									<h2>Inquiry details</h2>
								</div>
								<DetailGrid
									items={[
										["Status", inquiry.status],
										["Locale", inquiry.locale || "-"],
										["Name", inquiry.name || "-"],
										["Email", inquiry.email],
										["Country of residence", inquiry.countryOfResidence || "-"],
										["Preferred study country", inquiry.preferredStudyCountry || "-"],
										["Source path", inquiry.sourcePath || "-"],
										["Landing path", inquiry.landingPath || "-"],
										["Referrer", inquiry.referrer || "-"],
										["UTM source", inquiry.utmSource || "-"],
										["UTM medium", inquiry.utmMedium || "-"],
										["UTM campaign", inquiry.utmCampaign || "-"],
										["Created", formatDate(inquiry.createdAt)],
										["Updated", formatDate(inquiry.updatedAt)],
									]}
								/>
								<div className="admin-message-box mt-5">
									<span>Full message</span>
									<p>{inquiry.message}</p>
								</div>
							</div>
						</div>

						<div className="col-lg-4">
							<div className="admin-panel bg-white rounded-3 p-5 mb-4">
								<h5 className="text-primary mb-4">Selected program</h5>
								<p className="fw-bold mb-2">{inquiry.programNameSnapshot || "General inquiry"}</p>
								<p className="mb-2">{inquiry.universityNameSnapshot || ""}</p>
								{inquiry.programUrlSnapshot && <a href={inquiry.programUrlSnapshot} target="_blank">Official program URL</a>}
								<dl className="admin-mini-data mt-4">
									<div>
										<dt>Program ID</dt>
										<dd>{inquiry.programId || "-"}</dd>
									</div>
									<div>
										<dt>Source path</dt>
										<dd>{inquiry.sourcePath || "-"}</dd>
									</div>
									<div>
										<dt>Landing path</dt>
										<dd>{inquiry.landingPath || "-"}</dd>
									</div>
									<div>
										<dt>UTM</dt>
										<dd>{[inquiry.utmSource, inquiry.utmMedium, inquiry.utmCampaign].filter(Boolean).join(" / ") || "-"}</dd>
									</div>
									<div>
										<dt>Locale</dt>
										<dd>{inquiry.locale || "-"}</dd>
									</div>
								</dl>
							</div>

							<form action={updateInquiry} className="admin-panel bg-white rounded-3 p-5">
								<input type="hidden" name="id" value={inquiry.id} />
								<label className="d-block mb-4">
									<span className="fs-7 text-uppercase text-primary fw-bold">Status</span>
									<select className="form-control mt-1" name="status" defaultValue={inquiry.status}>
										{["new", "contacted", "closed", "spam"].map((status) => (
											<option key={status} value={status}>{status}</option>
										))}
									</select>
								</label>
								<label className="d-block mb-4">
									<span className="fs-7 text-uppercase text-primary fw-bold">Admin notes</span>
									<textarea className="form-control mt-1" name="adminNotes" rows={8} maxLength={3000} defaultValue={inquiry.adminNotes || ""} />
								</label>
								<button className="btn btn-primary" type="submit">Save inquiry</button>
							</form>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}

function DetailGrid({ items }: { items: Array<[string, string]> }) {
	return (
		<div className="admin-detail-grid">
			{items.map(([label, value]) => (
				<div key={label}>
					<span>{label}</span>
					<strong>{value}</strong>
				</div>
			))}
		</div>
	)
}

function cleanStatus(value: string) {
	return ["new", "contacted", "closed", "spam"].includes(value) ? value : "new"
}

function limit(value: string, max: number) {
	return value.slice(0, max)
}

function formatDate(value: Date) {
	return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value)
}
