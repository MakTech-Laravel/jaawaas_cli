"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"
import AdditionalInformationCenter from "@/components/manufacturers/additional-information-center"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

function ReviewPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, token: authToken, isLoading } = useAuth()
  const urlToken = searchParams.get("token")

  useEffect(() => {
    if (urlToken || isLoading) {
      return
    }
    if (!authToken || !user) {
      router.replace("/auth/signin?role=manufacturer&callbackUrl=/review")
    }
  }, [urlToken, authToken, user, isLoading, router])

  if (!urlToken && isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Loading your review requests...</p>
      </div>
    )
  }

  if (!urlToken && (!authToken || !user)) {
    return null
  }

  return <AdditionalInformationCenter variant="standalone" token={urlToken} />
}

export default function ManufacturerAccountReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <ReviewPageContent />
    </Suspense>
  )
}
