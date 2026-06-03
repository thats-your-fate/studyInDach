import type { MetadataRoute } from "next"

const sitemapBaseUrl = process.env.SITEMAP_BASE_URL || "https://sitemap.studyindach.cc"

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/admin"],
		},
		sitemap: new URL("/sitemap.xml", sitemapBaseUrl).toString(),
	}
}
