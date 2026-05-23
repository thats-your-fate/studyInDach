import Layout from "@/components/layout/Layout"
import { blogHrefLang, blogIndexPath, blogPostPath, formatBlogDate, publishedBlogWhere } from "@/lib/blog-posts"
import type { PublicLocale } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { absoluteUrl, organizationJsonLd } from "@/lib/seo"
import Link from "next/link"

type BlogIndexPageProps = {
	locale: PublicLocale
	title: string
	label: string
	heading: string
	emptyTitle: string
	emptyText: string
	readLabel: string
}

export default async function BlogIndexPage({
	locale,
	title,
	label,
	heading,
	emptyTitle,
	emptyText,
	readLabel,
}: BlogIndexPageProps) {
	const posts = await prisma.blogPost.findMany({
		where: {
			...publishedBlogWhere,
			translations: { some: { locale } },
		},
		include: {
			translations: { where: { locale }, take: 1 },
			category: { include: { translations: { where: { locale }, take: 1 } } },
			tags: { include: { tag: { include: { translations: { where: { locale }, take: 1 } } } } },
		},
		orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
	})
	const featuredPosts = posts.filter((post) => post.featured)
	const regularPosts = posts.filter((post) => !post.featured)
	const blogJsonLd = {
		"@context": "https://schema.org",
		"@type": "Blog",
		name: title,
		description: heading,
		url: absoluteUrl(blogIndexPath(locale)),
		inLanguage: blogHrefLang(locale),
		publisher: organizationJsonLd(),
	}
	const itemListJsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: title,
		itemListElement: posts.map((post, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(blogPostPath(post.translations[0].slug, locale)),
			name: post.translations[0].title,
		})),
	}

	return (
		<Layout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
			/>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-article-line text-green-3" />
						&nbsp; {label}
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">{title}</h1>
				</div>
			</section>

			<section className="py-120 bg-white">
				<div className="container">
					<div className="section-heading text-center mb-7">
						<p>{label}</p>
						<h2>{heading}</h2>
					</div>
					{posts.length === 0 ? (
						<div className="empty-results">
							<h5>{emptyTitle}</h5>
							<p>{emptyText}</p>
						</div>
					) : (
						<>
							{featuredPosts.length > 0 && (
								<div className="row g-4 mb-6">
									{featuredPosts.map((post) => (
										<div className="col-12" key={post.id}>
											<BlogCard post={post} locale={locale} readLabel={readLabel} featured />
										</div>
									))}
								</div>
							)}
							<div className="row g-4">
								{regularPosts.map((post) => (
									<div className="col-md-6 col-lg-4" key={post.id}>
										<BlogCard post={post} locale={locale} readLabel={readLabel} />
									</div>
								))}
							</div>
						</>
					)}
				</div>
			</section>
		</Layout>
	)
}

function BlogCard({ post, locale, readLabel, featured = false }: { post: any; locale: PublicLocale; readLabel: string; featured?: boolean }) {
	return (
		<Link href={blogPostPath(post.translations[0].slug, locale)} className={`card-news d-block bg-secondary-2 rounded-3 h-100 overflow-hidden hover-up ${featured ? "row g-0 align-items-stretch" : ""}`}>
			{post.coverImageUrl && (
				<div className={featured ? "col-lg-5" : ""}>
					<img src={post.coverImageUrl} alt={post.coverImageAlt || ""} className="w-100 h-100" style={{ minHeight: featured ? 320 : 220, maxHeight: featured ? 420 : 220, objectFit: "cover" }} />
				</div>
			)}
			<div className={featured ? "col-lg-7 p-6" : "p-5"}>
				<div className="d-flex flex-wrap gap-2 mb-3">
					{post.category?.translations[0]?.name && <span className="blog-chip blog-chip-primary">{post.category.translations[0].name}</span>}
					{post.tags?.slice(0, featured ? 6 : 3).map((item: any) => (
						<span className="blog-chip" key={item.tagId}>{item.tag.translations[0]?.name || item.tag.key}</span>
					))}
				</div>
				<p className="fs-7 text-uppercase text-primary fw-bold mb-2">{featured ? "Featured · " : ""}{formatBlogDate(post.publishedAt)}</p>
				<h4 className="text-primary mb-3">{post.translations[0].title}</h4>
				<p className="mb-4">{post.translations[0].excerpt || excerptFromContent(post.translations[0].contentMd)}</p>
				<span className="btn-text text-primary">{readLabel}</span>
			</div>
		</Link>
	)
}

function excerptFromContent(content: string) {
	const compact = content.replace(/\s+/g, " ").trim()
	return compact.length > 150 ? `${compact.slice(0, 150)}...` : compact
}
