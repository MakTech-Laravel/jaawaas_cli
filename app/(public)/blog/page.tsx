"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, User } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { getApiErrorMessage } from "@/lib/api/errors"

interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  category: { name: string }
  tags: string[]
  author: string
  is_featured: boolean
  status: string
  published_at: string
  views: number
  image_url: string | null
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  async function fetchArticles() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get("/articles")
      const list = Array.isArray(res.data?.data) ? res.data.data : []
      
      // Filter for published articles only
      const published = list.filter((a: any) => a.status === "published")
      
      setArticles(published)
      
      // Extract unique categories
      const cats = Array.from(new Set(
        published
          .map((a: any) => a.category?.name)
          .filter((name: any) => name)
      )) as string[]
      
      setCategories(["All", ...cats])
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load articles"))
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = selectedCategory === "All"
    ? articles
    : articles.filter(a => a.category?.name === selectedCategory)

  const featuredArticles = filteredArticles.filter(a => a.is_featured)
  const regularArticles = filteredArticles.filter(a => !a.is_featured)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-medium tracking-tight text-primary-foreground sm:text-5xl">
                Insights & Resources
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Expert knowledge on global sourcing, manufacturing trends, supply chain strategies, and international trade best practices for procurement professionals.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    category === selectedCategory
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-gray-300 animate-spin mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading articles...</p>
            </div>
          </section>
        ) : error ? (
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          </section>
        ) : filteredArticles.length === 0 ? (
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-muted-foreground">No articles found in this category.</p>
            </div>
          </section>
        ) : (
          <>
            {/* Featured Post */}
            {featuredArticles.length > 0 && (
              <section className="py-12 lg:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  {featuredArticles.map((featured) => (
                    <Link
                      key={featured.id}
                      href={`/blog/${featured.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg"
                    >
                      <div className="grid lg:grid-cols-2">
                        {featured.image_url && (
                          <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-muted">
                            <img 
                              src={featured.image_url} 
                              alt={featured.title}
                              className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-8 lg:p-12">
                          <Badge variant="secondary">{featured.category?.name}</Badge>
                          <h2 className="mt-4 font-serif text-2xl font-medium text-foreground group-hover:text-secondary lg:text-3xl">
                            {featured.title}
                          </h2>
                          <p className="mt-4 text-muted-foreground leading-relaxed">
                            {featured.excerpt}
                          </p>
                          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {featured.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(featured.published_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              {featured.views.toLocaleString()} views
                            </span>
                          </div>
                          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-secondary">
                            Read article
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Posts Grid */}
            <section className="pb-20 lg:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  {featuredArticles.length > 0 ? "More Articles" : "Latest Articles"}
                </h2>
                
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {regularArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg"
                    >
                      {article.image_url && (
                              <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden bg-muted">
                                <img 
                                  src={article.image_url} 
                                  alt={article.title}
                                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                              {!article.image_url && <div className="h-48 sm:h-56 lg:h-64 bg-muted" />}
                      <div className="flex flex-1 flex-col p-6">
                        <Badge variant="outline" className="w-fit">{article.category?.name}</Badge>
                        <h3 className="mt-3 font-semibold text-foreground group-hover:text-secondary line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{article.author}</span>
                          <span>•</span>
                          <span>{article.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
          </div>
        </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
