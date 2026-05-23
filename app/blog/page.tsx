import Layout from "@/components/layout/Layout"
import { formatBlogDate, publishedBlogWhere } from "@/lib/blog-posts"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
	title: "Blog | Study in DACH",
	description: "Articles and practical notes about finding and comparing degree programs in Germany, Austria, and Switzerland.",
	alternates: {
		canonical: absoluteUrl("/blog"),
	},
}

export default async function Blog() {
	const posts = await prisma.blogPost.findMany({
		where: publishedBlogWhere,
		orderBy: [{ publishedAt: "desc" }],
	})

	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-article-line text-green-3" />
						&nbsp; blog
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">Study in DACH Blog</h1>
				</div>
			</section>

			<section className="py-120 bg-white">
				<div className="container">
					<div className="section-heading text-center mb-7">
						<p>Latest posts</p>
						<h2>Notes for planning your studies</h2>
					</div>
					{posts.length === 0 ? (
						<div className="empty-results">
							<h5>No posts published yet</h5>
							<p>New articles will appear here after they are published.</p>
						</div>
					) : (
						<div className="row g-4">
							{posts.map((post) => (
								<div className="col-md-6 col-lg-4" key={post.id}>
									<Link href={`/blog/${post.slug}`} className="card-news d-block bg-secondary-2 rounded-3 h-100 overflow-hidden hover-up">
										{post.coverImage && (
											<img src={post.coverImage} alt="" className="w-100" style={{ height: 220, objectFit: "cover" }} />
										)}
										<div className="p-5">
											<p className="fs-7 text-uppercase text-primary fw-bold mb-2">{formatBlogDate(post.publishedAt)}</p>
											<h4 className="text-primary mb-3">{post.title}</h4>
											<p className="mb-4">{post.excerpt || excerptFromContent(post.content)}</p>
											<span className="btn-text text-primary">Read post</span>
										</div>
									</Link>
								</div>
							))}
						</div>
					)}
				</div>
			</section>
		</Layout>
	)
}

function excerptFromContent(content: string) {
	const compact = content.replace(/\s+/g, " ").trim()
	return compact.length > 150 ? `${compact.slice(0, 150)}...` : compact
}
