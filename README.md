# astrax

## Sitemap publishing

The canonical site URL and sitemap index are both served from `https://studyindach.cc`:

```bash
NEXT_PUBLIC_SITE_URL=https://studyindach.cc
SITEMAP_BASE_URL=https://studyindach.cc
```

`npm run build` generates local sitemap XML in `public/` for the Next.js app, then the `postbuild` hook safely attempts to publish sitemap XML into the main Plesk public document root when it exists:

```text
/var/www/vhosts/studyindach.cc/httpdocs/public
```

Manual publish:

```bash
npm run sitemap:publish
```

The sitemap index is published at `/sitemap.xml`; child sitemap files are published under `/sitemaps/`, for example `/sitemaps/static.xml`, `/sitemaps/blog.xml`, `/sitemaps/universities.xml`, and `/sitemaps/programs-0001.xml`.

If auto-detection is not available, set `SITEMAP_OUTPUT_DIR` to the main public document root. URL entries inside child sitemaps, sitemap index file links, and `robots.txt` all stay on canonical `https://studyindach.cc/...` URLs.

Validate after publishing:

```bash
npm run sitemap:validate
```
