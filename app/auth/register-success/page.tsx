"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Factory, Loader2 } from "lucide-react"
import {
  REGISTER_SUCCESS_STORAGE_KEY,
  type RegisterSuccessPayload,
} from "@/lib/register-success-storage"

export default function RegisterSuccessPage() {
  const router = useRouter()
  const [payload, setPayload] = useState<RegisterSuccessPayload | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(REGISTER_SUCCESS_STORAGE_KEY)
      if (!raw) {
        router.replace("/auth/signin")
        return
      }
      const parsed = JSON.parse(raw) as RegisterSuccessPayload
      if (!parsed?.message) {
        router.replace("/auth/signin")
        return
      }
      setPayload(parsed)
      sessionStorage.removeItem(REGISTER_SUCCESS_STORAGE_KEY)
    } catch {
      router.replace("/auth/signin")
    } finally {
      setReady(true)
    }
  }, [router])

  if (!ready || !payload) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isPendingManufacturer =
    payload.manufactureStatus === "pending" ||
    payload.manufactureStatus === "pending_approval"

  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15">
        {isPendingManufacturer ? (
          <Factory className="h-8 w-8 text-secondary" />
        ) : (
          <CheckCircle2 className="h-8 w-8 text-secondary" />
        )}
      </div>
      <h1 className="mt-6 font-serif text-3xl font-medium text-foreground">
        {isPendingManufacturer ? "Application received" : "You're all set"}
      </h1>
      <p className="mt-4 text-left text-sm leading-relaxed text-muted-foreground lg:text-center">
        {payload.message}
      </p>
      {isPendingManufacturer && (
        <p className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-left text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          You can sign in once your manufacturer profile has been approved. We&apos;ll email you when
          there&apos;s an update.
        </p>
      )}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/auth/signin">Go to sign in</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
