import Layout from "@/components/layout/Layout"
import Section1 from "@/components/sections/contact/Section1"
import Section2, { type ContactProgram } from "@/components/sections/contact/Section2"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type ContactSearchParams = {
	programId?: string
	sent?: string
	error?: string
}

async function submitInquiry(formData: FormData) {
	"use server"

	const programId = toNumber(formData.get("programId"))
	const sourcePath = limit(field(formData, "sourcePath"), 500)
	const locale = limit(field(formData, "locale"), 20) || "en"
	const returnPath = contactReturnPath(programId)

	if (field(formData, "website") || field(formData, "companyUrl")) {
		redirect(contactStatePath(programId, "sent", "1"))
	}

	if (field(formData, "consent") !== "on") {
		redirect(contactStatePath(programId, "error", "consent"))
	}

	const name = optionalLimit(formData, "name", 120)
	const email = limit(field(formData, "email"), 180)
	const countryOfResidence = optionalLimit(formData, "countryOfResidence", 120)
	const preferredStudyCountry = optionalLimit(formData, "preferredStudyCountry", 120)
	const message = limit(field(formData, "message"), 3000)

	if (!looksLikeEmail(email)) {
		redirect(contactStatePath(programId, "error", "email"))
	}
	if (!message) {
		redirect(contactStatePath(programId, "error", "message"))
	}

	const program = programId
		? await prisma.degreeProgram.findUnique({
			where: { id: programId },
			include: { university: true },
		})
		: null

	await prisma.inquiry.create({
		data: {
			name,
			email,
			countryOfResidence,
			preferredStudyCountry,
			message,
			programId: program?.id || programId || null,
			programNameSnapshot: program?.programName || null,
			universityNameSnapshot: program?.university.name || null,
			programUrlSnapshot: program?.programUrl || null,
			locale,
			sourcePath: sourcePath || returnPath,
		},
	})

	redirect(contactStatePath(programId, "sent", "1"))
}

export default async function Contact({
	searchParams,
}: {
	searchParams?: ContactSearchParams
}) {
	const programId = toNumber(searchParams?.programId)
	const program = programId
		? await prisma.degreeProgram.findUnique({
			where: { id: programId },
			include: { university: true },
		})
		: null

	const selectedProgram: ContactProgram | null = program
		? {
			id: program.id,
			name: program.programName,
			universityName: program.university.name,
			location: [program.university.location, program.university.state].filter(Boolean).join(", "),
		}
		: null

	return (
		<Layout>
			{!programId && <Section1 />}
			<Section2
				action={submitInquiry}
				selectedProgram={selectedProgram}
				sent={searchParams?.sent === "1"}
				error={searchParams?.error || ""}
				programContactMode={Boolean(programId)}
			/>
		</Layout>
	)
}

function field(formData: FormData, name: string) {
	return String(formData.get(name) || "").trim()
}

function limit(value: string, max: number) {
	return value.slice(0, max)
}

function optionalLimit(formData: FormData, name: string, max: number) {
	return limit(field(formData, name), max) || null
}

function toNumber(value: FormDataEntryValue | string | undefined | null) {
	const parsed = Number(value)
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function looksLikeEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function contactReturnPath(programId: number | null) {
	return programId ? `/contact?programId=${programId}` : "/contact"
}

function contactStatePath(programId: number | null, key: "sent" | "error", value: string) {
	const params = new URLSearchParams()
	if (programId) {
		params.set("programId", String(programId))
	}
	params.set(key, value)
	return `/contact?${params.toString()}`
}
