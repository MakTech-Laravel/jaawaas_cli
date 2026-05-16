"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { getApiErrorMessage } from "@/lib/api/errors"

interface ArticleData {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  tags: string[]
  author: string
  is_featured: boolean
  status: string
  published_at: string | null
  views: number
  image_url: string | null
  category?: { id: number; name: string }
}

export default function BlogArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slugParam = params?.slug
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slugParam) return
    const slug = decodeURIComponent(String(slugParam))

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const res = await apiClient.get(`/articles/${encodeURIComponent(slug)}`)
        const data = res.data?.data ?? null
        if (data) {
          if (!cancelled) setArticle(mapData(data))
          if (!cancelled) setLoading(false)
          return
        }
      } catch (err: any) {
        // If backend returns 404 for direct fetch, continue to fallback.
        if (err?.response?.status !== 404) {
          if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load article'))
          if (!cancelled) setLoading(false)
          return
        }
      }

      // Fallback: fetch list and match by slug (case-insensitive)
      try {
        const listRes = await apiClient.get('/articles')
        const list = Array.isArray(listRes.data?.data) ? listRes.data.data : []
        const found = list.find((a: any) => String(a.slug).toLowerCase() === String(slug).toLowerCase())
        if (found) {
          if (!cancelled) setArticle(mapData(found))
        } else {
          if (!cancelled) setError('Article not found.')
        }
      } catch (err: any) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load article'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [slugParam])

  function mapData(data: any): ArticleData {
    return {
      id: Number(data.id),
      title: String(data.title || ""),
      slug: String(data.slug || ""),
      excerpt: String(data.excerpt || ""),
      content: String(data.content || ""),
      tags: Array.isArray(data.tags) ? data.tags.map((t: any) => String(t)) : [],
      author: String(data.author || (data.creator?.first_name ? `${data.creator.first_name} ${data.creator.last_name}` : "")),
      is_featured: Boolean(data.is_featured),
      status: String(data.status || ""),
      published_at: data.published_at ?? data.publishedAt ?? null,
      views: Number(data.views) || 0,
      image_url: data.image_url ?? data.imageUrl ?? null,
      category: data.category ? { id: Number(data.category.id), name: String(data.category.name) } : undefined
    }
  }

  const formatDate = (iso?: string | null) => {
    if (!iso) return ""
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    } catch {
      return String(iso)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">Loading article...</div>
          ) : error ? (
            <div className="text-center text-destructive py-20">{error}</div>
          ) : !article ? (
            <div className="text-center py-20">Article not found.</div>
          ) : (
            <article className="prose prose-lg mx-auto">
              <header className="mb-6">
                {article.category && (
                  <Badge variant="secondary">{article.category.name}</Badge>
                )}
                <h1 className="mt-4 text-3xl font-serif font-medium">{article.title}</h1>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><User className="h-4 w-4" />{article.author}</span>
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(article.published_at)}</span>
                  <span>{article.views.toLocaleString()} views</span>
                </div>
              </header>

              {article.image_url && (
                <div className="mb-6 w-full overflow-hidden rounded-lg bg-muted relative h-64 sm:h-80 lg:h-96">
                  <img src={article.image_url} alt={article.title} className="absolute inset-0 h-full w-full object-cover" />
                </div>
              )}

              <section>
                <p className="lead">{article.excerpt}</p>
                <div className="mt-6" dangerouslySetInnerHTML={{ __html: article.content }} />
              </section>

              {article.tags && article.tags.length > 0 && (
                <footer className="mt-8">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((t) => (
                      <Badge key={t} variant="outline">{t}</Badge>
                    ))}
                  </div>
                </footer>
              )}
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
