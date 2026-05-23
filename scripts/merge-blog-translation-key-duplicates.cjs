#!/usr/bin/env node
const { loadExternalEnv } = require("./load-external-env.cjs")

loadExternalEnv()

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
	const canonicalKey = process.argv[2]
	const duplicateKey = process.argv[3]
	if (!canonicalKey || !duplicateKey) {
		console.error("Usage: node scripts/merge-blog-translation-key-duplicates.cjs <canonicalKey> <duplicateKey>")
		process.exit(1)
	}

	const [canonical, duplicate] = await Promise.all([
		prisma.blogPost.findUnique({
			where: { translationKey: canonicalKey },
			include: {
				translations: true,
				tags: true,
				filterBlocks: true,
				faqs: true,
				programLinks: true,
				universityLinks: true,
			},
		}),
		prisma.blogPost.findUnique({
			where: { translationKey: duplicateKey },
			include: {
				translations: true,
				tags: true,
				filterBlocks: true,
				faqs: true,
				programLinks: true,
				universityLinks: true,
			},
		}),
	])

	if (!canonical) throw new Error(`Canonical post not found: ${canonicalKey}`)
	if (!duplicate) throw new Error(`Duplicate post not found: ${duplicateKey}`)

	await prisma.$transaction(async (tx) => {
		for (const translation of duplicate.translations) {
			await tx.blogPostTranslation.upsert({
				where: { postId_locale: { postId: canonical.id, locale: translation.locale } },
				create: {
					postId: canonical.id,
					locale: translation.locale,
					slug: translation.slug,
					title: translation.title,
					excerpt: translation.excerpt,
					contentMd: translation.contentMd,
					contentHtml: translation.contentHtml,
					seoTitle: translation.seoTitle,
					seoDescription: translation.seoDescription,
					seoKeywords: translation.seoKeywords,
					ogTitle: translation.ogTitle,
					ogDescription: translation.ogDescription,
					ogImageUrl: translation.ogImageUrl,
					readingMinutes: translation.readingMinutes,
					tableOfContents: translation.tableOfContents,
				},
				update: {
					slug: translation.slug,
					title: translation.title,
					excerpt: translation.excerpt,
					contentMd: translation.contentMd,
					contentHtml: translation.contentHtml,
					seoTitle: translation.seoTitle,
					seoDescription: translation.seoDescription,
					seoKeywords: translation.seoKeywords,
					ogTitle: translation.ogTitle,
					ogDescription: translation.ogDescription,
					ogImageUrl: translation.ogImageUrl,
					readingMinutes: translation.readingMinutes,
					tableOfContents: translation.tableOfContents,
				},
			})
		}

		const canonicalTagIds = new Set(canonical.tags.map((tag) => tag.tagId))
		const missingTags = duplicate.tags.filter((tag) => !canonicalTagIds.has(tag.tagId))
		if (missingTags.length) {
			await tx.blogPostTag.createMany({
				data: missingTags.map((tag) => ({ postId: canonical.id, tagId: tag.tagId })),
			})
		}

		for (const block of duplicate.filterBlocks) {
			await tx.blogPostFilterBlock.create({
				data: {
					postId: canonical.id,
					key: block.key,
					locale: block.locale,
					title: block.title,
					description: block.description,
					filterJson: block.filterJson,
					limit: block.limit,
					sortOrder: block.sortOrder,
					ctaLabel: block.ctaLabel,
					ctaHref: block.ctaHref,
					displayMode: block.displayMode,
					enabled: block.enabled,
				},
			})
		}

		for (const faq of duplicate.faqs) {
			await tx.blogPostFaq.create({
				data: {
					postId: canonical.id,
					locale: faq.locale,
					question: faq.question,
					answer: faq.answer,
					sortOrder: faq.sortOrder,
				},
			})
		}

		const canonicalProgramIds = new Set(canonical.programLinks.map((link) => link.programId))
		const missingProgramLinks = duplicate.programLinks.filter((link) => !canonicalProgramIds.has(link.programId))
		if (missingProgramLinks.length) {
			await tx.blogPostProgramLink.createMany({
				data: missingProgramLinks.map((link) => ({
					postId: canonical.id,
					programId: link.programId,
					sortOrder: link.sortOrder,
					label: link.label,
				})),
			})
		}

		const canonicalUniversityIds = new Set(canonical.universityLinks.map((link) => link.universityId))
		const missingUniversityLinks = duplicate.universityLinks.filter((link) => !canonicalUniversityIds.has(link.universityId))
		if (missingUniversityLinks.length) {
			await tx.blogPostUniversityLink.createMany({
				data: missingUniversityLinks.map((link) => ({
					postId: canonical.id,
					universityId: link.universityId,
					sortOrder: link.sortOrder,
					label: link.label,
				})),
			})
		}

		await tx.blogPost.update({
			where: { id: canonical.id },
			data: {
				authorName: canonical.authorName || duplicate.authorName,
				coverImageUrl: canonical.coverImageUrl || duplicate.coverImageUrl,
				coverImageAlt: canonical.coverImageAlt || duplicate.coverImageAlt,
				categoryId: canonical.categoryId || duplicate.categoryId,
				featured: canonical.featured || duplicate.featured,
				noindex: canonical.noindex && duplicate.noindex,
			},
		})

		await tx.blogPost.delete({ where: { id: duplicate.id } })
	})

	console.log(`Merged ${duplicateKey} into ${canonicalKey}.`)
}

main()
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
