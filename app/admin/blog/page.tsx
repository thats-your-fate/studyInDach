import Layout from "@/components/layout/Layout"
import { AdminHeader, Panel, PostFilters, PostList } from "@/app/admin/blog/admin-blog-ui"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

const postStatuses = ["draft", "review", "published", "archived"]

type BlogAdminSearchParams = {
	post?: string
	status?: string
}

export default async function AdminBlogLibraryPage({ searchParams }: { searchParams?: BlogAdminSearchParams }) {
	if (searchParams?.post) {
		redirect(`/admin/blog/${searchParams.post}`)
	}

	const status = postStatuses.includes(searchParams?.status || "") ? searchParams?.status : ""
	const posts = await prisma.blogPost.findMany({
		where: status ? { status } : undefined,
		include: {
			translations: true,
			category: { include: { translations: true } },
			tags: { include: { tag: { include: { translations: true } } } },
		},
		orderBy: [{ updatedAt: "desc" }],
		take: 100,
	})

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<AdminHeader title="Blog library" />
					<Panel eyebrow="Posts" title="Blog library" actions={<PostFilters />}>
						<PostList posts={posts} />
					</Panel>
				</div>
			</section>
		</Layout>
	)
}
