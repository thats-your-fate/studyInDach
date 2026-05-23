import Layout from "@/components/layout/Layout"
import CourseCard from "@/components/sections/courses/CourseCard"
import { blogIndexPath, blogPostPath, blogSchemaLanguage, formatBlogDate, paragraphsFromContent, publishedBlogWhere } from "@/lib/blog-posts"
import type { PublicLocale } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { absoluteUrl, organizationJsonLd } from "@/lib/seo"
import { getCoursesPageData, getProgramUrl, getUniversityUrl, publicProgramWhere, type CourseSearchParams } from "@/lib/study-programs"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

type BlogDetailPageProps = {
	slug: string
	locale: PublicLocale
	backLabel: string
}

export async function getPublishedBlogPost(slug: string, locale: PublicLocale) {
	return prisma.blogPostTranslation.findFirst({
		where: {
			slug,
			locale,
			post: publishedBlogWhere,
		},
		include: {
			post: {
				include: {
					translations: true,
					category: { include: { translations: { where: { locale }, take: 1 } } },
					tags: { include: { tag: { include: { translations: { where: { locale }, take: 1 } } } } },
					programLinks: {
						where: { program: publicProgramWhere },
						include: { program: { include: { university: true, translations: { where: { locale: locale === "pt-br" ? "pt" : locale }, take: 1 } } } },
						orderBy: { sortOrder: "asc" },
					},
					universityLinks: { include: { university: true }, orderBy: { sortOrder: "asc" } },
					filterBlocks: { where: { OR: [{ locale }, { locale: null }] }, orderBy: { sortOrder: "asc" } },
				},
			},
		},
	})
}

export default async function BlogDetailPage({ slug, locale, backLabel }: BlogDetailPageProps) {
	const translation = await getPublishedBlogPost(slug, locale)

	if (!translation) notFound()

	const post = translation.post
	const filterBlocks = await Promise.all(post.filterBlocks.map(async (block) => {
		const filters = parseFilterJson(block.filterJson)
		const data = await getCoursesPageData(filters, locale)
		return { block, programs: data.programs.slice(0, block.limit) }
	}))
	const pageUrl = absoluteUrl(blogPostPath(translation.slug, locale))
	const image = translation.ogImageUrl || post.coverImageUrl || undefined
	const blogPostingJsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: translation.ogTitle || translation.seoTitle || translation.title,
		description: translation.ogDescription || translation.seoDescription || translation.excerpt || undefined,
		image: image ? [image] : undefined,
		datePublished: post.publishedAt?.toISOString(),
		dateModified: translation.updatedAt.toISOString(),
		author: {
			"@type": "Organization",
			name: post.authorName || "Study in DACH",
		},
		publisher: organizationJsonLd(),
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": pageUrl,
		},
		inLanguage: blogSchemaLanguage(locale),
	}
	const breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Study in DACH", item: absoluteUrl("/") },
			{ "@type": "ListItem", position: 2, name: blogHubName(locale), item: absoluteUrl(blogIndexPath(locale)) },
			{ "@type": "ListItem", position: 3, name: translation.title, item: pageUrl },
		],
	}
	const relatedProgramsJsonLd = post.programLinks.length ? {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `Related programs for ${translation.title}`,
		itemListElement: post.programLinks.map((link, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(getProgramUrl(link.program, locale)),
			name: link.label || link.program.translations[0]?.localizedProgramName || link.program.programName,
		})),
	} : null

	return (
		<Layout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
			/>
			{relatedProgramsJsonLd && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedProgramsJsonLd) }}
				/>
			)}
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-article-line text-green-3" />
						&nbsp; {formatBlogDate(post.publishedAt)}
					</span>
					<h1 className="text-white ds-2 lh-sm mb-0 text-anime-style-2">{translation.title}</h1>
				</div>
			</section>

			<section className="py-120 bg-white">
				<div className="container">
					<div className="row justify-content-center">
						<article className="col-lg-9">
							{post.coverImageUrl && (
								<img src={post.coverImageUrl} alt={post.coverImageAlt || ""} className="w-100 rounded-3 mb-5" style={{ maxHeight: 520, objectFit: "cover" }} />
							)}
							{translation.excerpt && <p className="lead text-primary fw-bold mb-5">{translation.excerpt}</p>}
							<div className="blog-content">
								{translation.contentHtml ? (
									<div dangerouslySetInnerHTML={{ __html: translation.contentHtml }} />
								) : paragraphsFromContent(translation.contentMd).map((paragraph) => (
									<p key={paragraph}>{paragraph}</p>
								))}
							</div>

							{post.programLinks.length > 0 && (
								<RelatedPanel title="Related programs">
									{post.programLinks.map((link) => (
										<Link key={link.id} href={getProgramUrl(link.program, locale)} className="program-summary-card hover-up">
											<h3>{link.label || link.program.translations[0]?.localizedProgramName || link.program.programName}</h3>
											<p>{link.program.university.name}</p>
										</Link>
									))}
								</RelatedPanel>
							)}

							{post.universityLinks.length > 0 && (
								<RelatedPanel title="Related universities">
									{post.universityLinks.map((link) => (
										<Link key={link.id} href={getUniversityUrl(link.university, locale)} className="program-summary-card hover-up">
											<h3>{link.label || link.university.name}</h3>
											<p>{[link.university.location, link.university.state].filter(Boolean).join(", ")}</p>
										</Link>
									))}
								</RelatedPanel>
							)}

							{filterBlocks.map(({ block, programs }) => (
								<div className="program-detail-section mt-6" key={block.id}>
									<div className="section-heading">
										<p>{block.description || "Program preview"}</p>
										<h2>{block.title}</h2>
									</div>
									<div className="row g-4">
										{programs.map((program) => (
											<div className="col-md-6" key={program.id}>
												<CourseCard course={program} locale={locale} variant="compact" />
											</div>
										))}
									</div>
								</div>
							))}

							<div className="border-top mt-6 pt-5 d-flex flex-wrap align-items-center justify-content-between gap-3">
								<p className="mb-0 fs-7 text-uppercase">
									{post.authorName || "Study in DACH"}
								</p>
								<Link href={blogIndexPath(locale)} className="btn btn-outline-secondary">{backLabel}</Link>
							</div>
						</article>
					</div>
				</div>
			</section>
		</Layout>
	)
}

function RelatedPanel({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="program-detail-section mt-6">
			<div className="section-heading">
				<p>Related</p>
				<h2>{title}</h2>
			</div>
			<div className="program-info-grid">{children}</div>
		</div>
	)
}

function parseFilterJson(value: string): CourseSearchParams {
	try {
		const parsed = JSON.parse(value)
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
		return parsed as CourseSearchParams
	} catch {
		return {}
	}
}

function blogHubName(locale: PublicLocale) {
	if (locale === "pt-br") return "Guias"
	if (locale === "es") return "Guías"
	return "Blog"
}

export function localizedBlogPostUrl(slug: string, locale: PublicLocale) {
	return blogPostPath(slug, locale)
}
