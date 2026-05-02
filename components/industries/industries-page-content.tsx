"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n"
import { 
  ArrowRight, 
  Cpu, 
  Cog, 
  Shirt, 
  Home, 
  Heart, 
  Car, 
  UtensilsCrossed, 
  FlaskConical,
  Factory,
  Package,
  Lightbulb,
  Wrench,
  HardHat,
  Sofa,
  Stethoscope,
  Wheat,
  Box,
  FileText,
  ShoppingBag
} from "lucide-react"

interface Industry {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  supplierCount: number
  productCount: number
  featured?: boolean
  categories: { id: string; name: string }[]
}

interface IndustriesPageContentProps {
  industries: Industry[]
}

export function IndustriesPageContent({ industries }: IndustriesPageContentProps) {
  const { t } = useTranslation()
  
  const iconMap: Record<string, React.ReactNode> = {
    Cpu: <Cpu className="h-8 w-8" />,
    Cog: <Cog className="h-8 w-8" />,
    Shirt: <Shirt className="h-8 w-8" />,
    Home: <Home className="h-8 w-8" />,
    Heart: <Heart className="h-8 w-8" />,
    Car: <Car className="h-8 w-8" />,
    UtensilsCrossed: <UtensilsCrossed className="h-8 w-8" />,
    FlaskConical: <FlaskConical className="h-8 w-8" />,
    Package: <Package className="h-8 w-8" />,
    Lightbulb: <Lightbulb className="h-8 w-8" />,
    Wrench: <Wrench className="h-8 w-8" />,
    HardHat: <HardHat className="h-8 w-8" />,
    Sofa: <Sofa className="h-8 w-8" />,
    Stethoscope: <Stethoscope className="h-8 w-8" />,
    Wheat: <Wheat className="h-8 w-8" />,
    Box: <Box className="h-8 w-8" />,
    FileText: <FileText className="h-8 w-8" />,
    Factory: <Factory className="h-8 w-8" />,
    ShoppingBag: <ShoppingBag className="h-8 w-8" />,
  }

  const totalSuppliers = industries.reduce((acc, ind) => acc + ind.supplierCount, 0)
  const totalProducts = industries.reduce((acc, ind) => acc + ind.productCount, 0)
  const totalCategories = industries.reduce((acc, ind) => acc + ind.categories.length, 0)

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-secondary/20 text-primary-foreground">
              {t?.landing?.industries?.majorIndustriesBadge || "Major Industries"} ({industries.length})
            </Badge>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              {t?.landing?.industries?.pageTitle || "Explore Industries"}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80">
              {t?.landing?.industries?.pageDescription || "Discover reviewed manufacturers and suppliers across all major industries. From electronics to textiles, find the perfect partner for your business."}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">{industries.length}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t?.landing?.industries?.majorIndustriesBadge || "Industries"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">{totalCategories}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t?.landing?.industries?.categoriesLabel || "Categories"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">{(totalSuppliers / 1000).toFixed(0)}K+</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t?.landing?.industries?.suppliersLabel || "Suppliers"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">{(totalProducts / 1000).toFixed(0)}K+</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t?.landing?.industries?.productsLabel || "Products"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <div 
                key={industry.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                      {iconMap[industry.icon] || <Factory className="h-8 w-8" />}
                    </div>
                    {industry.featured && (
                      <Badge variant="secondary">
                        {t?.landing?.industries?.featuredBadge || "Featured"}
                      </Badge>
                    )}
                  </div>
                  
                  <h2 className="mt-5 font-serif text-xl font-medium text-foreground group-hover:text-secondary transition-colors">
                    {industry.name}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {industry.description}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{industry.supplierCount.toLocaleString()}</span>
                      <span className="text-muted-foreground">
                        {t?.landing?.industries?.suppliersLabel || "Suppliers"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1">
                      {industry.categories.slice(0, 3).map((category) => (
                        <span 
                          key={category.id}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {category.name}
                        </span>
                      ))}
                      {industry.categories.length > 3 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          +{industry.categories.length - 3} {t?.landing?.industries?.moreCategories?.split("{count}")[1] || "more"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <Button size="sm" className="gap-2" asChild>
                      <Link href={`/industries/${industry.slug}`}>
                        {t?.landing?.industries?.exploreButton || "Explore"}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/suppliers?industry=${industry.slug}`}>
                        {t?.landing?.industries?.suppliersButton || "Suppliers"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-medium text-foreground">
              {t?.landing?.industries?.cantFindTitle || "Can't find your industry?"}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t?.landing?.industries?.cantFindDesc || "We're constantly expanding our network. Contact us to learn about upcoming industries."}
            </p>
            <Button className="mt-8 gap-2" asChild>
              <Link href="/contact">
                {t?.landing?.industries?.contactUsButton || "Contact Us"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
