import { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { IndustriesPageContent } from "@/components/industries/industries-page-content"
import { industries } from "@/lib/data/industries"

export const metadata: Metadata = {
  title: "Industries",
  description: "Explore reviewed suppliers and manufacturers across all major industries on SourceNest.",
}

export default function IndustriesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <IndustriesPageContent industries={industries} />
      <Footer />
    </div>
  )
}
