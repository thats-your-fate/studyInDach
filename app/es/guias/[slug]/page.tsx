import BlogDetailPage, { getPublishedBlogPost, localizedBlogPostUrl } from "@/components/blog/BlogDetailPage"
import { blogPostLanguageAlternates } from "@/lib/blog-posts"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

type BlogDetailsProps = {
	params: { slug: string }
}

export async function generateMetadata({ params }: BlogDetailsProps): Promise<Metadata> {
	const post = await getPublishedBlogPost(params.slug, "es")
	if (!post) return {}

	return {
		title: post.seoTitle || `${post.title} | Study in DACH`,
		description: post.seoDescription || post.excerpt || undefined,
		robots: post.post.noindex ? { index: false, follow: true } : undefined,
		alternates: {
			canonical: absoluteUrl(localizedBlogPostUrl(post.slug, "es")),
			languages: absoluteLanguageAlternates(post.post.translations),
		},
		openGraph: {
			title: post.ogTitle || post.seoTitle || post.title,
			description: post.ogDescription || post.seoDescription || post.excerpt || undefined,
			url: absoluteUrl(localizedBlogPostUrl(post.slug, "es")),
			images: post.ogImageUrl ? [post.ogImageUrl] : post.post.coverImageUrl ? [post.post.coverImageUrl] : undefined,
		},
	}
}

function absoluteLanguageAlternates(translations: Array<{ locale: string; slug: string }>) {
	const alternates = blogPostLanguageAlternates(translations)
	return Object.fromEntries(Object.entries(alternates).map(([key, value]) => [key, absoluteUrl(value)]))
}

export default function BlogDetailsEs({ params }: BlogDetailsProps) {
	return <BlogDetailPage slug={params.slug} locale="es" backLabel="Volver a las guías" />
}
