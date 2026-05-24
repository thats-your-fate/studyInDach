import { blogIndexPath, blogPostPath, formatBlogDate, localizedBlogCategoryName, localizedBlogTagNames, publishedBlogWhere } from "@/lib/blog-posts"
import type { PublicLocale } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

const copy = {
	en: {
		eyebrow: "Study guides",
		title: "Latest study guides",
		cta: "View all guides",
		read: "Read guide",
	},
	"pt-br": {
		eyebrow: "Guias",
		title: "Guias recentes",
		cta: "Ver todos os guias",
		read: "Ler guia",
	},
	es: {
		eyebrow: "Guías",
		title: "Guías recientes",
		cta: "Ver todas las guías",
		read: "Leer guía",
	},
} satisfies Record<PublicLocale, { eyebrow: string; title: string; cta: string; read: string }>

export default async function SectionLatestGuides({ locale = "en" }: { locale?: PublicLocale }) {
	const ui = copy[locale]
	const posts = await prisma.blogPost.findMany({
		where: {
			...publishedBlogWhere,
			noindex: false,
			translations: { some: { locale } },
		},
		include: {
			translations: { where: { locale }, take: 1 },
			category: { include: { translations: { where: { locale }, take: 1 } } },
			tags: { include: { tag: { include: { translations: { where: { locale }, take: 1 } } } } },
		},
		orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
		take: 3,
	})

	if (!posts.length) return null

	return (
		<section className="position-relative bg-white py-120 overflow-hidden">
			<div className="container">
				<div className="d-flex flex-wrap align-items-end justify-content-between gap-4 mb-6">
					<div>
						<span className="btn-text fw-bold text-primary">
							<i className="ri-article-line text-green-3" />
							&nbsp; {ui.eyebrow}
						</span>
						<h2 className="ds-3 text-primary mb-0 mt-3">{ui.title}</h2>
					</div>
					<Link href={blogIndexPath(locale)} className="btn btn-outline-primary">{ui.cta}</Link>
				</div>
				<div className="row g-4">
					{posts.map((post) => {
						const translation = post.translations[0]
						const href = blogPostPath(translation.slug, locale)
						const categoryName = localizedBlogCategoryName(post.category, locale)
						const tags = localizedBlogTagNames(post.tags, locale).slice(0, 2)
						const labels = [categoryName, ...tags].filter(Boolean)

						return (
							<div className="col-md-6 col-xl-4" key={post.id}>
								<article className="card-news d-flex flex-column bg-secondary-2 rounded-3 h-100 overflow-hidden hover-up">
									{post.coverImageUrl && (
										<img src={post.coverImageUrl} alt={post.coverImageAlt || ""} className="w-100" style={{ height: 220, objectFit: "cover" }} />
									)}
									<div className="p-5 d-flex flex-column flex-grow-1">
										{labels.length > 0 && (
											<div className="d-flex flex-wrap gap-2 mb-3">
												{labels.map((label, index) => (
													<span className={index === 0 ? "blog-chip blog-chip-primary" : "blog-chip"} key={label}>{label}</span>
												))}
											</div>
										)}
										<p className="fs-7 text-uppercase text-primary fw-bold mb-2">{formatBlogDate(post.publishedAt, locale)}</p>
										<h3 className="h4 text-primary mb-3">
											<Link href={href}>{translation.title}</Link>
										</h3>
										<p className="mb-4">{translation.excerpt || excerptFromContent(translation.contentMd)}</p>
										<Link href={href} className="btn-text text-primary mt-auto" aria-label={`${ui.read}: ${translation.title}`}>{ui.read}</Link>
									</div>
								</article>
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}

function excerptFromContent(content: string) {
	const compact = content.replace(/[#>*_`[\]()]/g, "").replace(/\s+/g, " ").trim()
	return compact.length > 150 ? `${compact.slice(0, 150)}...` : compact
}
