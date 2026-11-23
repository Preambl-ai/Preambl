import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import site from '@/data/site.json'

export default function PageMetadata() {
  const { pathname } = useLocation()

  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/'
    const route = Object.hasOwn(site.pages, path) ? path as keyof typeof site.pages : '/'
    const page = site.pages[route]

    document.title = page.title
    const values: Record<string, string> = {
      'meta[name="description"]': page.description,
      'meta[property="og:title"]': page.title,
      'meta[property="og:description"]': page.description,
      'meta[property="og:url"]': `${site.url}${route}`,
      'meta[name="twitter:title"]': page.title,
      'meta[name="twitter:description"]': page.description,
    }
    for (const [selector, content] of Object.entries(values)) {
      document.querySelector(selector)?.setAttribute('content', content)
    }
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${site.url}${route}`)
  }, [pathname])

  return null
}
