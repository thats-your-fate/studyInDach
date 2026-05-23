import Layout from "@/components/layout/Layout"
import { AdminHeader, BlogCreateForm, BlogJsonImportForm, Panel, TaxonomyForms } from "@/app/admin/blog/admin-blog-ui"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function NewBlogPostPage() {
	const [categories, tags] = await Promise.all([
		prisma.blogCategory.findMany({ include: { translations: true }, orderBy: [{ sortOrder: "asc" }, { key: "asc" }] }),
		prisma.blogTag.findMany({ include: { translations: true }, orderBy: { key: "asc" } }),
	])

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<AdminHeader title="New blog post" />
					<div className="row g-4">
						<div className="col-12">
							<Panel eyebrow="Import" title="One-click JSON import">
								<BlogJsonImportForm />
							</Panel>
						</div>
						<div className="col-12">
							<Panel eyebrow="Create" title="New blog post">
								<BlogCreateForm categories={categories} tags={tags} />
							</Panel>
						</div>
						<div className="col-12">
							<Panel eyebrow="Taxonomy" title="Categories and tags">
								<TaxonomyForms />
							</Panel>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}
