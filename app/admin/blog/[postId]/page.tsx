import Layout from "@/components/layout/Layout"
import { AdminHeader, Panel, PostEditor } from "@/app/admin/blog/admin-blog-ui"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function EditBlogPostPage({ params }: { params: { postId: string } }) {
	const postId = Number(params.postId)
	if (!Number.isFinite(postId) || postId <= 0) notFound()

	const [post, categories, tags] = await Promise.all([
		prisma.blogPost.findUnique({
			where: { id: postId },
			include: {
				translations: true,
				category: { include: { translations: true } },
				tags: { include: { tag: { include: { translations: true } } } },
				programLinks: { include: { program: { include: { university: true } } }, orderBy: { sortOrder: "asc" } },
				universityLinks: { include: { university: true }, orderBy: { sortOrder: "asc" } },
				filterBlocks: { orderBy: { sortOrder: "asc" } },
				faqs: { orderBy: { sortOrder: "asc" } },
			},
		}),
		prisma.blogCategory.findMany({ include: { translations: true }, orderBy: [{ sortOrder: "asc" }, { key: "asc" }] }),
		prisma.blogTag.findMany({ include: { translations: true }, orderBy: { key: "asc" } }),
	])

	if (!post) notFound()

	const title = post.translations[0]?.title || `Post #${post.id}`

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<AdminHeader title="Edit blog post" />
					<Panel eyebrow="Editor" title={title}>
						<PostEditor post={post} categories={categories} tags={tags} />
					</Panel>
				</div>
			</section>
		</Layout>
	)
}
