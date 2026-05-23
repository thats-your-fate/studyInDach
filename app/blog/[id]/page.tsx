import Layout from "@/components/layout/Layout"
import { formatBlogDate, paragraphsFromContent, publishedBlogWhere } from "@/lib/blog-posts"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

type BlogDetailsProps = {
	params: { id: string }
}

export async function generateMetadata({ params }: BlogDetailsProps): Promise<Metadata> {
	const post = await prisma.blogPost.findFirst({
		where: { ...publishedBlogWhere, slug: params.id },
	})
	if (!post) return {}

	return {
		title: post.seoTitle || `${post.title} | Study in DACH`,
		description: post.seoDescription || post.excerpt || undefined,
		alternates: {
			canonical: absoluteUrl(`/blog/${post.slug}`),
		},
		openGraph: {
			title: post.seoTitle || post.title,
			description: post.seoDescription || post.excerpt || undefined,
			images: post.coverImage ? [post.coverImage] : undefined,
		},
	}
}

export default async function BlogDetails({ params }: BlogDetailsProps) {
	const post = await prisma.blogPost.findFirst({
		where: { ...publishedBlogWhere, slug: params.id },
	})

	if (!post) notFound()

	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-article-line text-green-3" />
						&nbsp; {formatBlogDate(post.publishedAt)}
					</span>
					<h1 className="text-white ds-2 lh-sm mb-0 text-anime-style-2">{post.title}</h1>
				</div>
			</section>

			<section className="py-120 bg-white">
				<div className="container">
					<div className="row justify-content-center">
						<article className="col-lg-9">
							{post.coverImage && (
								<img src={post.coverImage} alt="" className="w-100 rounded-3 mb-5" style={{ maxHeight: 520, objectFit: "cover" }} />
							)}
							{post.excerpt && <p className="lead text-primary fw-bold mb-5">{post.excerpt}</p>}
							<div className="blog-content">
								{paragraphsFromContent(post.content).map((paragraph) => (
									<p key={paragraph}>{paragraph}</p>
								))}
							</div>
							<div className="border-top mt-6 pt-5 d-flex flex-wrap align-items-center justify-content-between gap-3">
								<p className="mb-0 fs-7 text-uppercase">
									{post.authorName ? `By ${post.authorName}` : "Study in DACH"}
								</p>
								<Link href="/blog" className="btn btn-outline-secondary">Back to blog</Link>
							</div>
						</article>
					</div>
				</div>
			</section>
		</Layout>
	)
}
