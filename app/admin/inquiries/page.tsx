import Layout from "@/components/layout/Layout"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

type InquirySearchParams = {
	status?: string
	q?: string
}

export default async function AdminInquiriesPage({
	searchParams,
}: {
	searchParams?: InquirySearchParams
}) {
	const status = (searchParams?.status || "").trim()
	const query = (searchParams?.q || "").trim().toLowerCase()
	const inquiries = await prisma.inquiry.findMany({
		where: status ? { status } : undefined,
		orderBy: { createdAt: "desc" },
		take: 300,
	})
	const filtered = query
		? inquiries.filter((inquiry) => [
			inquiry.name,
			inquiry.email,
			inquiry.programNameSnapshot,
			inquiry.universityNameSnapshot,
			inquiry.message,
		].join(" ").toLowerCase().includes(query))
		: inquiries

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<AdminHeader title="Inquiries" />

					<div className="admin-panel bg-white rounded-3 p-5">
						<form className="row g-3 align-items-end mb-5">
							<label className="col-md-3">
								<span className="fs-7 text-uppercase text-primary fw-bold">Status</span>
								<select className="form-control mt-1" name="status" defaultValue={status}>
									<option value="">All statuses</option>
									{["new", "contacted", "closed", "spam"].map((option) => (
										<option key={option} value={option}>{option}</option>
									))}
								</select>
							</label>
							<label className="col-md-6">
								<span className="fs-7 text-uppercase text-primary fw-bold">Search</span>
								<input className="form-control mt-1" name="q" defaultValue={searchParams?.q || ""} placeholder="Email, name, program, or message" />
							</label>
							<div className="col-md-3 d-flex gap-2">
								<button className="btn btn-primary" type="submit">Filter</button>
								<Link href="/admin/inquiries" className="btn btn-outline-secondary">Reset</Link>
							</div>
						</form>

						<div className="admin-inquiry-list">
							{filtered.length === 0 ? (
								<div className="empty-results">
									<h5>No inquiries found</h5>
									<p>Try a different status or search term.</p>
								</div>
							) : (
								filtered.map((inquiry) => (
									<Link href={`/admin/inquiries/${inquiry.id}`} className="admin-inquiry-row" key={inquiry.id}>
										<div>
											<span>{formatDate(inquiry.createdAt)}</span>
											<strong>{inquiry.name || "No name"} · {inquiry.email}</strong>
											<p>{inquiry.programNameSnapshot || "General inquiry"}{inquiry.universityNameSnapshot ? ` · ${inquiry.universityNameSnapshot}` : ""}</p>
										</div>
										<div>
											<span className={`inquiry-status status-${inquiry.status}`}>{inquiry.status}</span>
											<p>{inquiry.preferredStudyCountry || "No country preference"}</p>
										</div>
										<p>{preview(inquiry.message)}</p>
										<span className="btn-text text-primary">View details</span>
									</Link>
								))
							)}
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
					<i className="ri-inbox-line text-green-3" />
					&nbsp; Mini admin
				</span>
				<h1 className="ds-3 text-primary mb-0">{title}</h1>
			</div>
			<div className="d-flex flex-wrap gap-2">
				<Link href="/admin" className="btn btn-outline-secondary">Program admin</Link>
				<Link href="/courses" className="btn btn-primary">View programs</Link>
			</div>
		</div>
	)
}

function formatDate(value: Date) {
	return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value)
}

function preview(value: string) {
	return value.length > 150 ? `${value.slice(0, 150)}...` : value
}
