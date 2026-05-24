import BlogDetailPage, { getPublishedBlogPost } from "@/components/blog/BlogDetailPage"
import { getLocalizedBlogPostUrl, localizedBlogPostAlternates } from "@/lib/localized-urls"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

type BlogDetailsProps = {
	params: { slug: string }
}

export async function generateMetadata({ params }: BlogDetailsProps): Promise<Metadata> {
	const post = await getPublishedBlogPost(params.slug, "pt-br")
	if (!post) return {}
	const canonicalPath = await getLocalizedBlogPostUrl(post.post.translationKey, "pt-br")
	const languageAlternates = await absoluteLanguageAlternates(post.post.translationKey)

	return {
		title: post.seoTitle || `${post.title} | Study in DACH`,
		description: post.seoDescription || post.excerpt || undefined,
		robots: post.post.noindex ? { index: false, follow: true } : undefined,
		alternates: {
			canonical: absoluteUrl(canonicalPath),
			languages: languageAlternates,
		},
		openGraph: {
			title: post.ogTitle || post.seoTitle || post.title,
			description: post.ogDescription || post.seoDescription || post.excerpt || undefined,
			url: absoluteUrl(canonicalPath),
			images: post.ogImageUrl ? [post.ogImageUrl] : post.post.coverImageUrl ? [post.post.coverImageUrl] : undefined,
		},
	}
}

async function absoluteLanguageAlternates(translationKey: string) {
	const alternates = await localizedBlogPostAlternates(translationKey)
	return Object.fromEntries(Object.entries(alternates).map(([key, value]) => [key, absoluteUrl(value)]))
}

export default function BlogDetailsPt({ params }: BlogDetailsProps) {
	return <BlogDetailPage slug={params.slug} locale="pt-br" backLabel="Voltar aos guias" />
}
