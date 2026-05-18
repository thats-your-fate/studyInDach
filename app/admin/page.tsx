import Layout from "@/components/layout/Layout"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function updateUniversity(formData: FormData) {
	"use server"

	const id = String(formData.get("id") || "")
	if (!id) return

	await prisma.university.update({
		where: { id },
		data: {
			name: field(formData, "name"),
			location: nullableField(formData, "location"),
			state: nullableField(formData, "state"),
			websiteUrl: nullableField(formData, "websiteUrl"),
		},
	})
	revalidateAdmin()
}

async function updateProgram(formData: FormData) {
	"use server"

	const id = Number(formData.get("id"))
	if (!Number.isFinite(id)) return

	await prisma.degreeProgram.update({
		where: { id },
		data: {
			programName: field(formData, "programName"),
			programUrl: field(formData, "programUrl"),
			degreeLevel: nullableField(formData, "degreeLevel"),
			academicDegree: nullableField(formData, "academicDegree"),
			subjectArea: nullableField(formData, "subjectArea"),
			languageOfInstruction: nullableField(formData, "languageOfInstruction"),
			campusLocation: nullableField(formData, "campusLocation"),
			duration: nullableField(formData, "duration"),
			ects: nullableField(formData, "ects"),
			startTerms: nullableField(formData, "startTerms"),
			applicationDeadlines: nullableField(formData, "applicationDeadlines"),
			admissionRequirements: nullableField(formData, "admissionRequirements"),
			tuitionOrFees: nullableField(formData, "tuitionOrFees"),
			studyMode: nullableField(formData, "studyMode"),
			restrictedAdmission: nullableField(formData, "restrictedAdmission"),
			applicationUrl: nullableField(formData, "applicationUrl"),
			contactEmail: nullableField(formData, "contactEmail"),
			summary: nullableField(formData, "summary"),
			heroImageUrl: nullableField(formData, "heroImageUrl"),
		},
	})
	revalidateAdmin()
}

function revalidateAdmin() {
	revalidatePath("/admin")
	revalidatePath("/courses")
	revalidatePath("/single-courses")
}

function field(formData: FormData, name: string) {
	return String(formData.get(name) || "").trim()
}

function nullableField(formData: FormData, name: string) {
	return field(formData, name) || null
}

export default async function AdminPage({
	searchParams,
}: {
	searchParams?: { university?: string; program?: string }
}) {
	const universities = await prisma.university.findMany({
		include: {
			programs: {
				orderBy: { programName: "asc" },
			},
		},
		orderBy: { name: "asc" },
	})
	const selectedUniversity = universities.find((university) => university.id === searchParams?.university) || null
	const selectedProgramId = Number(searchParams?.program)
	const selectedProgram = selectedUniversity?.programs.find((program) => program.id === selectedProgramId) || null

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="d-flex flex-wrap align-items-end justify-content-between gap-4 mb-6">
						<div>
							<span className="content-top btn-text fw-bold text-primary">
								<i className="ri-database-2-line text-green-3" />
								&nbsp; Mini admin
							</span>
							<h1 className="ds-3 text-primary mb-0">Study program data</h1>
						</div>
						<div className="d-flex flex-wrap gap-2">
							<Link href="/admin/inquiries" className="btn btn-outline-secondary">Inquiries</Link>
							<Link href="/courses" className="btn btn-primary">View programs</Link>
						</div>
					</div>

					{!selectedUniversity ? (
						<div className="row g-4">
							{universities.map((university) => (
								<div className="col-12 col-md-6 col-lg-4" key={university.id}>
									<Link href={`/admin?university=${university.id}`} className="card-news d-block bg-white rounded-3 p-5 h-100 hover-up">
										<div className="d-flex align-items-start gap-3">
											<span className="icon-shape icon-60 rounded-circle bg-secondary-2 text-primary d-inline-flex align-items-center justify-content-center">
												<i className="ri-building-4-line fs-4" />
											</span>
											<div>
												<h5 className="mb-2 text-primary">{university.name}</h5>
												<p className="fs-7 mb-0 text-uppercase">
													{[university.location, university.state].filter(Boolean).join(", ")}
												</p>
											</div>
										</div>
										<div className="d-flex align-items-center justify-content-between border-top mt-5 pt-4">
											<p className="fs-7 mb-0 text-uppercase fw-bold text-primary">
												{university.programs.length} Studiengänge
											</p>
											<span className="btn btn-white bg-green-3 text-primary hover-up">Edit</span>
										</div>
									</Link>
								</div>
							))}
						</div>
					) : (
						<div className="bg-white rounded-3 p-5 mb-5">
							<div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
								<h5 className="mb-0">University</h5>
								<Link href="/admin" className="btn btn-md btn-filter active">
									<i className="ri-arrow-left-line me-1" />
									All universities
								</Link>
							</div>
							<form action={updateUniversity} className="row g-3 border-bottom pb-5 mb-5">
								<input type="hidden" name="id" value={selectedUniversity.id} />
								<TextInput label="Name" name="name" value={selectedUniversity.name} className="col-lg-4" />
								<TextInput label="Location" name="location" value={selectedUniversity.location} className="col-lg-3" />
								<TextInput label="State" name="state" value={selectedUniversity.state} className="col-lg-2" />
								<TextInput label="Website URL" name="websiteUrl" value={selectedUniversity.websiteUrl} className="col-lg-3" />
								<div className="col-12">
									<button className="btn btn-primary" type="submit">Save university</button>
								</div>
							</form>

							<div className="d-flex align-items-center justify-content-between mb-4">
								<h5 className="mb-0">Studiengänge</h5>
								<p className="mb-0 fs-7 text-uppercase">{selectedUniversity.programs.length} entries</p>
							</div>

							{selectedProgram ? (
								<>
									<div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
										<h5 className="mb-0">Edit Studiengang</h5>
										<Link href={`/admin?university=${selectedUniversity.id}`} className="btn btn-md btn-filter active">
											<i className="ri-arrow-left-line me-1" />
											All Studiengänge
										</Link>
									</div>
									<ProgramForm program={selectedProgram} />
								</>
							) : (
								<div className="row g-3">
									{selectedUniversity.programs.map((program) => (
										<div className="col-12" key={program.id}>
											<Link href={`/admin?university=${selectedUniversity.id}&program=${program.id}`} className="card-news d-block bg-secondary-2 rounded-3 p-4 hover-up">
												<div className="d-flex flex-wrap align-items-center justify-content-between gap-4">
													<div className="flex-grow-1">
														<div className="d-flex flex-wrap align-items-center gap-2 mb-2">
															<span className="text-uppercase text-dark bg-green-3 rounded-2 px-2 py-1 fs-8 fw-bold">
																{program.degreeLevel || "Program"}
															</span>
															{program.academicDegree && (
																<span className="fs-7 text-uppercase text-primary fw-bold">{program.academicDegree}</span>
															)}
														</div>
														<h6 className="mb-2 text-primary">{program.programName}</h6>
														<p className="fs-7 text-uppercase mb-0">
															{[
																program.subjectArea,
																program.duration,
																program.ects,
																program.languageOfInstruction,
															]
																.filter(Boolean)
																.join(" · ")}
														</p>
													</div>
													<span className="btn btn-white bg-green-3 text-primary hover-up">Edit</span>
												</div>
											</Link>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</section>
		</Layout>
	)
}

function ProgramForm({ program }: { program: any }) {
	return (
		<form action={updateProgram} className="row g-3 border rounded-3 p-4 mb-4">
			<input type="hidden" name="id" value={program.id} />
			<div className="col-12 d-flex flex-wrap justify-content-between gap-3">
				<h6 className="mb-0">{program.programName}</h6>
				<Link href={`/single-courses?id=${program.id}`} className="btn-text text-primary">Preview</Link>
			</div>
			<TextInput label="Program Name" name="programName" value={program.programName} className="col-lg-6" />
			<TextInput label="Program URL" name="programUrl" value={program.programUrl} className="col-lg-6" />
			<TextInput label="Degree Level" name="degreeLevel" value={program.degreeLevel} className="col-lg-3" />
			<TextInput label="Academic Degree" name="academicDegree" value={program.academicDegree} className="col-lg-3" />
			<TextInput label="Subject Area" name="subjectArea" value={program.subjectArea} className="col-lg-6" />
			<TextInput label="Language" name="languageOfInstruction" value={program.languageOfInstruction} className="col-lg-3" />
			<TextInput label="Campus" name="campusLocation" value={program.campusLocation} className="col-lg-3" />
			<TextInput label="Duration" name="duration" value={program.duration} className="col-lg-2" />
			<TextInput label="ECTS" name="ects" value={program.ects} className="col-lg-2" />
			<TextInput label="Start Terms" name="startTerms" value={program.startTerms} className="col-lg-2" />
			<TextInput label="Deadlines" name="applicationDeadlines" value={program.applicationDeadlines} className="col-lg-6" />
			<TextInput label="Study Mode" name="studyMode" value={program.studyMode} className="col-lg-3" />
			<TextInput label="Restricted Admission" name="restrictedAdmission" value={program.restrictedAdmission} className="col-lg-3" />
			<TextInput label="Application URL" name="applicationUrl" value={program.applicationUrl} className="col-lg-6" />
			<TextInput label="Contact Email" name="contactEmail" value={program.contactEmail} className="col-lg-3" />
			<TextInput label="Hero Image URL" name="heroImageUrl" value={program.heroImageUrl} className="col-lg-9" />
			<TextArea label="Admission Requirements" name="admissionRequirements" value={program.admissionRequirements} className="col-lg-6" />
			<TextArea label="Tuition or Fees" name="tuitionOrFees" value={program.tuitionOrFees} className="col-lg-6" />
			<TextArea label="Summary" name="summary" value={program.summary} className="col-12" />
			<div className="col-12">
				<button className="btn btn-primary" type="submit">Save Studiengang</button>
			</div>
		</form>
	)
}

function TextInput({
	label,
	name,
	value,
	className,
}: {
	label: string
	name: string
	value?: string | null
	className?: string
}) {
	return (
		<label className={className}>
			<span className="fs-7 text-uppercase text-primary fw-bold">{label}</span>
			<input className="form-control mt-1" name={name} defaultValue={value || ""} />
		</label>
	)
}

function TextArea({
	label,
	name,
	value,
	className,
}: {
	label: string
	name: string
	value?: string | null
	className?: string
}) {
	return (
		<label className={className}>
			<span className="fs-7 text-uppercase text-primary fw-bold">{label}</span>
			<textarea className="form-control mt-1" name={name} defaultValue={value || ""} rows={4} />
		</label>
	)
}
