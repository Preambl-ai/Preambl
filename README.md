# Preambl — website

Vite + React + TypeScript. three.js via @react-three/fiber, drei and postprocessing. GSAP ScrollTrigger + Lenis for the scroll-scrubbed hero.

## Development

```sh
npm ci
npm run dev
npm run build
npm run preview
```

## Search discovery and icons

The production origin is **https://www.preambl.dev**. Titles, descriptions, and the origin are configured in `src/data/site.json`.

The build generates home and products HTML containing readable initial content, route-specific metadata, canonical URLs, and Organization/WebSite JSON-LD. React replaces the initial content when it starts; the animated site remains interactive. It also generates `robots.txt` and `sitemap.xml`. `vercel.json` serves the products HTML on direct visits. In-app navigation updates the page metadata.

The approved logo is the cream eight-bar mark on its copper silk background. `public/preambl-logo.svg` preserves the existing 1024-viewBox source, with vector bars and an embedded raster background. The background itself is 128 × 128 pixels; the SVG keeps the bars sharp but does not make the texture a high-resolution vector. This is the highest-quality matching source located in the repository and local assets inspected. The screenshot is not used as the master.

The header, footer, favicon, touch/app icons, structured-data logo, and link previews use this logo. A 1024 × 1024 PNG export is supplied as `public/preambl-logo-1024.png`. To regenerate raster exports without redesigning the source, install Pillow and run `python scripts/generate-icons.py`.

### After merging and deploying

1. Check `/`, `/products`, `/robots.txt`, `/sitemap.xml`, and `/favicon-96.png` on the production domain. Confirm that the pages and icons are publicly accessible and the deployment does not add `noindex` headers.
2. An owner should verify `https://www.preambl.dev/` in [Google Search Console](https://search.google.com/search-console). A URL-prefix property can be used for the exact hostname; a domain property requires DNS verification. Verification credentials are not included in this repository.
3. Submit `https://www.preambl.dev/sitemap.xml`, inspect the homepage and products URLs, and request indexing. Check Google's rendered page and indexing status.
4. Allow time for recrawling. Search-result icons can take days or weeks to refresh. Browser favicon caches may also retain the previous icon.
5. Keep the site description and public organization profiles consistent. If the production domain changes, update the shared configuration and the default metadata in `index.html`, then rebuild and update Search Console.

These changes improve crawlability and identification; they cannot guarantee indexing, ranking, a search-result favicon, or inclusion in Gemini responses. Google Search AI features and the Gemini app are different surfaces. This project does not submit the site directly to Gemini or claim an AI-specific ranking mechanism.

Google documents [favicon eligibility](https://developers.google.com/search/docs/appearance/favicon-in-search), [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization), and [search AI discovery guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide). Google says special AI text files such as `llms.txt` are not required for its search visibility.

