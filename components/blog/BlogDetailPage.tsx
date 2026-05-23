import Layout from "@/components/layout/Layout"
import CourseCard from "@/components/sections/courses/CourseCard"
import { blogIndexPath, blogPostPath, blogSchemaLanguage, formatBlogDate, markdownToHtml, publishedBlogWhere } from "@/lib/blog-posts"
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
					filterBlocks: { where: { enabled: true, OR: [{ locale }, { locale: null }] }, orderBy: { sortOrder: "asc" } },
					faqs: { where: { OR: [{ locale }, { locale: null }] }, orderBy: { sortOrder: "asc" } },
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
	const faqs = post.faqs.filter((faq) => faq.question && faq.answer)
	const categoryName = post.category?.translations[0]?.name || null
	const tags = post.tags.map((item) => item.tag.translations[0]?.name || item.tag.key).filter(Boolean)
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
			name: post.authorName || "Yaroslav Vynnychuk",
		},
		publisher: organizationJsonLd(),
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": pageUrl,
		},
		articleSection: categoryName || undefined,
		keywords: translation.seoKeywords || tags.join(", ") || undefined,
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
	const faqJsonLd = faqs.length ? {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
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
			{faqJsonLd && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
							{(categoryName || tags.length > 0) && (
								<div className="d-flex flex-wrap align-items-center gap-2 mb-4">
									{categoryName && <span className="blog-chip blog-chip-primary">{categoryName}</span>}
									{tags.map((tag) => <span className="blog-chip" key={tag}>{tag}</span>)}
								</div>
							)}
							{translation.excerpt && <p className="lead text-primary fw-bold mb-5">{translation.excerpt}</p>}
							<ArticleContent
								contentMd={translation.contentMd}
								filterBlocks={filterBlocks}
								faqs={faqs}
								locale={locale}
							/>

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

							<div className="border-top mt-6 pt-5 d-flex flex-wrap align-items-center justify-content-between gap-3">
								<p className="mb-0 fs-7 text-uppercase">
									{post.authorName || "Yaroslav Vynnychuk"}
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

function ArticleContent({ contentMd, filterBlocks, faqs, locale }: { contentMd: string; filterBlocks: BlogFilterBlock[]; faqs: BlogFaq[]; locale: PublicLocale }) {
	const markerPattern = /<!--\s*(program-filter-block:\s*([a-zA-Z0-9_-]+)|faq-block)\s*-->/g
	const nodes: ReactNode[] = []
	const renderedFilterBlockIds = new Set<number>()
	let renderedFaq = false
	let cursor = 0
	let match: RegExpExecArray | null

	while ((match = markerPattern.exec(contentMd)) !== null) {
		pushMarkdownChunk(nodes, contentMd.slice(cursor, match.index))
		if (match[1].startsWith("program-filter-block")) {
			const key = match[2]
			const block = filterBlocks.find((item) => item.block.key === key) || filterBlocks.find((item) => !renderedFilterBlockIds.has(item.block.id))
			if (block) {
				renderedFilterBlockIds.add(block.block.id)
				nodes.push(<FilterBlockSection item={block} locale={locale} key={`filter-${block.block.id}`} />)
			}
		} else if (faqs.length > 0) {
			renderedFaq = true
			nodes.push(<FaqSection faqs={faqs} locale={locale} compact key="faq-block" />)
		}
		cursor = markerPattern.lastIndex
	}

	pushMarkdownChunk(nodes, contentMd.slice(cursor))

	filterBlocks
		.filter((item) => !renderedFilterBlockIds.has(item.block.id))
		.forEach((item) => nodes.push(<FilterBlockSection item={item} locale={locale} key={`filter-${item.block.id}`} />))

	if (!renderedFaq && faqs.length > 0) {
		nodes.push(<FaqSection faqs={faqs} locale={locale} key="faq-fallback" />)
	}

	return <>{nodes}</>
}

function pushMarkdownChunk(nodes: ReactNode[], chunk: string) {
	if (!chunk.trim()) return
	nodes.push(
		<div className="blog-content" dangerouslySetInnerHTML={{ __html: markdownToHtml(chunk) }} key={`markdown-${nodes.length}`} />
	)
}

function FilterBlockSection({ item, locale }: { item: BlogFilterBlock; locale: PublicLocale }) {
	const { block, programs } = item
	return (
		<div className="program-detail-section mt-6">
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
			{block.ctaHref && (
				<Link href={block.ctaHref} className="btn btn-outline-secondary mt-4">
					{block.ctaLabel || "View all programs"}
				</Link>
			)}
		</div>
	)
}

function FaqSection({ faqs, locale, compact = false }: { faqs: BlogFaq[]; locale: PublicLocale; compact?: boolean }) {
	return (
		<div className={compact ? "program-detail-section mt-4" : "program-detail-section mt-6"}>
			{!compact && (
				<div className="section-heading">
					<p>{faqEyebrow(locale)}</p>
					<h2>{faqTitle(locale)}</h2>
				</div>
			)}
			<div className="accordion" id="blog-faqs">
				{faqs.map((faq) => (
					<div className="border-bottom py-3" key={faq.id}>
						<h3 className="fs-4 text-primary mb-2">{faq.question}</h3>
						<p className="mb-0">{faq.answer}</p>
					</div>
				))}
			</div>
		</div>
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

function faqEyebrow(locale: PublicLocale) {
	if (locale === "pt-br") return "Perguntas frequentes"
	if (locale === "es") return "Preguntas frecuentes"
	return "FAQ"
}

function faqTitle(locale: PublicLocale) {
	if (locale === "pt-br") return "Perguntas sobre este guia"
	if (locale === "es") return "Preguntas sobre esta guía"
	return "Questions about this guide"
}

type BlogFilterBlock = {
	block: {
		id: number
		key: string | null
		title: string
		description: string | null
		ctaHref: string | null
		ctaLabel: string | null
	}
	programs: any[]
}

type BlogFaq = {
	id: number
	question: string
	answer: string
}

export function localizedBlogPostUrl(slug: string, locale: PublicLocale) {
	return blogPostPath(slug, locale)
}
