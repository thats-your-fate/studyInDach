# astrax

## Sitemap subdomain publishing

The canonical site URL remains `https://studyindach.cc`, while sitemap files can be published from the sitemap subdomain:

```bash
NEXT_PUBLIC_SITE_URL=https://studyindach.cc
SITEMAP_BASE_URL=https://sitemap.studyindach.cc
```

`npm run build` generates local sitemap XML in `public/` for the Next.js app, then the `postbuild` hook safely attempts to publish sitemap XML into the Plesk sitemap subdomain directory when it exists:

```text
/var/www/vhosts/studyindach.cc/sitemap.studyindach.cc
```

Manual publish:

```bash
npm run sitemap:publish
```

If auto-detection is not available, set `SITEMAP_OUTPUT_DIR` to the sitemap subdomain document root. URL entries inside child sitemaps stay canonical `https://studyindach.cc/...`; only sitemap index file links and `robots.txt` point to `https://sitemap.studyindach.cc`.
