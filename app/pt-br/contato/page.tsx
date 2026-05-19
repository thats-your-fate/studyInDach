import Layout from "@/components/layout/Layout"
import Section2, { type ContactProgram } from "@/components/sections/contact/Section2"
import { inquiryAttributionFromForm } from "@/lib/inquiry-attribution"
import { optionLabel } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	title: "Orientação gratuita para estudos | Study in DACH",
	description: "Entre em contato com o Study in DACH para orientação gratuita sobre programas na Alemanha, Áustria e Suíça.",
	robots: {
		index: false,
		follow: true,
	},
	alternates: {
		canonical: absoluteUrl("/pt-br/contato"),
	},
}

type ContactSearchParams = {
	programId?: string
	sent?: string
	error?: string
}

async function submitInquiry(formData: FormData) {
	"use server"

	const programId = toNumber(formData.get("programId"))
	const locale = "pt-br"
	const attribution = inquiryAttributionFromForm(formData, contactReturnPath(programId), headers().get("referer"))

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
			include: {
				university: true,
				translations: { where: { locale: "pt" }, take: 1 },
			},
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
			programNameSnapshot: program ? cleanPtProgramTitle(program.translations[0]?.localizedProgramName || program.programName) : null,
			universityNameSnapshot: program?.university.name || null,
			programUrlSnapshot: program?.programUrl || null,
			locale,
			sourcePath: attribution.sourcePath,
			referrer: attribution.referrer,
			utmSource: attribution.utmSource,
			utmMedium: attribution.utmMedium,
			utmCampaign: attribution.utmCampaign,
			landingPath: attribution.landingPath,
		},
	})

	redirect(contactStatePath(programId, "sent", "1"))
}

export default async function ContactPt({
	searchParams,
}: {
	searchParams?: ContactSearchParams
}) {
	const programId = toNumber(searchParams?.programId)
	const program = programId
		? await prisma.degreeProgram.findUnique({
			where: { id: programId },
			include: {
				university: true,
				translations: { where: { locale: "pt" }, take: 1 },
			},
		})
		: null

	const selectedProgram: ContactProgram | null = program
		? {
			id: program.id,
			name: cleanPtProgramTitle(program.translations[0]?.localizedProgramName || program.programName),
			universityName: program.university.name,
			location: [program.university.location, optionLabel(program.university.state || "", "pt-br")].filter(Boolean).join(", "),
		}
		: null

	return (
		<Layout>
			<Section2
				action={submitInquiry}
				selectedProgram={selectedProgram}
				sent={searchParams?.sent === "1"}
				error={searchParams?.error || ""}
				programContactMode={Boolean(programId)}
				locale="pt-br"
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
	return programId ? `/pt-br/contato?programId=${programId}` : "/pt-br/contato"
}

function contactStatePath(programId: number | null, key: "sent" | "error", value: string) {
	const params = new URLSearchParams()
	if (programId) {
		params.set("programId", String(programId))
	}
	params.set(key, value)
	return `/pt-br/contato?${params.toString()}`
}

function cleanPtProgramTitle(value: string) {
	return value.replace(/^Mestre em\s+/i, "Mestrado em ")
}
