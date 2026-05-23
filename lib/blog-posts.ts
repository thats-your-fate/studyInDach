import { prisma } from "@/lib/prisma"
import fs from "fs"
import path from "path"

const BLOG_IMAGE_DIR = path.join(process.cwd(), "public", "assets", "imgs", "study-dach-pics")
const BLOG_IMAGE_PUBLIC_DIR = "/assets/imgs/study-dach-pics"

export const publishedBlogWhere = {
	status: "published",
	publishedAt: { not: null },
}

export function slugifyBlogTitle(title: string) {
	const slug = title
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 90)

	return slug || "blog-post"
}

export async function uniqueBlogSlug(title: string, currentPostId?: number) {
	const baseSlug = slugifyBlogTitle(title)
	let slug = baseSlug
	let suffix = 2

	while (await prisma.blogPost.findFirst({
		where: {
			slug,
			...(currentPostId ? { id: { not: currentPostId } } : {}),
		},
		select: { id: true },
	})) {
		slug = `${baseSlug}-${suffix}`
		suffix += 1
	}

	return slug
}

export function randomStudyCoverImage() {
	try {
		const files = fs.readdirSync(BLOG_IMAGE_DIR)
			.filter((file) => /\.(avif|webp|jpg|jpeg|png)$/i.test(file))
			.sort()

		if (!files.length) return null
		const file = files[Math.floor(Math.random() * files.length)]
		return `${BLOG_IMAGE_PUBLIC_DIR}/${file}`
	} catch {
		return null
	}
}

export function formatBlogDate(value: Date | null) {
	if (!value) return "Draft"
	return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(value)
}

export function paragraphsFromContent(content: string) {
	return content
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean)
}
