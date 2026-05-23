import Layout from "@/components/layout/Layout"
import { formatBlogDate, randomStudyCoverImage, uniqueBlogSlug } from "@/lib/blog-posts"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type BlogAdminSearchParams = {
	post?: string
	status?: string
}

async function createBlogPost(formData: FormData) {
	"use server"

	const title = field(formData, "title")
	const content = field(formData, "content")
	if (!title || !content) return

	const status = field(formData, "status") === "published" ? "published" : "draft"
	const slug = await uniqueBlogSlug(title)
	const post = await prisma.blogPost.create({
		data: {
			title,
			slug,
			excerpt: nullableField(formData, "excerpt"),
			content,
			coverImage: randomStudyCoverImage(),
			status,
			publishedAt: status === "published" ? new Date() : null,
			authorName: nullableField(formData, "authorName"),
			seoTitle: nullableField(formData, "seoTitle"),
			seoDescription: nullableField(formData, "seoDescription"),
			locale: field(formData, "locale") || "en",
		},
	})

	revalidateBlog(post.slug)
	redirect(`/admin/blog?post=${post.id}`)
}

async function updateBlogPost(formData: FormData) {
	"use server"

	const id = Number(formData.get("id"))
	if (!Number.isFinite(id) || id <= 0) return

	const existing = await prisma.blogPost.findUnique({ where: { id } })
	if (!existing) return

	const title = field(formData, "title")
	const status = field(formData, "status") === "published" ? "published" : "draft"
	const slug = title && title !== existing.title ? await uniqueBlogSlug(title, id) : existing.slug
	const publishedAt = status === "published"
		? existing.publishedAt || new Date()
		: null

	await prisma.blogPost.update({
		where: { id },
		data: {
			title,
			slug,
			excerpt: nullableField(formData, "excerpt"),
			content: field(formData, "content"),
			coverImage: nullableField(formData, "coverImage"),
			status,
			publishedAt,
			authorName: nullableField(formData, "authorName"),
			seoTitle: nullableField(formData, "seoTitle"),
			seoDescription: nullableField(formData, "seoDescription"),
			locale: field(formData, "locale") || "en",
		},
	})

	revalidateBlog(existing.slug)
	revalidateBlog(slug)
	redirect(`/admin/blog?post=${id}`)
}

function revalidateBlog(slug?: string | null) {
	revalidatePath("/admin/blog")
	revalidatePath("/blog")
	revalidatePath("/sitemap.xml")
	if (slug) revalidatePath(`/blog/${slug}`)
}

function field(formData: FormData, name: string) {
	return String(formData.get(name) || "").trim()
}

function nullableField(formData: FormData, name: string) {
	return field(formData, name) || null
}

export default async function AdminBlogPage({
	searchParams,
}: {
	searchParams?: BlogAdminSearchParams
}) {
	const status = searchParams?.status || ""
	const selectedPostId = Number(searchParams?.post)
	const [posts, selectedPost] = await Promise.all([
		prisma.blogPost.findMany({
			where: status ? { status } : undefined,
			orderBy: [{ updatedAt: "desc" }],
			take: 100,
		}),
		Number.isFinite(selectedPostId) && selectedPostId > 0
			? prisma.blogPost.findUnique({ where: { id: selectedPostId } })
			: null,
	])

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<AdminHeader />

					<div className="row g-4 align-items-start">
						<div className="col-lg-4">
							<div className="admin-panel bg-white rounded-3 p-5 mb-4">
								<div className="section-heading mb-4">
									<p>Create</p>
									<h2>New blog post</h2>
								</div>
								<BlogForm action={createBlogPost} submitLabel="Create post" />
							</div>
						</div>

						<div className="col-lg-8">
							<div className="admin-panel bg-white rounded-3 p-5">
								<div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-5">
									<div className="section-heading mb-0">
										<p>Posts</p>
										<h2>{selectedPost ? "Edit blog post" : "Blog library"}</h2>
									</div>
									<div className="d-flex flex-wrap gap-2">
										<Link href="/admin/blog" className="btn btn-outline-secondary">All</Link>
										<Link href="/admin/blog?status=draft" className="btn btn-outline-secondary">Drafts</Link>
										<Link href="/admin/blog?status=published" className="btn btn-outline-secondary">Published</Link>
									</div>
								</div>

								{selectedPost ? (
									<>
										<div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
											<div>
												<p className="fs-7 text-uppercase mb-1">Slug: /blog/{selectedPost.slug}</p>
												<p className="mb-0">Cover images are assigned randomly on create, then can be edited here.</p>
											</div>
											<div className="d-flex gap-2">
												<Link href="/admin/blog" className="btn btn-outline-secondary">Back to posts</Link>
												{selectedPost.status === "published" && (
													<Link href={`/blog/${selectedPost.slug}`} className="btn btn-primary">View post</Link>
												)}
											</div>
										</div>
										<BlogForm post={selectedPost} action={updateBlogPost} submitLabel="Save post" />
									</>
								) : (
									<div className="admin-inquiry-list">
										{posts.length === 0 ? (
											<div className="empty-results">
												<h5>No blog posts yet</h5>
												<p>Create the first post from the form on the left.</p>
											</div>
										) : posts.map((post) => (
											<Link href={`/admin/blog?post=${post.id}`} className="admin-inquiry-row" key={post.id}>
												<div>
													<span>{formatBlogDate(post.publishedAt)}</span>
													<strong>{post.title}</strong>
													<p>/blog/{post.slug}</p>
													<p>{post.excerpt || "No excerpt yet."}</p>
												</div>
												<div>
													<span className={`inquiry-status status-${post.status}`}>{post.status}</span>
													<p>Locale: {post.locale}</p>
													<p>Updated: {formatBlogDate(post.updatedAt)}</p>
												</div>
												{post.coverImage ? <img src={post.coverImage} alt="" style={{ width: 150, height: 96, objectFit: "cover", borderRadius: 8 }} /> : <p>No cover</p>}
												<span className="btn-text text-primary">Edit</span>
											</Link>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}

function AdminHeader() {
	return (
		<div className="d-flex flex-wrap align-items-end justify-content-between gap-4 mb-6">
			<div>
				<span className="content-top btn-text fw-bold text-primary">
					<i className="ri-article-line text-green-3" />
					&nbsp; Mini admin
				</span>
				<h1 className="ds-3 text-primary mb-0">Blog posts</h1>
			</div>
			<div className="d-flex flex-wrap gap-2">
				<Link href="/admin" className="btn btn-outline-secondary">Program admin</Link>
				<Link href="/admin/data-quality" className="btn btn-outline-secondary">Data quality</Link>
				<Link href="/admin/program-review" className="btn btn-outline-secondary">Program review</Link>
				<Link href="/admin/inquiries" className="btn btn-outline-secondary">Inquiries</Link>
				<Link href="/blog" className="btn btn-primary">View blog</Link>
			</div>
		</div>
	)
}

function BlogForm({
	post,
	action,
	submitLabel,
}: {
	post?: any
	action: (formData: FormData) => Promise<void>
	submitLabel: string
}) {
	return (
		<form action={action} className="row g-3">
			{post && <input type="hidden" name="id" value={post.id} />}
			<TextInput label="Title" name="title" value={post?.title} className="col-12" required />
			<TextArea label="Excerpt" name="excerpt" value={post?.excerpt} className="col-12" rows={3} />
			<TextArea label="Content" name="content" value={post?.content} className="col-12" rows={post ? 14 : 8} required />
			<TextInput label="Author" name="authorName" value={post?.authorName} className="col-md-6" />
			<label className="col-md-3">
				<span className="fs-7 text-uppercase text-primary fw-bold">Locale</span>
				<select className="form-control mt-1" name="locale" defaultValue={post?.locale || "en"}>
					<option value="en">English</option>
					<option value="pt-br">Portuguese</option>
					<option value="es">Spanish</option>
				</select>
			</label>
			<label className="col-md-3">
				<span className="fs-7 text-uppercase text-primary fw-bold">Status</span>
				<select className="form-control mt-1" name="status" defaultValue={post?.status || "draft"}>
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</select>
			</label>
			{post && <TextInput label="Cover image URL" name="coverImage" value={post.coverImage} className="col-12" />}
			{post?.coverImage && (
				<div className="col-12">
					<img src={post.coverImage} alt="" className="w-100 rounded-3" style={{ maxHeight: 260, objectFit: "cover" }} />
				</div>
			)}
			<TextInput label="SEO title" name="seoTitle" value={post?.seoTitle} className="col-12" />
			<TextArea label="SEO description" name="seoDescription" value={post?.seoDescription} className="col-12" rows={3} />
			<div className="col-12">
				<button className="btn btn-primary" type="submit">{submitLabel}</button>
			</div>
		</form>
	)
}

function TextInput({
	label,
	name,
	value,
	className,
	required,
}: {
	label: string
	name: string
	value?: string | null
	className?: string
	required?: boolean
}) {
	return (
		<label className={className}>
			<span className="fs-7 text-uppercase text-primary fw-bold">{label}</span>
			<input className="form-control mt-1" name={name} defaultValue={value || ""} required={required} />
		</label>
	)
}

function TextArea({
	label,
	name,
	value,
	className,
	rows = 5,
	required,
}: {
	label: string
	name: string
	value?: string | null
	className?: string
	rows?: number
	required?: boolean
}) {
	return (
		<label className={className}>
			<span className="fs-7 text-uppercase text-primary fw-bold">{label}</span>
			<textarea className="form-control mt-1" name={name} rows={rows} defaultValue={value || ""} required={required} />
		</label>
	)
}
