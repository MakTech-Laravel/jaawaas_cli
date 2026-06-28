"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n"
import { SiteHeader } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Globe, Shield, Users, Lightbulb, Target, Heart, ArrowRight } from "lucide-react"

export default function AboutPage() {
  const { t } = useTranslation()

  if (!t?.about) {
    return null
  }

  const values = [
    {
      icon: Shield,
      title: t.about.values.trust.title,
      description: t.about.values.trust.description,
    },
    {
      icon: Globe,
      title: t.about.values.global.title,
      description: t.about.values.global.description,
    },
    {
      icon: Users,
      title: t.about.values.community.title,
      description: t.about.values.community.description,
    },
    {
      icon: Lightbulb,
      title: t.about.values.innovation.title,
      description: t.about.values.innovation.description,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-3xl font-medium tracking-tight text-primary-foreground min-[400px]:text-4xl sm:text-5xl lg:text-6xl">
                {t.about.hero.title}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-primary-foreground/80 sm:mt-6 sm:text-base lg:text-lg">
                {t.about.hero.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {t.about.story.title}
              </h2>
              <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
                <p>{t.about.story.p1}</p>
                <p>{t.about.story.p2}</p>
                <p>{t.about.story.p3}</p>
                <p>{t.about.story.p4}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 sm:gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="rounded-xl bg-primary p-4 text-primary-foreground sm:rounded-2xl sm:p-6 lg:p-8">
                <Target className="h-10 w-10 sm:h-12 sm:w-12" />
                <h3 className="mt-4 font-serif text-xl font-medium sm:mt-6 sm:text-2xl">{t.about.missionVision.missionTitle}</h3>
                <p className="mt-4 text-primary-foreground/80 leading-relaxed">
                  {t.about.missionVision.missionDesc}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6 lg:p-8">
                <Heart className="h-10 w-10 text-secondary sm:h-12 sm:w-12" />
                <h3 className="mt-4 font-serif text-xl font-medium text-foreground sm:mt-6 sm:text-2xl">{t.about.missionVision.visionTitle}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {t.about.missionVision.visionDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/50 py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {t.about.values.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
                {t.about.values.subtitle}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {values.map((value) => (
                <div key={value.title} className="group relative overflow-hidden rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-lg sm:rounded-2xl sm:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 sm:h-12 sm:w-12">
                    <value.icon className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground sm:mt-4 sm:text-base">{value.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed sm:mt-2 sm:text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why We're Different */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {t.about.difference.title}
              </h2>
              <div className="mt-8 space-y-6 text-left text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">{t.about.difference.reviewed.title}</strong> {t.about.difference.reviewed.description}
                </p>
                <p>
                  <strong className="text-foreground">{t.about.difference.free.title}</strong> {t.about.difference.free.description}
                </p>
                <p>
                  <strong className="text-foreground">{t.about.difference.nocommission.title}</strong> {t.about.difference.nocommission.description}
                </p>
                <p>
                  <strong className="text-foreground">{t.about.difference.premium.title}</strong> {t.about.difference.premium.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-3xl font-medium tracking-tight text-primary-foreground sm:text-4xl">
                {t.about.cta.title}
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                {t.about.cta.subtitle}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row w-full max-w-lg mx-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto justify-center gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
                  <Link href="/auth/signup?role=buyer" className="w-full text-center sm:w-auto">
                    {t.about.cta.buyerButton}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link href="/pricing" className="w-full text-center sm:w-auto">
                    {t.about.cta.manufacturerButton}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
