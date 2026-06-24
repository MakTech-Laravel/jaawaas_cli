"use client"

import { Suspense } from "react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { getProducts, type Product } from "@/lib/api/products"
import { getPublicCategories, type BackendCategory } from "@/lib/api/categories"
import { ProductActionButtons } from "@/components/products/product-action-buttons"
import { countries as countryData } from "@/lib/data/countries"
import { getPublicSuppliers, type Supplier } from "@/lib/api/public-suppliers"



import { 
  Search, 
  Filter, 
  Package,
  ChevronRight,
  X,
  Factory,
  CheckCircle,
  Loader2,
  MapPin,
  ShieldCheck,
  Globe
} from "lucide-react"

function ProductsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  const moqRanges = useMemo(() => [
    { label: `< 100 ${t?.landing?.products?.pieces || "pieces"}`, value: "<100" },
    { label: `100 - 500 ${t?.landing?.products?.pieces || "pieces"}`, value: "100-500" },
    { label: `500 - 1000 ${t?.landing?.products?.pieces || "pieces"}`, value: "500-1000" },
    { label: `> 1000 ${t?.landing?.products?.pieces || "pieces"}`, value: ">1000" },
  ], [t])

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "all")
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(false)
  const [allCategories, setAllCategories] = useState<BackendCategory[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  // New Quick Filters states
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedMoq, setSelectedMoq] = useState<string>("")
  const [selectedCerts, setSelectedCerts] = useState<string[]>([])
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])

  // Get featured countries
  const featuredCountries = useMemo(() => {
    const featured = countryData.filter(c => c.featured)
    if (featured.length > 0) {
      return featured.slice(0, 8)
    }
    return countryData
      .filter(c => ["CN", "IN", "VN", "TH", "TR", "DE", "ID", "BD"].includes(c.code))
      .slice(0, 8)
  }, [])

  const [dynamicCertifications, setDynamicCertifications] = useState<string[]>([])
  const [dynamicExportMarkets, setDynamicExportMarkets] = useState<string[]>([])
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([])

  // Fetch global dynamic filters (certifications and markets) from suppliers
  useEffect(() => {
    const fetchGlobalFilters = async () => {
      const response = await getPublicSuppliers()
      if (response && response.data) {
        setAllSuppliers(response.data)
        const certSet = new Set<string>()
        const marketSet = new Set<string>()
        response.data.forEach(supplier => {
          if (supplier.certifications) {
            supplier.certifications.forEach(cert => certSet.add(cert))
          }
          if (supplier.export_markets) {
            supplier.export_markets.forEach(market => marketSet.add(market))
          }
        })
        setDynamicCertifications(Array.from(certSet).sort())
        setDynamicExportMarkets(Array.from(marketSet).sort())
      }
    }
    fetchGlobalFilters()
  }, [])

  // Reset page when category, search, sort or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, sortBy, selectedCountry, selectedMoq, selectedCerts, selectedMarkets])

  // Fetch all categories once
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getPublicCategories()
      if (response.success) {
        setAllCategories(response.data)
      }
    }
    fetchCategories()
  }, [])

  // Use the fetched categories for the dropdown
  const categories = useMemo(() => {
    const list = allCategories.map(c => ({ slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'), name: c.name }))
    // If selectedCategory is not in the list (e.g. it's a subcategory), add it temporarily so the dropdown doesn't break
    if (selectedCategory !== "all" && !list.find(c => c.slug === selectedCategory)) {
      // Find the subcategory name
      let subName = selectedCategory
      for (const cat of allCategories) {
        const sub = (cat.sub_categories || cat.subcategories || []).find(s => (s.slug || s.name.toLowerCase().replace(/\s+/g, '-')) === selectedCategory)
        if (sub) {
          subName = sub.name
          break
        }
      }
      list.push({ slug: selectedCategory, name: subName })
    }
    return list
  }, [allCategories, selectedCategory])

  // Fetch products when filters or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      
      const filters: Record<string, unknown> = {}
      if (selectedCategory !== "all") {
        filters.category = selectedCategory
        // Try to find if it's a category or subcategory to pass the correct ID to backend
        let foundCat = allCategories.find(c => (c.slug || c.name.toLowerCase().replace(/\s+/g, '-')) === selectedCategory)
        if (foundCat) {
          filters.category_id = foundCat.id
          filters.category_slug = foundCat.slug || selectedCategory
        } else {
          // Check subcategories
          for (const cat of allCategories) {
            const sub = (cat.sub_categories || cat.subcategories || []).find(s => (s.slug || s.name.toLowerCase().replace(/\s+/g, '-')) === selectedCategory)
            if (sub) {
              // TRICK: The user requested that if a subcategory is clicked, we show ALL products from the parent category!
              // So we deliberately treat this as if the parent category was clicked for filtering purposes.
              foundCat = cat
              filters.category_id = cat.id 
              filters.category_slug = cat.slug
              // We omit sub_category_id so the backend doesn't filter out the parent's other products
              break
            }
          }
        }
      }
      if (searchQuery) {
        filters.search = searchQuery
      }
      if (selectedCountry) filters.country = selectedCountry
      if (selectedMoq) filters.moq = selectedMoq
      if (selectedCerts.length > 0) filters.certifications = selectedCerts.join(",")
      if (selectedMarkets.length > 0) filters.markets = selectedMarkets.join(",")

      const response = await getProducts(currentPage, filters)
      
      if (response.success) {
        setProducts(response.data)
        setTotalPages(response.meta?.last_page || 1)
        setTotalProducts(response.meta?.total || response.data.length)
      } else {
        setError(response.message || "Failed to load products")
        setProducts([])
        setTotalPages(1)
        setTotalProducts(0)
      }
      
      setLoading(false)
    }

    const timeoutId = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timeoutId)
  }, [selectedCategory, searchQuery, currentPage, selectedCountry, selectedMoq, selectedCerts, selectedMarkets])

  // Sync state with URL params when they change
  useEffect(() => {
    const cat = searchParams.get("category")
    if (cat) {
      setSelectedCategory(cat)
    }
  }, [searchParams])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.name.toLowerCase().includes(query)
      )
    }

    // Local category filter is redundant if backend handles it, but keep it just in case
    if (selectedCategory !== "all") {
      const lowerSelected = selectedCategory.toLowerCase()
      
      // Resolve the category/subcategory from allCategories
      let foundCat = allCategories.find(c => (c.slug || c.name.toLowerCase().replace(/\s+/g, '-')) === selectedCategory)
      let foundSub: any = null
      if (!foundCat) {
        for (const cat of allCategories) {
          foundSub = (cat.sub_categories || cat.subcategories || []).find(s => (s.slug || s.name.toLowerCase().replace(/\s+/g, '-')) === selectedCategory)
          if (foundSub) {
            // TRICK: Treat the parent category as the found category to show all parent products
            foundCat = cat
            break
          }
        }
      }

      result = result.filter(p => {
        const pCat = p.category
        const pSub = p.sub_category

        // Exact slug match
        if (pCat && pCat.slug && pCat.slug.toLowerCase() === lowerSelected) return true
        if (pSub && pSub.slug && pSub.slug.toLowerCase() === lowerSelected) return true

        // Match by resolved ID
        if (foundCat && String(pCat?.id) === String(foundCat.id)) return true
        if (foundCat && String(p.categoryId) === String(foundCat.id)) return true
        if (foundSub && String(pSub?.id) === String(foundSub.id)) return true
        if (foundSub && String(p.subCategoryId) === String(foundSub.id)) return true

        // Match by exact name (very useful for dummy data where slugs differ but names match)
        if (foundCat && pCat && pCat.name && pCat.name.toLowerCase() === foundCat.name.toLowerCase()) return true
        if (foundSub && pSub && pSub.name && pSub.name.toLowerCase() === foundSub.name.toLowerCase()) return true

        return false
      })
    }

    // Apply MOQ filter locally
    if (selectedMoq && selectedMoq !== "all") {
      result = result.filter(p => {
        const moq = p.pricing_quantities?.minimum_order_quantity || 1;
        if (selectedMoq === "<100") return moq < 100;
        if (selectedMoq === "100-500") return moq >= 100 && moq <= 500;
        if (selectedMoq === "500-1000") return moq >= 500 && moq <= 1000;
        if (selectedMoq === ">1000") return moq > 1000;
        return true;
      });
    }



    // Apply Country filter locally
    if (selectedCountry) {
      result = result.filter(p => {
        const pSupplier = allSuppliers.find(s => s.id.toString() === p.supplierId?.toString());
        const pCountry = pSupplier?.location?.country || p.supplierCountry;
        return pCountry?.toLowerCase() === selectedCountry.toLowerCase();
      });
    }

    // Apply Certifications filter locally
    if (selectedCerts.length > 0) {
      result = result.filter(p => {
        const pSupplier = allSuppliers.find(s => s.id.toString() === p.supplierId?.toString());
        const certs = pSupplier?.certifications || p.supplierCertifications || [];
        return selectedCerts.some(cert => certs.includes(cert));
      });
    }

    // Apply Markets filter locally
    if (selectedMarkets.length > 0) {
      result = result.filter(p => {
        const pSupplier = allSuppliers.find(s => s.id.toString() === p.supplierId?.toString());
        const markets = pSupplier?.export_markets || p.supplierExportMarkets || [];
        return selectedMarkets.some(market => markets.includes(market));
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => {
          const priceA = parseFloat(a.pricing_quantities.min_price.price.amount)
          const priceB = parseFloat(b.pricing_quantities.min_price.price.amount)
          return priceA - priceB
        })
        break
      case "price-high":
        result.sort((a, b) => {
          const priceA = parseFloat(a.pricing_quantities.max_price.price.amount)
          const priceB = parseFloat(b.pricing_quantities.max_price.price.amount)
          return priceB - priceA
        })
        break
      case "moq-low":
        result.sort((a, b) =>
          a.pricing_quantities.minimum_order_quantity - b.pricing_quantities.minimum_order_quantity
        )
        break
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "popularity":
        result.sort((a, b) => b.inquiry_count - a.inquiry_count)
        break
      default:
        // Relevance: by inquiry count
        result.sort((a, b) => b.inquiry_count - a.inquiry_count)
    }

    return result
  }, [products, searchQuery, selectedCategory, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSortBy("relevance")
    setSelectedCountry("")
    setSelectedMoq("")
    setSelectedCerts([])
    setSelectedMarkets([])
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || sortBy !== "relevance" || selectedCountry || selectedMoq || selectedCerts.length > 0 || selectedMarkets.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-serif text-3xl font-medium tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                {t?.landing?.products?.pageTitle || "Discover Products"}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
                {t?.landing?.products?.pageDescription?.replace("{productCount}", totalProducts.toLocaleString()) || `Browse ${totalProducts.toLocaleString()}+ products from reviewed manufacturers worldwide`}
              </p>
            </div>

            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-3xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t?.landing?.products?.searchPlaceholder || "Search products, categories..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 bg-background pl-12 text-base"
                  />
                </div>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Filters Sidebar */}
              <aside className={`w-full lg:w-64 lg:shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">{t?.landing?.products?.filters || "Filters"}</h2>
                    {hasActiveFilters && (
                      <button 
                        onClick={clearFilters}
                        className="text-sm text-secondary hover:underline"
                      >
                        {t?.landing?.products?.clearAll || "Clear all"}
                      </button>
                    )}
                  </div>

                  <div className="mt-6 space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="text-sm font-medium text-foreground">{t?.landing?.products?.categoryLabel || "Category"}</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t?.landing?.products?.allCategories || "All Categories"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t?.landing?.products?.allCategories || "All Categories"}</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.slug} value={category.slug}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="text-sm font-medium text-foreground">{t?.landing?.products?.sortLabel || "Sort By"}</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t?.landing?.products?.sortBy || "Sort by"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">{t?.landing?.products?.relevance || "Relevance"}</SelectItem>
                          <SelectItem value="price-low">{t?.landing?.products?.priceLow || "Price: Low to High"}</SelectItem>
                          <SelectItem value="price-high">{t?.landing?.products?.priceHigh || "Price: High to Low"}</SelectItem>
                          <SelectItem value="moq-low">{t?.landing?.products?.lowestMOQ || "Lowest MOQ"}</SelectItem>
                          <SelectItem value="newest">{t?.landing?.products?.newestFirst || "Newest First"}</SelectItem>
                          <SelectItem value="popularity">{t?.landing?.products?.mostPopular || "Most Popular"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Country Filter */}
                    <div className="border-t border-border pt-5">
                      <label className="text-sm font-medium text-foreground">{t?.landing?.products?.country || "Country"}</label>
                      <Select 
                        value={selectedCountry || "all"} 
                        onValueChange={(val) => setSelectedCountry(val === "all" ? "" : val)}
                      >
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue placeholder={t?.landing?.products?.country || "Select country"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t?.landing?.products?.allCountries || "All Countries"}</SelectItem>
                          {featuredCountries.map((country) => (
                            <SelectItem key={country.code} value={country.name.toLowerCase()}>
                              {country.flag || ""} {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* MOQ Range */}
                    <div className="border-t border-border pt-5">
                      <label className="text-sm font-medium text-foreground">{t?.landing?.products?.minimumOrder || "Minimum Order"}</label>
                      <Select 
                        value={selectedMoq || "all"} 
                        onValueChange={(val) => setSelectedMoq(val === "all" ? "" : val)}
                      >
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue placeholder={t?.landing?.products?.minimumOrder || "Select MOQ range"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t?.landing?.products?.anyMoq || "Any MOQ"}</SelectItem>
                          {moqRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Certifications */}
                    <div className="border-t border-border pt-5">
                      <label className="text-sm font-medium text-foreground">{t?.landing?.products?.certifications || "Certifications"}</label>
                      <div className="mt-3 space-y-2">
                        {dynamicCertifications.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No certifications available</p>
                        ) : dynamicCertifications.map((cert) => (
                          <label
                            key={cert}
                            className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Checkbox
                              checked={selectedCerts.includes(cert)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCerts([...selectedCerts, cert])
                                } else {
                                  setSelectedCerts(selectedCerts.filter(c => c !== cert))
                                }
                              }}
                            />
                            <ShieldCheck className="h-3 w-3" />
                            {cert}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Export Markets 
                    <div className="border-t border-border pt-5">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Globe className="h-4 w-4" />
                        {t?.landing?.products?.exportMarkets || "Export Markets"}
                      </label>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {dynamicExportMarkets.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No markets available</p>
                        ) : dynamicExportMarkets.map((market) => (
                          <Badge 
                            key={market}
                            variant={selectedMarkets.includes(market) ? "default" : "outline"} 
                            className={`cursor-pointer transition-colors ${selectedMarkets.includes(market) ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'hover:bg-secondary hover:text-secondary-foreground'}`}
                            onClick={() => {
                              if (selectedMarkets.includes(market)) {
                                setSelectedMarkets(selectedMarkets.filter(m => m !== market))
                              } else {
                                setSelectedMarkets([...selectedMarkets, market])
                              }
                            }}
                          >
                            {market}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    */}
                  </div>
                </div>
              </aside>

              {/* Results */}
              <div className="flex-1">
                {/* Results Header */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">{filteredAndSortedProducts.length}</span> {t?.landing?.products?.productsFound || "products found"}
                  </p>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t?.landing?.suppliers?.activeFilters || "Active filters:"}</span>
                    {searchQuery && (
                      <Badge variant="secondary" className="gap-1">
                        {t?.landing?.suppliers?.search || "Search:"} {searchQuery}
                        <button onClick={() => setSearchQuery("")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedCategory !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {categories.find(c => c.slug === selectedCategory)?.name}
                        <button onClick={() => setSelectedCategory("all")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {sortBy !== "relevance" && (
                      <Badge variant="secondary" className="gap-1">
                        {t?.landing?.products?.sortDisplay || "Sort:"} {sortBy}
                        <button onClick={() => setSortBy("relevance")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedCountry && (
                      <Badge variant="secondary" className="gap-1">
                        {t?.landing?.products?.country || "Country"}: {selectedCountry}
                        <button onClick={() => setSelectedCountry("")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedMoq && (
                      <Badge variant="secondary" className="gap-1">
                        {t?.landing?.products?.moqLabel || "MOQ:"} {moqRanges.find(r => r.value === selectedMoq)?.label || selectedMoq}
                        <button onClick={() => setSelectedMoq("")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedCerts.map(cert => (
                      <Badge key={cert} variant="secondary" className="gap-1">
                        {t?.landing?.products?.certifications || "Cert:"} {cert}
                        <button onClick={() => setSelectedCerts(selectedCerts.filter(c => c !== cert))}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {selectedMarkets.map(market => (
                      <Badge key={market} variant="secondary" className="gap-1">
                        {t?.landing?.products?.exportMarkets || "Market:"} {market}
                        <button onClick={() => setSelectedMarkets(selectedMarkets.filter(m => m !== market))}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                    <p className="font-semibold">{t?.landing?.products?.errorLoadingProducts || "Error loading products"}</p>
                    <p className="mt-1">{error}</p>
                  </div>
                )}

                {/* Product Cards */}
                {!loading && !error && (
                  <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredAndSortedProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md"
                        >
                          {/* Product Image */}
                          <div className="relative aspect-4/3 bg-muted">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="absolute inset-0 h-full w-full object-cover" 
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Package className="h-12 w-12 text-muted-foreground/30" />
                              </div>
                            )}
                            <Badge className="absolute left-3 top-3">{product.category.name}</Badge>
                            {/* {product.is_approved && (
                              <Badge className="absolute right-3 top-3 bg-green-500/20 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t?.landing?.products?.verified || "Reviewed"}
                              </Badge>
                            )} */}
                          </div>

                          <div className="p-4">
                            <h3 className="font-semibold text-foreground group-hover:text-secondary line-clamp-2">
                              {product.name}
                            </h3>
                            
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>

                            <div className="mt-3">
                              <span className="text-lg font-semibold text-foreground">
                                ${parseFloat(product.pricing_quantities.min_price.price.amount).toFixed(2)} - ${parseFloat(product.pricing_quantities.max_price.price.amount).toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground"> / {product.pricing_quantities.unit}</span>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                              <span>{t?.landing?.products?.moqLabel || "MOQ:"} {product.pricing_quantities.minimum_order_quantity}</span>
                              <span>{product.pricing_quantities.lead_time} {t?.landing?.products?.daysLabel || "days"}</span>
                            </div>

                            {product.inquiry_count > 0 && (
                              <div className="mt-2 text-xs text-amber-600">
                                ⭐ {product.inquiry_count} {t?.landing?.products?.inquiriesLabel || "inquiries"}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex justify-center gap-2">
                        <Button
                          variant="outline"
                          disabled={currentPage === 1 || loading}
                          onClick={() => {
                            setCurrentPage(p => Math.max(1, p - 1))
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center justify-center px-4">
                          <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                        </div>
                        <Button
                          variant="outline"
                          disabled={currentPage === totalPages || loading}
                          onClick={() => {
                            setCurrentPage(p => Math.min(totalPages, p + 1))
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* Empty State */}
                {!loading && !error && filteredAndSortedProducts.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border py-16 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 font-semibold text-foreground">{t?.landing?.products?.noProductsFound || "No products found"}</h3>
                    <p className="mt-2 text-muted-foreground">
                      {t?.landing?.suppliers?.adjustSearchFilters || "Try adjusting your search or filter criteria"}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={clearFilters}
                    >
                      {t?.landing?.suppliers?.clearAllFilters || "Clear all filters"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}
