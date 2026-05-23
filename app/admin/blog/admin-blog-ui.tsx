import Layout from "@/components/layout/Layout"
import { blogLocale, blogPostPath, formatBlogDate, markdownToHtml, randomStudyCoverImage, readingMinutes, studyCoverImages, uniqueBlogSlug } from "@/lib/blog-posts"
import type { PublicLocale } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"
import { randomUUID } from "crypto"
import type { ReactNode } from "react"

export const dynamic = "force-dynamic"
export const DEFAULT_BLOG_AUTHOR = "Yaroslav Vynnychuk"

type BlogAdminSearchParams = {
	post?: string
	status?: string
}

const locales: PublicLocale[] = ["en", "pt-br", "es"]
const postStatuses = ["draft", "review", "published", "archived"]
const postTypes = ["guide", "country_guide", "field_guide", "application_guide", "cost_guide", "comparison", "news"]

async function createBlogPost(formData: FormData) {
	"use server"

	const locale = blogLocale(field(formData, "locale"))
	const title = field(formData, "title")
	const contentMd = field(formData, "contentMd")
	if (!title || !contentMd) return

	const status = normalizeStatus(field(formData, "status"))
	const slug = await uniqueBlogSlug(field(formData, "slug") || title, locale)
	const translationKey = await uniqueTranslationKey(slugKey(field(formData, "translationKey")) || slugKey(title) || randomUUID())
	const filterBlockTitle = field(formData, "filterBlockTitle")
	const filterBlockJson = field(formData, "filterBlockJson")
	const post = await prisma.blogPost.create({
		data: {
			status,
			type: normalizeType(field(formData, "type")),
			publishedAt: status === "published" ? new Date() : null,
			authorName: nullableField(formData, "authorName") || DEFAULT_BLOG_AUTHOR,
			coverImageUrl: nullableField(formData, "coverImageUrl") || randomStudyCoverImage(),
			coverImageAlt: nullableField(formData, "coverImageAlt"),
			featured: formData.get("featured") === "on",
			noindex: formData.get("noindex") === "on",
			translationKey,
			categoryId: numericField(formData, "categoryId"),
			translations: {
				create: {
					locale,
					slug,
					title,
					excerpt: nullableField(formData, "excerpt"),
					contentMd,
					contentHtml: markdownToHtml(contentMd),
					seoTitle: nullableField(formData, "seoTitle"),
					seoDescription: nullableField(formData, "seoDescription"),
					seoKeywords: nullableField(formData, "seoKeywords"),
					ogTitle: nullableField(formData, "ogTitle"),
					ogDescription: nullableField(formData, "ogDescription"),
					ogImageUrl: nullableField(formData, "ogImageUrl"),
					readingMinutes: readingMinutes(contentMd),
				},
			},
			tags: {
				create: tagIds(formData).map((tagId) => ({ tagId })),
			},
			filterBlocks: filterBlockTitle && filterBlockJson ? {
				create: {
					key: nullableField(formData, "filterBlockKey"),
					locale: nullableField(formData, "filterBlockLocale") || locale,
					title: filterBlockTitle,
					description: nullableField(formData, "filterBlockDescription"),
					filterJson: filterBlockJson,
					limit: numericField(formData, "filterBlockLimit") || 6,
					sortOrder: numericField(formData, "filterBlockSortOrder") || 1,
					ctaLabel: nullableField(formData, "filterBlockCtaLabel"),
					ctaHref: nullableField(formData, "filterBlockCtaHref"),
					displayMode: field(formData, "filterBlockDisplayMode") || "cards",
					enabled: formData.get("filterBlockEnabled") === "on",
				},
			} : undefined,
		},
	})

	revalidateBlog()
	redirect(`/admin/blog/${post.id}`)
}

async function importSingleLocaleBlogPost(formData: FormData) {
	"use server"

	const importJson = field(formData, "importJson")
	if (!importJson) return

	const payload = parseImportPayload(importJson)
	if (!payload) return

	const locale = blogLocale(payload.locale)
	const title = String(payload.title || "").trim()
	const contentMd = String(payload.contentMd || "").trim()
	if (!title || !contentMd) return

	const status = normalizeStatus(String(payload.status || "draft"))
	const slug = await uniqueBlogSlug(String(payload.slug || title), locale)
	const translationKey = await uniqueTranslationKey(slugKey(String(payload.translationKey || slug || title)) || randomUUID())
	const categoryId = await upsertImportedCategory(payload.category, locale)
	const tagIds = await upsertImportedTags(payload.tags, locale)
	const coverImageUrl = nullableImportString(payload.coverImageUrl) || randomStudyCoverImage()
	const post = await prisma.blogPost.create({
		data: {
			status,
			type: normalizeType(String(payload.type || "guide")),
			publishedAt: status === "published" ? new Date() : null,
			authorName: nullableImportString(payload.authorName) || DEFAULT_BLOG_AUTHOR,
			coverImageUrl,
			coverImageAlt: nullableImportString(payload.coverImageAlt),
			featured: Boolean(payload.featured),
			noindex: Boolean(payload.noindex),
			translationKey,
			categoryId,
			translations: {
				create: {
					locale,
					slug,
					title,
					excerpt: nullableImportString(payload.excerpt),
					contentMd,
					contentHtml: markdownToHtml(contentMd),
					seoTitle: nullableImportString(payload.seoTitle),
					seoDescription: nullableImportString(payload.seoDescription),
					seoKeywords: nullableImportString(payload.seoKeywords),
					ogTitle: nullableImportString(payload.ogTitle),
					ogDescription: nullableImportString(payload.ogDescription),
					ogImageUrl: nullableImportString(payload.ogImageUrl) || coverImageUrl,
					readingMinutes: readingMinutes(contentMd),
					tableOfContents: stringifyOptionalJson(payload.tableOfContents),
				},
			},
			tags: {
				create: tagIds.map((tagId) => ({ tagId })),
			},
			filterBlocks: {
				create: importedFilterBlocks(payload.filterBlocks, locale),
			},
			faqs: {
				create: importedFaqs(payload.faqs, locale),
			},
			programLinks: {
				create: importedProgramLinks(payload.programLinks),
			},
			universityLinks: {
				create: importedUniversityLinks(payload.universityLinks),
			},
		},
	})

	revalidateBlog(slug)
	redirect(`/admin/blog/${post.id}`)
}

async function updateBlogPostSettings(formData: FormData) {
	"use server"

	const id = numericField(formData, "id")
	if (!id) return
	const existing = await prisma.blogPost.findUnique({ where: { id }, include: { translations: true } })
	if (!existing) return

	const status = normalizeStatus(field(formData, "status"))
	await prisma.blogPost.update({
		where: { id },
		data: {
			status,
			type: normalizeType(field(formData, "type")),
			publishedAt: status === "published" ? existing.publishedAt || new Date() : null,
			authorName: nullableField(formData, "authorName") || DEFAULT_BLOG_AUTHOR,
			coverImageUrl: nullableField(formData, "coverImageUrl"),
			coverImageAlt: nullableField(formData, "coverImageAlt"),
			featured: formData.get("featured") === "on",
			noindex: formData.get("noindex") === "on",
			categoryId: numericField(formData, "categoryId"),
			tags: {
				deleteMany: {},
				create: tagIds(formData).map((tagId) => ({ tagId })),
			},
		},
	})

	revalidateBlog(existing.translations.map((translation) => translation.slug))
	redirect(`/admin/blog/${id}`)
}

async function upsertTranslation(formData: FormData) {
	"use server"

	const postId = numericField(formData, "postId")
	const translationId = numericField(formData, "translationId")
	const locale = blogLocale(field(formData, "locale"))
	const title = field(formData, "title")
	const contentMd = field(formData, "contentMd")
	if (!postId || !title || !contentMd) return

	const existing = translationId ? await prisma.blogPostTranslation.findUnique({ where: { id: translationId } }) : null
	const slug = existing && existing.title === title && existing.locale === locale
		? existing.slug
		: await uniqueBlogSlug(title, locale, translationId || undefined)

	if (existing) {
		await prisma.blogPostTranslation.update({
			where: { id: existing.id },
			data: translationData(formData, slug, contentMd, locale, title),
		})
		revalidateBlog([existing.slug, slug])
	} else {
		await prisma.blogPostTranslation.create({
			data: {
				postId,
				...translationData(formData, slug, contentMd, locale, title),
			},
		})
		revalidateBlog(slug)
	}

	redirect(`/admin/blog/${postId}`)
}

async function createCategory(formData: FormData) {
	"use server"
	const key = slugKey(field(formData, "key") || field(formData, "name"))
	const name = field(formData, "name")
	const locale = blogLocale(field(formData, "locale"))
	if (!key || !name) return
	await prisma.blogCategory.upsert({
		where: { key },
		create: {
			key,
			translations: { create: { locale, name, slug: await uniqueCategorySlug(name, locale), description: nullableField(formData, "description") } },
		},
		update: {},
	})
	revalidateBlog()
}

async function createTag(formData: FormData) {
	"use server"
	const key = slugKey(field(formData, "key") || field(formData, "name"))
	const name = field(formData, "name")
	const locale = blogLocale(field(formData, "locale"))
	if (!key || !name) return
	await prisma.blogTag.upsert({
		where: { key },
		create: {
			key,
			translations: { create: { locale, name, slug: await uniqueTagSlug(name, locale) } },
		},
		update: {},
	})
	revalidateBlog()
}

async function attachProgram(formData: FormData) {
	"use server"
	const postId = numericField(formData, "postId")
	const programId = numericField(formData, "programId")
	if (!postId || !programId) return
	await prisma.blogPostProgramLink.create({ data: { postId, programId, label: nullableField(formData, "label"), sortOrder: numericField(formData, "sortOrder") || 0 } })
	revalidateBlog()
	redirect(`/admin/blog/${postId}`)
}

async function attachUniversity(formData: FormData) {
	"use server"
	const postId = numericField(formData, "postId")
	const universityId = field(formData, "universityId")
	if (!postId || !universityId) return
	await prisma.blogPostUniversityLink.create({ data: { postId, universityId, label: nullableField(formData, "label"), sortOrder: numericField(formData, "sortOrder") || 0 } })
	revalidateBlog()
	redirect(`/admin/blog/${postId}`)
}

async function addFilterBlock(formData: FormData) {
	"use server"
	const postId = numericField(formData, "postId")
	if (!postId) return
	await prisma.blogPostFilterBlock.create({
		data: {
			postId,
			key: nullableField(formData, "key"),
			locale: nullableField(formData, "locale"),
			title: field(formData, "title"),
			description: nullableField(formData, "description"),
			filterJson: field(formData, "filterJson") || "{}",
			limit: numericField(formData, "limit") || 8,
			sortOrder: numericField(formData, "sortOrder") || 0,
			ctaLabel: nullableField(formData, "ctaLabel"),
			ctaHref: nullableField(formData, "ctaHref"),
			displayMode: field(formData, "displayMode") || "cards",
			enabled: formData.get("enabled") === "on",
		},
	})
	revalidateBlog()
	redirect(`/admin/blog/${postId}`)
}

async function addFaq(formData: FormData) {
	"use server"
	const postId = numericField(formData, "postId")
	const question = field(formData, "question")
	const answer = field(formData, "answer")
	if (!postId || !question || !answer) return
	await prisma.blogPostFaq.create({
		data: {
			postId,
			locale: nullableField(formData, "locale"),
			question,
			answer,
			sortOrder: numericField(formData, "sortOrder") || 0,
		},
	})
	revalidateBlog()
	redirect(`/admin/blog/${postId}`)
}

async function deleteBlogRelation(formData: FormData) {
	"use server"
	const postId = numericField(formData, "postId")
	const id = numericField(formData, "id")
	const type = field(formData, "type")
	if (!postId || !id) return
	if (type === "program") await prisma.blogPostProgramLink.delete({ where: { id } })
	if (type === "university") await prisma.blogPostUniversityLink.delete({ where: { id } })
	if (type === "filter") await prisma.blogPostFilterBlock.delete({ where: { id } })
	if (type === "faq") await prisma.blogPostFaq.delete({ where: { id } })
	revalidateBlog()
	redirect(`/admin/blog/${postId}`)
}

function translationData(formData: FormData, slug: string, contentMd: string, locale: PublicLocale, title: string) {
	return {
		locale,
		slug,
		title,
		excerpt: nullableField(formData, "excerpt"),
		contentMd,
		contentHtml: markdownToHtml(contentMd),
		seoTitle: nullableField(formData, "seoTitle"),
		seoDescription: nullableField(formData, "seoDescription"),
		seoKeywords: nullableField(formData, "seoKeywords"),
		ogTitle: nullableField(formData, "ogTitle"),
		ogDescription: nullableField(formData, "ogDescription"),
		ogImageUrl: nullableField(formData, "ogImageUrl"),
		readingMinutes: readingMinutes(contentMd),
		tableOfContents: nullableField(formData, "tableOfContents"),
	}
}

function revalidateBlog(slugs?: string | string[] | null) {
	revalidatePath("/admin/blog")
	revalidatePath("/admin/blog/new")
	revalidatePath("/blog")
	revalidatePath("/pt-br/guias")
	revalidatePath("/es/guias")
	revalidatePath("/sitemap.xml")
	const list = Array.isArray(slugs) ? slugs : slugs ? [slugs] : []
	list.forEach((slug) => {
		revalidatePath(`/blog/${slug}`)
		revalidatePath(`/pt-br/guias/${slug}`)
		revalidatePath(`/es/guias/${slug}`)
	})
}

function field(formData: FormData, name: string) {
	return String(formData.get(name) || "").trim()
}

function nullableField(formData: FormData, name: string) {
	return field(formData, name) || null
}

function numericField(formData: FormData, name: string) {
	const value = Number(formData.get(name))
	return Number.isFinite(value) && value > 0 ? value : null
}

function tagIds(formData: FormData) {
	return formData.getAll("tagIds").map(Number).filter((value) => Number.isFinite(value) && value > 0)
}

function normalizeStatus(value: string) {
	return postStatuses.includes(value) ? value as any : "draft"
}

function normalizeType(value: string) {
	return postTypes.includes(value) ? value as any : "guide"
}

function parseImportPayload(value: string): any | null {
	try {
		const parsed = JSON.parse(value)
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null
	} catch {
		return null
	}
}

function nullableImportString(value: unknown) {
	return typeof value === "string" && value.trim() ? value.trim() : null
}

function stringifyOptionalJson(value: unknown) {
	if (!value) return null
	return typeof value === "string" ? value : JSON.stringify(value)
}

async function upsertImportedCategory(category: any, locale: PublicLocale) {
	if (!category || typeof category !== "object") return null
	const key = slugKey(String(category.key || category.categoryKey || category.name || ""))
	const name = String(category.name || "").trim()
	if (!key || !name) return null
	const categoryRecord = await prisma.blogCategory.upsert({
		where: { key },
		create: { key, sortOrder: Number(category.sortOrder) || 0 },
		update: {},
	})
	await prisma.blogCategoryTranslation.upsert({
		where: { categoryId_locale: { categoryId: categoryRecord.id, locale } },
		create: {
			categoryId: categoryRecord.id,
			locale,
			name,
			slug: slugKey(String(category.slug || name)),
			description: nullableImportString(category.description),
		},
		update: {
			name,
			description: nullableImportString(category.description),
		},
	})
	return categoryRecord.id
}

async function upsertImportedTags(tags: any, locale: PublicLocale) {
	if (!Array.isArray(tags)) return []
	const ids: number[] = []
	for (const tag of tags) {
		if (!tag || typeof tag !== "object") continue
		const key = slugKey(String(tag.key || tag.name || ""))
		const name = String(tag.name || "").trim()
		if (!key || !name) continue
		const tagRecord = await prisma.blogTag.upsert({ where: { key }, create: { key }, update: {} })
		await prisma.blogTagTranslation.upsert({
			where: { tagId_locale: { tagId: tagRecord.id, locale } },
			create: { tagId: tagRecord.id, locale, name, slug: slugKey(String(tag.slug || name)) },
			update: { name },
		})
		ids.push(tagRecord.id)
	}
	return ids
}

function importedFilterBlocks(blocks: any, locale: PublicLocale) {
	if (!Array.isArray(blocks)) return []
	return blocks
		.filter((block) => block && typeof block === "object" && block.title && block.filterJson)
		.map((block, index) => ({
			key: nullableImportString(block.key),
			locale: nullableImportString(block.locale) || locale,
			title: String(block.title).trim(),
			description: nullableImportString(block.description),
			filterJson: typeof block.filterJson === "string" ? block.filterJson : JSON.stringify(block.filterJson),
			limit: Number(block.limit) || 8,
			sortOrder: Number(block.sortOrder) || index + 1,
			ctaLabel: nullableImportString(block.ctaLabel),
			ctaHref: nullableImportString(block.ctaHref),
			displayMode: nullableImportString(block.displayMode) || "cards",
			enabled: block.enabled !== false,
		}))
}

function importedFaqs(faqs: any, locale: PublicLocale) {
	if (!Array.isArray(faqs)) return []
	return faqs
		.filter((faq) => faq && typeof faq === "object" && faq.question && faq.answer)
		.map((faq, index) => ({
			locale: nullableImportString(faq.locale) || locale,
			question: String(faq.question).trim(),
			answer: String(faq.answer).trim(),
			sortOrder: Number(faq.sortOrder) || index + 1,
		}))
}

function importedProgramLinks(links: any) {
	if (!Array.isArray(links)) return []
	return links
		.map((link, index) => ({
			programId: Number(typeof link === "object" ? link.programId : link),
			label: typeof link === "object" ? nullableImportString(link.label) : null,
			sortOrder: Number(typeof link === "object" ? link.sortOrder : 0) || index + 1,
		}))
		.filter((link) => Number.isFinite(link.programId) && link.programId > 0)
}

function importedUniversityLinks(links: any) {
	if (!Array.isArray(links)) return []
	return links
		.map((link, index) => ({
			universityId: String(typeof link === "object" ? link.universityId : link || "").trim(),
			label: typeof link === "object" ? nullableImportString(link.label) : null,
			sortOrder: Number(typeof link === "object" ? link.sortOrder : 0) || index + 1,
		}))
		.filter((link) => link.universityId)
}

function slugKey(value: string) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

async function uniqueCategorySlug(name: string, locale: string) {
	let slug = slugKey(name)
	let suffix = 2
	while (await prisma.blogCategoryTranslation.findFirst({ where: { locale, slug }, select: { id: true } })) {
		slug = `${slugKey(name)}-${suffix++}`
	}
	return slug
}

async function uniqueTagSlug(name: string, locale: string) {
	let slug = slugKey(name)
	let suffix = 2
	while (await prisma.blogTagTranslation.findFirst({ where: { locale, slug }, select: { id: true } })) {
		slug = `${slugKey(name)}-${suffix++}`
	}
	return slug
}

async function uniqueTranslationKey(baseValue: string) {
	const baseKey = slugKey(baseValue) || randomUUID()
	let key = baseKey
	let suffix = 2
	while (await prisma.blogPost.findUnique({ where: { translationKey: key }, select: { id: true } })) {
		key = `${baseKey}-${suffix++}`
	}
	return key
}

export async function AdminBlogPage({ searchParams }: { searchParams?: BlogAdminSearchParams }) {
	const status = searchParams?.status || ""
	const selectedPostId = Number(searchParams?.post)
	const [posts, selectedPost, categories, tags] = await Promise.all([
		prisma.blogPost.findMany({
			where: status ? { status: normalizeStatus(status) } : undefined,
			include: { translations: true, category: { include: { translations: true } }, tags: { include: { tag: { include: { translations: true } } } } },
			orderBy: [{ updatedAt: "desc" }],
			take: 100,
		}),
		Number.isFinite(selectedPostId) && selectedPostId > 0
			? prisma.blogPost.findUnique({
				where: { id: selectedPostId },
				include: {
					translations: true,
					category: { include: { translations: true } },
					tags: { include: { tag: { include: { translations: true } } } },
					programLinks: { include: { program: { include: { university: true } } }, orderBy: { sortOrder: "asc" } },
					universityLinks: { include: { university: true }, orderBy: { sortOrder: "asc" } },
					filterBlocks: { orderBy: { sortOrder: "asc" } },
					faqs: { orderBy: { sortOrder: "asc" } },
				},
			})
			: null,
		prisma.blogCategory.findMany({ include: { translations: true }, orderBy: [{ sortOrder: "asc" }, { key: "asc" }] }),
		prisma.blogTag.findMany({ include: { translations: true }, orderBy: { key: "asc" } }),
	])

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<AdminHeader />
					<div className="row g-4 align-items-start">
						<div className="col-lg-4">
							<Panel eyebrow="Create" title="New blog post">
								<BlogCreateForm categories={categories} tags={tags} />
							</Panel>
							<Panel eyebrow="Taxonomy" title="Categories and tags">
								<TaxonomyForms />
							</Panel>
						</div>
						<div className="col-lg-8">
							<Panel eyebrow="Posts" title={selectedPost ? "Edit blog post" : "Blog library"} actions={<PostFilters />}>
								{selectedPost ? (
									<PostEditor post={selectedPost} categories={categories} tags={tags} />
								) : (
									<PostList posts={posts} />
								)}
							</Panel>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}

export function PostEditor({ post, categories, tags }: { post: any; categories: any[]; tags: any[] }) {
	const primaryTranslation = post.translations[0]
	const selectedTagIds = new Set<number>(post.tags.map((tag: any) => Number(tag.tagId)))
	const coverImages = studyCoverImages()
	return (
		<div className="d-grid gap-5">
			<div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
				<div>
					<p className="fs-7 text-uppercase mb-1">Translation key: {post.translationKey}</p>
					<p className="mb-0">{post.translations.length} translation(s) · {post.status}</p>
				</div>
				<div className="d-flex gap-2">
					<Link href="/admin/blog" className="btn btn-outline-secondary">Back to posts</Link>
					{post.status === "published" && primaryTranslation && (
						<Link href={blogPostPath(primaryTranslation.slug, blogLocale(primaryTranslation.locale))} className="btn btn-primary">View post</Link>
					)}
				</div>
			</div>
			<form action={updateBlogPostSettings} className="row g-3 border rounded-3 p-4">
				<input type="hidden" name="id" value={post.id} />
				<TextInput label="Translation key" name="translationKeyDisplay" value={post.translationKey} className="col-12" />
				<SelectInput label="Status" name="status" value={post.status} options={postStatuses} className="col-md-3" />
				<SelectInput label="Type" name="type" value={post.type} options={postTypes} className="col-md-3" />
				<SelectCategory categories={categories} value={post.categoryId} className="col-md-6" />
				<TextInput label="Author" name="authorName" value={post.authorName} className="col-md-6" />
				<SelectCoverImage images={coverImages} value={post.coverImageUrl} className="col-md-6" />
				<TextInput label="Cover alt" name="coverImageAlt" value={post.coverImageAlt} className="col-12" />
				<div className="col-12 d-flex gap-4">
					<Checkbox label="Featured" name="featured" checked={post.featured} />
					<Checkbox label="Noindex" name="noindex" checked={post.noindex} />
				</div>
				<TagCheckboxes tags={tags} selectedTagIds={selectedTagIds} />
				<div className="col-12"><button className="btn btn-primary">Save settings</button></div>
			</form>
			<div className="row g-4">
				{locales.map((locale) => {
					const translation = post.translations.find((item: any) => item.locale === locale)
					return <TranslationForm key={locale} postId={post.id} locale={locale} translation={translation} />
				})}
			</div>
			<RelationForms post={post} />
		</div>
	)
}

export function BlogCreateForm({ categories, tags }: { categories: any[]; tags: any[] }) {
	const coverImages = studyCoverImages()
	return (
		<form action={createBlogPost} className="row g-3">
			<TextInput label="Translation key" name="translationKey" value="find-english-taught-masters-germany" className="col-md-6" />
			<SelectInput label="Locale" name="locale" value="pt-br" options={locales} className="col-md-3" />
			<SelectInput label="Status" name="status" value="draft" options={postStatuses} className="col-md-3" />
			<TextInput label="Slug" name="slug" value="como-encontrar-mestrado-na-alemanha-em-ingles" className="col-12" />
			<TextInput label="Title" name="title" value="Como encontrar mestrado na Alemanha em inglês" className="col-12" required />
			<TextArea label="Excerpt" name="excerpt" className="col-12" rows={3} />
			<TextArea label="Content markdown" name="contentMd" className="col-12" rows={8} required />
			<TextInput label="Author" name="authorName" value={DEFAULT_BLOG_AUTHOR} className="col-md-4" />
			<SelectInput label="Type" name="type" value="guide" options={postTypes} className="col-md-6" />
			<SelectCategory categories={categories} className="col-md-6" />
			<SelectCoverImage images={coverImages} value={coverImages[0] || "/images/blog/masters-germany-english.webp"} className="col-md-6" />
			<TextInput label="Cover alt" name="coverImageAlt" value="Estudante pesquisando programas de mestrado em inglês na Alemanha" className="col-md-6" />
			<div className="col-12 d-flex gap-4">
				<Checkbox label="Featured" name="featured" checked />
				<Checkbox label="Noindex" name="noindex" />
			</div>
			<TagCheckboxes tags={tags} selectedTagIds={new Set<number>()} />
			<TextInput label="SEO title" name="seoTitle" className="col-12" />
			<TextArea label="SEO description" name="seoDescription" className="col-12" rows={3} />
			<TextInput label="SEO keywords" name="seoKeywords" className="col-12" />
			<TextInput label="OG title" name="ogTitle" className="col-md-6" />
			<TextInput label="OG image URL" name="ogImageUrl" className="col-md-6" />
			<TextArea label="OG description" name="ogDescription" className="col-12" rows={3} />
			<div className="col-12 pt-4 border-top">
				<h5 className="text-primary mb-0">Initial featured/filter block</h5>
			</div>
			<TextInput label="Block key" name="filterBlockKey" value="masters-english-germany" className="col-md-4" />
			<SelectInput label="Block locale" name="filterBlockLocale" value="pt-br" options={["", ...locales]} className="col-md-2" />
			<TextInput label="Block order" name="filterBlockSortOrder" value="1" className="col-md-2" />
			<TextInput label="Block limit" name="filterBlockLimit" value="6" className="col-md-2" />
			<SelectInput label="Display mode" name="filterBlockDisplayMode" value="cards" options={["cards", "list"]} className="col-md-2" />
			<TextInput label="Block title" name="filterBlockTitle" value="Mestrados em inglês na Alemanha" className="col-12" />
			<TextInput label="Block description" name="filterBlockDescription" value="Veja programas de mestrado na Alemanha ministrados em inglês e compare opções por área, universidade, cidade e custo." className="col-12" />
			<TextArea label="Filter JSON" name="filterBlockJson" value='{"country":["Germany"],"degreeLevel":["Master"],"languageOfInstruction":["English"]}' className="col-12" rows={3} />
			<TextInput label="CTA label" name="filterBlockCtaLabel" value="Ver todos os mestrados em inglês na Alemanha" className="col-md-6" />
			<TextInput label="CTA href" name="filterBlockCtaHref" value="/pt-br/cursos?country=Germany&degreeLevel=Master&languageOfInstruction=English" className="col-md-6" />
			<div className="col-12 d-flex gap-4">
				<Checkbox label="Filter block enabled" name="filterBlockEnabled" checked />
			</div>
			<div className="col-12"><button className="btn btn-primary">Create post</button></div>
		</form>
	)
}

export function BlogJsonImportForm() {
	return (
		<form action={importSingleLocaleBlogPost} className="row g-3">
			<div className="col-12">
				<p className="mb-3">
					Paste one JSON object for one language variant. It creates the post, translation, category, tags, FAQs, related links, and SSR filter blocks in one click.
				</p>
			</div>
			<TextArea label="Single-language blog JSON" name="importJson" value={singleLocaleBlogImportExample} className="col-12" rows={28} required />
			<div className="col-12"><button className="btn btn-primary">Import blog post</button></div>
		</form>
	)
}

const singleLocaleBlogImportExample = `{
  "translationKey": "find-english-taught-masters-germany",
  "locale": "pt-br",
  "slug": "como-encontrar-mestrado-na-alemanha-em-ingles",
  "title": "Como encontrar mestrado na Alemanha em inglês",
  "authorName": "Yaroslav Vynnychuk",
  "status": "draft",
  "type": "guide",
  "featured": true,
  "noindex": false,
  "coverImageUrl": "",
  "coverImageAlt": "Estudante pesquisando programas de mestrado em inglês na Alemanha",
  "seoTitle": "Como encontrar mestrado na Alemanha em inglês",
  "seoDescription": "Aprenda a filtrar mestrados em inglês na Alemanha por idioma, custo, requisitos, universidade e prazo para montar uma shortlist realista.",
  "seoKeywords": "mestrado na Alemanha, mestrado em inglês, universidades alemãs",
  "ogTitle": "Como encontrar mestrado na Alemanha em inglês",
  "ogDescription": "Um guia prático para brasileiros que querem encontrar mestrados em inglês na Alemanha e comparar opções realistas.",
  "ogImageUrl": "",
  "excerpt": "Um guia prático para brasileiros que querem encontrar mestrados em inglês na Alemanha sem se perder em rankings, listas enormes e promessas vagas de estudo gratuito.",
  "contentMd": "## 1. Comece definindo o tipo de mestrado que você procura\\n\\nEscreva o artigo em Markdown aqui.\\n\\n- Use listas\\n- Use links internos\\n- Use subtítulos",
  "category": {
    "key": "study-guides",
    "name": "Guias de estudo",
    "slug": "guias-de-estudo",
    "description": "Guias práticos sobre cursos, universidades, candidatura, custos e planejamento para estudar na Alemanha, Áustria e Suíça."
  },
  "tags": [
    { "key": "germany", "name": "Alemanha", "slug": "alemanha" },
    { "key": "masters", "name": "Mestrado", "slug": "mestrado" },
    { "key": "english-taught", "name": "Programas em inglês", "slug": "programas-em-ingles" }
  ],
  "filterBlocks": [
    {
      "key": "masters-english-germany",
      "locale": "pt-br",
      "sortOrder": 1,
      "title": "Mestrados em inglês na Alemanha",
      "description": "Veja programas de mestrado na Alemanha ministrados em inglês e compare opções por área, universidade, cidade e custo.",
      "filterJson": {
        "country": ["Germany"],
        "degreeLevel": ["Master"],
        "languageOfInstruction": ["English"]
      },
      "limit": 6,
      "ctaLabel": "Ver todos os mestrados em inglês na Alemanha",
      "ctaHref": "/pt-br/cursos?country=Germany&degreeLevel=Master&languageOfInstruction=English",
      "displayMode": "cards",
      "enabled": true
    }
  ],
  "faqs": [
    {
      "question": "É possível fazer mestrado na Alemanha em inglês?",
      "answer": "Sim. Muitas universidades alemãs oferecem programas de mestrado totalmente ou parcialmente em inglês.",
      "sortOrder": 1
    }
  ],
  "programLinks": [],
  "universityLinks": []
}`

function TranslationForm({ postId, locale, translation }: { postId: number; locale: PublicLocale; translation?: any }) {
	return (
		<div className="col-12">
			<form action={upsertTranslation} className="row g-3 border rounded-3 p-4">
				<input type="hidden" name="postId" value={postId} />
				<input type="hidden" name="locale" value={locale} />
				{translation && <input type="hidden" name="translationId" value={translation.id} />}
				<div className="col-12"><h5 className="mb-0">{translation ? "Edit" : "Add"} {locale} translation</h5></div>
				<TextInput label="Title" name="title" value={translation?.title} className="col-md-6" required />
				<TextInput label="Current slug" name="currentSlug" value={translation?.slug} className="col-md-6" />
				<TextArea label="Excerpt" name="excerpt" value={translation?.excerpt} className="col-12" rows={3} />
				<TextArea label="Content markdown" name="contentMd" value={translation?.contentMd} className="col-12" rows={10} required />
				<TextInput label="SEO title" name="seoTitle" value={translation?.seoTitle} className="col-md-6" />
				<TextInput label="SEO keywords" name="seoKeywords" value={translation?.seoKeywords} className="col-md-6" />
				<TextArea label="SEO description" name="seoDescription" value={translation?.seoDescription} className="col-12" rows={3} />
				<TextInput label="OG title" name="ogTitle" value={translation?.ogTitle} className="col-md-6" />
				<TextInput label="OG image URL" name="ogImageUrl" value={translation?.ogImageUrl} className="col-md-6" />
				<TextArea label="OG description" name="ogDescription" value={translation?.ogDescription} className="col-12" rows={3} />
				<TextArea label="Table of contents JSON" name="tableOfContents" value={translation?.tableOfContents} className="col-12" rows={3} />
				<div className="col-12"><button className="btn btn-primary">{translation ? "Save translation" : "Add translation"}</button></div>
			</form>
		</div>
	)
}

function RelationForms({ post }: { post: any }) {
	return (
		<div className="row g-4">
			<div className="col-lg-6">
				<Panel eyebrow="Links" title="Related programs">
					{post.programLinks.map((link: any) => <RelationRow key={link.id} postId={post.id} id={link.id} type="program" label={`${link.programId}: ${link.label || link.program.programName}`} />)}
					<form action={attachProgram} className="row g-2 mt-3">
						<input type="hidden" name="postId" value={post.id} />
						<TextInput label="Program ID" name="programId" className="col-md-4" />
						<TextInput label="Label" name="label" className="col-md-5" />
						<TextInput label="Order" name="sortOrder" className="col-md-3" />
						<div className="col-12"><button className="btn btn-outline-secondary">Attach program</button></div>
					</form>
				</Panel>
			</div>
			<div className="col-lg-6">
				<Panel eyebrow="Links" title="Related universities">
					{post.universityLinks.map((link: any) => <RelationRow key={link.id} postId={post.id} id={link.id} type="university" label={`${link.universityId}: ${link.label || link.university.name}`} />)}
					<form action={attachUniversity} className="row g-2 mt-3">
						<input type="hidden" name="postId" value={post.id} />
						<TextInput label="University ID" name="universityId" className="col-md-4" />
						<TextInput label="Label" name="label" className="col-md-5" />
						<TextInput label="Order" name="sortOrder" className="col-md-3" />
						<div className="col-12"><button className="btn btn-outline-secondary">Attach university</button></div>
					</form>
				</Panel>
			</div>
			<div className="col-12">
				<Panel eyebrow="SSR previews" title="Filter blocks">
					{post.filterBlocks.map((block: any) => <RelationRow key={block.id} postId={post.id} id={block.id} type="filter" label={`${block.title}: ${block.filterJson}`} />)}
					<form action={addFilterBlock} className="row g-2 mt-3">
						<input type="hidden" name="postId" value={post.id} />
						<TextInput label="Key" name="key" className="col-md-4" />
						<SelectInput label="Locale" name="locale" value="" options={["", ...locales]} className="col-md-2" />
						<TextInput label="Order" name="sortOrder" value="0" className="col-md-2" />
						<TextInput label="Limit" name="limit" value="8" className="col-md-2" />
						<SelectInput label="Display" name="displayMode" value="cards" options={["cards", "list"]} className="col-md-2" />
						<TextInput label="Title" name="title" className="col-md-5" required />
						<TextInput label="Description" name="description" className="col-md-7" />
						<TextArea label="Filter JSON" name="filterJson" value='{"degreeLevel":"Master","country":"Germany"}' className="col-12" rows={3} />
						<TextInput label="CTA label" name="ctaLabel" className="col-md-6" />
						<TextInput label="CTA href" name="ctaHref" className="col-md-6" />
						<div className="col-12 d-flex gap-4">
							<Checkbox label="Enabled" name="enabled" checked />
						</div>
						<div className="col-12"><button className="btn btn-outline-secondary">Add filter block</button></div>
					</form>
				</Panel>
			</div>
			<div className="col-12">
				<Panel eyebrow="FAQ" title="Blog post FAQs">
					{post.faqs?.map((faq: any) => <RelationRow key={faq.id} postId={post.id} id={faq.id} type="faq" label={`${faq.locale || "all"}: ${faq.question}`} />)}
					<form action={addFaq} className="row g-2 mt-3">
						<input type="hidden" name="postId" value={post.id} />
						<SelectInput label="Locale" name="locale" value="" options={["", ...locales]} className="col-md-2" />
						<TextInput label="Order" name="sortOrder" value="0" className="col-md-2" />
						<TextInput label="Question" name="question" className="col-md-8" required />
						<TextArea label="Answer" name="answer" className="col-12" rows={4} required />
						<div className="col-12"><button className="btn btn-outline-secondary">Add FAQ</button></div>
					</form>
				</Panel>
			</div>
		</div>
	)
}

function RelationRow({ postId, id, type, label }: { postId: number; id: number; type: string; label: string }) {
	return (
		<form action={deleteBlogRelation} className="d-flex align-items-center justify-content-between gap-3 border-bottom py-2">
			<input type="hidden" name="postId" value={postId} />
			<input type="hidden" name="id" value={id} />
			<input type="hidden" name="type" value={type} />
			<span>{label}</span>
			<button className="btn btn-outline-secondary btn-sm">Remove</button>
		</form>
	)
}

export function PostList({ posts }: { posts: any[] }) {
	if (!posts.length) {
		return <div className="empty-results"><h5>No blog posts yet</h5><p>Create the first post from the new post page.</p></div>
	}
	return (
		<div className="admin-inquiry-list">
			{posts.map((post) => {
				const translation = post.translations[0]
				return (
					<Link href={`/admin/blog/${post.id}`} className="admin-inquiry-row" key={post.id}>
						<div>
							<span>{formatBlogDate(post.publishedAt)}</span>
							<strong>{translation?.title || `Post #${post.id}`}</strong>
							<p>{post.translations.map((item: any) => `${item.locale}: /${item.slug}`).join(" · ") || "No translations yet"}</p>
							<p>{translation?.excerpt || "No excerpt yet."}</p>
						</div>
						<div>
							<span className={`inquiry-status status-${post.status}`}>{post.status}</span>
							<p>{post.type}</p>
							<p>Updated: {formatBlogDate(post.updatedAt)}</p>
						</div>
						{post.coverImageUrl ? <img src={post.coverImageUrl} alt="" style={{ width: 150, height: 96, objectFit: "cover", borderRadius: 8 }} /> : <p>No cover</p>}
						<span className="btn-text text-primary">Edit</span>
					</Link>
				)
			})}
		</div>
	)
}

export function TaxonomyForms() {
	return (
		<div className="d-grid gap-4">
			<form action={createCategory} className="row g-2">
				<SelectInput label="Locale" name="locale" value="en" options={locales} className="col-md-4" />
				<TextInput label="Category key" name="key" className="col-md-8" />
				<TextInput label="Name" name="name" className="col-12" required />
				<TextArea label="Description" name="description" className="col-12" rows={2} />
				<div className="col-12"><button className="btn btn-outline-secondary">Create category</button></div>
			</form>
			<form action={createTag} className="row g-2">
				<SelectInput label="Locale" name="locale" value="en" options={locales} className="col-md-4" />
				<TextInput label="Tag key" name="key" className="col-md-8" />
				<TextInput label="Name" name="name" className="col-12" required />
				<div className="col-12"><button className="btn btn-outline-secondary">Create tag</button></div>
			</form>
		</div>
	)
}

export function AdminHeader({ title = "Blog posts" }: { title?: string }) {
	return (
		<div className="d-flex flex-wrap align-items-end justify-content-between gap-4 mb-6">
			<div>
				<span className="content-top btn-text fw-bold text-primary"><i className="ri-article-line text-green-3" />&nbsp; Mini admin</span>
				<h1 className="ds-3 text-primary mb-0">{title}</h1>
			</div>
			<div className="d-flex flex-wrap gap-2">
				<Link href="/admin" className="btn btn-outline-secondary">Program admin</Link>
				<Link href="/admin/data-quality" className="btn btn-outline-secondary">Data quality</Link>
				<Link href="/admin/program-review" className="btn btn-outline-secondary">Program review</Link>
				<Link href="/admin/inquiries" className="btn btn-outline-secondary">Inquiries</Link>
				<Link href="/admin/blog/new" className="btn btn-outline-secondary">New post</Link>
				<Link href="/blog" className="btn btn-primary">View blog</Link>
			</div>
		</div>
	)
}

export function PostFilters() {
	return (
		<div className="d-flex flex-wrap gap-2">
			<Link href="/admin/blog" className="btn btn-outline-secondary">All</Link>
			{postStatuses.map((status) => <Link href={`/admin/blog?status=${status}`} className="btn btn-outline-secondary" key={status}>{status}</Link>)}
		</div>
	)
}

export function Panel({ eyebrow, title, actions, children }: { eyebrow: string; title: string; actions?: ReactNode; children: ReactNode }) {
	return (
		<div className="admin-panel bg-white rounded-3 p-5 mb-4">
			<div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
				<div className="section-heading mb-0"><p>{eyebrow}</p><h2>{title}</h2></div>
				{actions}
			</div>
			{children}
		</div>
	)
}

function SelectCategory({ categories, value, className }: { categories: any[]; value?: number | null; className?: string }) {
	return (
		<label className={className}>
			<span className="fs-7 text-uppercase text-primary fw-bold">Category</span>
			<select className="form-control mt-1" name="categoryId" defaultValue={value || ""}>
				<option value="">No category</option>
				{categories.map((category) => <option key={category.id} value={category.id}>{category.translations[0]?.name || category.key}</option>)}
			</select>
		</label>
	)
}

function SelectCoverImage({ images, value, className }: { images: string[]; value?: string | null; className?: string }) {
	return (
		<label className={className}>
			<span className="fs-7 text-uppercase text-primary fw-bold">Featured image</span>
			<select className="form-control mt-1" name="coverImageUrl" defaultValue={value || ""}>
				<option value="">Random library image</option>
				{value && !images.includes(value) && <option value={value}>{value}</option>}
				{images.map((image) => <option value={image} key={image}>{image.split("/").pop()}</option>)}
			</select>
			{value && <img src={value} alt="" className="w-100 mt-3 rounded-3" style={{ maxHeight: 180, objectFit: "cover" }} />}
		</label>
	)
}

function TagCheckboxes({ tags, selectedTagIds }: { tags: any[]; selectedTagIds: Set<number> }) {
	return (
		<div className="col-12">
			<span className="fs-7 text-uppercase text-primary fw-bold">Tags</span>
			<div className="d-flex flex-wrap gap-3 mt-2">
				{tags.map((tag) => <Checkbox key={tag.id} label={tag.translations[0]?.name || tag.key} name="tagIds" value={String(tag.id)} checked={selectedTagIds.has(tag.id)} />)}
			</div>
		</div>
	)
}

function Checkbox({ label, name, value = "on", checked }: { label: string; name: string; value?: string; checked?: boolean }) {
	return <label className="d-inline-flex align-items-center gap-2"><input type="checkbox" name={name} value={value} defaultChecked={checked} /> {label}</label>
}

function SelectInput({ label, name, value, options, className }: { label: string; name: string; value?: string; options: readonly string[]; className?: string }) {
	return (
		<label className={className}>
			<span className="fs-7 text-uppercase text-primary fw-bold">{label}</span>
			<select className="form-control mt-1" name={name} defaultValue={value || ""}>
				{options.map((option) => <option value={option} key={option}>{option || "All locales"}</option>)}
			</select>
		</label>
	)
}

function TextInput({ label, name, value, className, required }: { label: string; name: string; value?: string | number | null; className?: string; required?: boolean }) {
	return (
		<label className={className}>
			<span className="fs-7 text-uppercase text-primary fw-bold">{label}</span>
			<input className="form-control mt-1" name={name} defaultValue={value || ""} required={required} />
		</label>
	)
}

function TextArea({ label, name, value, className, rows = 5, required }: { label: string; name: string; value?: string | null; className?: string; rows?: number; required?: boolean }) {
	return (
		<label className={className}>
			<span className="fs-7 text-uppercase text-primary fw-bold">{label}</span>
			<textarea className="form-control mt-1" name={name} rows={rows} defaultValue={value || ""} required={required} />
		</label>
	)
}
