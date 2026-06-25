"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Cpu, Cog, Shirt, Home, Heart, Car, UtensilsCrossed, FlaskConical, Package, Lightbulb, Wrench, HardHat, Sofa, Stethoscope, Wheat, Box, FileText, Factory, ShoppingBag, Globe } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { getPublicCategories, BackendCategory } from "@/lib/api/categories"
import DynamicIcon from "@/components/dynamic-icon"

// Map industry icons
const industryIcons: Record<string, React.ReactNode> = {
  "electronics-electrical": <Cpu className="h-8 w-8" />,
  "machinery-equipment": <Cog className="h-8 w-8" />,
  "textiles-apparel": <Shirt className="h-8 w-8" />,
  "home-garden": <Home className="h-8 w-8" />,
  "health-beauty": <Heart className="h-8 w-8" />,
  "automotive-parts": <Car className="h-8 w-8" />,
  "food-beverage": <UtensilsCrossed className="h-8 w-8" />,
  "chemicals-materials": <FlaskConical className="h-8 w-8" />,
  "packaging": <Package className="h-8 w-8" />,
  "lighting": <Lightbulb className="h-8 w-8" />,
  "metal-products": <Wrench className="h-8 w-8" />,
  "construction-materials": <HardHat className="h-8 w-8" />,
  "furniture": <Sofa className="h-8 w-8" />,
  "medical-equipment": <Stethoscope className="h-8 w-8" />,
  "agriculture": <Wheat className="h-8 w-8" />,
  "plastic-products": <Box className="h-8 w-8" />,
  "paper-products": <FileText className="h-8 w-8" />,
  "industrial-machinery": <Factory className="h-8 w-8" />,
  "consumer-goods": <ShoppingBag className="h-8 w-8" />,
}

export function IndustriesSection() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<BackendCategory[]>([])

  useEffect(() => {
    async function loadCategories() {
      const res = await getPublicCategories({ perPage: 50 })
      if (!res.success || !res.data) {
        setCategories([])
        return
      }

      const featured = res.data.filter((c) => Number(c.featured) === 1)
      setCategories(featured.slice(0, 8))
    }
    loadCategories()
  }, [])

  if (!t || !t.landing?.featured) {
    return null
  }
  
  return (
    <section className="relative -mt-px bg-muted/50 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12 lg:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-medium text-secondary mb-3 sm:px-4 sm:py-2 sm:text-sm sm:mb-4">
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t.landing.featured.industriesBadge}
          </span>
          <h2 className="font-serif text-xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-5xl">
            {t.landing.featured.industriesTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-lg">
            {t.landing.featured.industriesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {categories.map((industry) => {
            const industryColor = industry.color || "#f8fafc"
            
            // Detect if icon is a file URL (has file extension) or lucide icon name
            const isFileUrl = industry.icon && (
              industry.icon.startsWith("http") || 
              industry.icon.includes(".") || 
              industry.icon.startsWith("/")
            );
            
            // Build icon URL if it's a file path
            const iconUrl = isFileUrl && industry.icon
              ? (industry.icon.startsWith("http")
                  ? industry.icon
                  : `${process.env.NEXT_PUBLIC_API_URL || ""}${industry.icon.startsWith('/') ? '' : '/'}${industry.icon}`)
              : null;

            return (
              <Link
                key={industry.slug || industry.id}
                href={`/industries/${industry.slug || industry.id}`}
                className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-secondary/50 hover:shadow-lg sm:rounded-2xl sm:hover:shadow-2xl sm:hover:-translate-y-2"
                style={{ backgroundColor: industryColor }}
              >
                <div className="relative p-3 sm:p-6 lg:p-8">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-sm transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16 sm:rounded-2xl sm:shadow-md lg:h-20 lg:w-20"
                  >
                    {iconUrl ? (
                      <img src={iconUrl} alt={industry.name} className="h-5 w-5 object-contain sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
                    ) : industry.icon && (industry.icon.includes(".") || industry.icon.startsWith("/")) ? (
                      <img src={industry.icon} alt={industry.name} className="h-5 w-5 object-contain sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
                    ) : industry.icon ? (
                      <DynamicIcon 
                        name={industry.icon} 
                        size={20} 
                        color={industry.icon_color || undefined}
                      />
                    ) : (
                      <div className="scale-75 sm:scale-100" style={{ color: industry.icon_color || "#64748b" }}>
                        {industryIcons[industry.slug || ""] || <Package className="h-8 w-8 lg:h-10 lg:w-10" />}
                      </div>
                    )}
                  </div>

                  <h3 
                    className="mt-2 line-clamp-2 text-sm font-semibold leading-snug sm:mt-5 sm:text-xl"
                    style={{ color: industry.title_color || undefined }}
                  >
                    {industry.name}
                  </h3>

                  <p 
                    className="mt-2 hidden text-sm line-clamp-2 sm:block" 
                    title={industry.description}
                    style={{ color: industry.description_color || undefined }}
                  >
                    {industry.description || "Explore suppliers and products in this industry sector."}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-xs sm:mt-5 sm:gap-4 sm:text-sm" style={{ color: industry.supplier_count_color || undefined }}>
                    <Factory className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-semibold">{industry.supplier_count?.toLocaleString() || 0}</span>
                    <span className="hidden sm:inline">{t?.landing?.featured?.suppliersLabel || "suppliers"}</span>
                  </div>

                  <div 
                    className="mt-2 hidden items-center text-sm font-medium transition-colors sm:mt-5 sm:flex"
                    style={{ color: industry.btn_color || undefined }}
                  >
                    <span>{t?.landing?.featured?.exploreButton || "Explore"}</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* View All Industries Button */}
          <Button size="lg" variant="default" className="gap-2" asChild>
            <Link href="/industries">
              <Package className="h-4 w-4" />
              {t?.landing?.industries?.viewAll || "View All Industries"}
            </Link>
          </Button>
          {/* Explore Global Map Button */}
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <Link href="/suppliers/map">
              <Globe className="h-4 w-4" />
              {t?.landing?.industries?.explorerMap || "Explore Global Map"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
