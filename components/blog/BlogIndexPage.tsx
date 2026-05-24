import Layout from "@/components/layout/Layout"
import { blogHrefLang, blogIndexPath, blogPostPath, formatBlogDate, localizedBlogCategoryName, localizedBlogTagNames, publishedBlogWhere } from "@/lib/blog-posts"
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
	const breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Study in DACH", item: absoluteUrl(locale === "en" ? "/" : `/${locale}`) },
			{ "@type": "ListItem", position: 2, name: title, item: absoluteUrl(blogIndexPath(locale)) },
		],
	}

	return (
		<Layout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
						<div className="row g-4">
							{posts.map((post) => (
								<div className="col-md-6" key={post.id}>
									<BlogCard post={post} locale={locale} readLabel={readLabel} featured={post.featured} />
								</div>
							))}
						</div>
					)}
				</div>
			</section>
		</Layout>
	)
}

function BlogCard({ post, locale, readLabel, featured = false }: { post: any; locale: PublicLocale; readLabel: string; featured?: boolean }) {
	const href = blogPostPath(post.translations[0].slug, locale)
	const categoryName = localizedBlogCategoryName(post.category, locale)
	const tags = localizedBlogTagNames(post.tags, locale).slice(0, 6)
	const dateLabel = featured ? `${featuredLabel(locale)} · ${formatBlogDate(post.publishedAt, locale)}` : formatBlogDate(post.publishedAt, locale)

	return (
		<article className="card-news d-flex flex-column bg-secondary-2 rounded-3 h-100 overflow-hidden hover-up">
			{post.coverImageUrl && (
				<div>
					<img src={post.coverImageUrl} alt={post.coverImageAlt || ""} className="w-100" style={{ height: 260, objectFit: "cover" }} />
				</div>
			)}
			<div className="p-5 d-flex flex-column flex-grow-1">
				{(categoryName || tags.length > 0) && (
					<div className="d-flex flex-wrap gap-2 mb-3" aria-label={tagListLabel(locale)}>
						{categoryName && <span className="blog-chip blog-chip-primary">{categoryName}</span>}
						{tags.map((tag: string) => <span className="blog-chip" key={tag}>{tag}</span>)}
					</div>
				)}
				<p className="fs-7 text-uppercase text-primary fw-bold mb-2">{dateLabel}</p>
				<h2 className="h4 text-primary mb-3">
					<Link href={href}>{post.translations[0].title}</Link>
				</h2>
				<p className="mb-4">{post.translations[0].excerpt || excerptFromContent(post.translations[0].contentMd)}</p>
				<Link href={href} className="btn-text text-primary mt-auto" aria-label={`${readLabel}: ${post.translations[0].title}`}>{readLabel}</Link>
			</div>
		</article>
	)
}

function featuredLabel(locale: PublicLocale) {
	if (locale === "pt-br") return "Destaque"
	if (locale === "es") return "Destacado"
	return "Featured"
}

function tagListLabel(locale: PublicLocale) {
	if (locale === "pt-br") return "Categorias e tags"
	if (locale === "es") return "Categorías y etiquetas"
	return "Categories and tags"
}

function excerptFromContent(content: string) {
	const compact = content.replace(/\s+/g, " ").trim()
	return compact.length > 150 ? `${compact.slice(0, 150)}...` : compact
}
