"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useAuth } from "@/lib/auth-context"
import { REGISTER_SUCCESS_STORAGE_KEY } from "@/lib/register-success-storage"

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const { signup } = useAuth()
  
  const email = searchParams.get("email") || ""
  
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) {
      setError("Please enter a 6-digit OTP.")
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      // TODO (Backend): Integrate API call to verify the OTP here
      // For now, we simulate by retrieving the stored formData and finishing the registration
      const storedData = sessionStorage.getItem("temp_signup_data")
      if (!storedData) {
        setError("Session expired. Please try registering again.")
        setIsLoading(false)
        return
      }
      
      const formData = JSON.parse(storedData)
      const deviceName = typeof window !== "undefined" ? navigator.userAgent : "web"
      
      const result = await signup({
        ...formData,
        deviceName,
        transactionId: searchParams.get("transactionId") || undefined,
        planId: searchParams.get("plan") || undefined,
        promoId: searchParams.get("promo") || undefined,
      })

      if (result.success) {
        sessionStorage.removeItem("temp_signup_data")
        
        if (!result.pendingReview && formData.role === "buyer") {
          router.push(result.redirectTo)
          return
        }

        const payload = result.pendingReview
          ? {
              message: result.message,
              manufactureStatus: result.manufactureStatus ?? null,
              isLoggedIn: false as const,
            }
          : {
              message:
                result.message ||
                (t?.auth?.reviewPlans || "Your account has been created. Review plans next, or go straight to your dashboard."),
              manufactureStatus: null as string | null,
              isLoggedIn: true as const,
              dashboardPath: result.redirectTo,
            }

        sessionStorage.setItem(REGISTER_SUCCESS_STORAGE_KEY, JSON.stringify(payload))
        router.push("/auth/register-success")
      } else {
        setError(result.message || (t?.auth?.registrationFailed || "Registration failed. Please try again."))
      }
    } catch {
      setError(t?.auth?.errorOccurred || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="lg:flex lg:min-h-[calc(100vh-6rem)] lg:flex-col lg:justify-center">
      <div className="text-center lg:text-left">
        <button
          onClick={() => router.push("/auth/signup?role=buyer")}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← {t?.auth?.backToDetails || "Back to registration"}
        </button>
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Verify your email
        </h1>
        <p className="mt-2 text-muted-foreground">
          We've sent a 6-digit verification code to <strong className="text-foreground">{email}</strong>
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
        <div className="flex justify-center lg:justify-start">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <button
            type="button"
            className="font-medium text-secondary hover:underline"
            onClick={() => {
              // TODO (Backend): Integrate API call to resend OTP here
              setOtp("")
              alert("OTP resent to " + email)
            }}
          >
            Resend
          </button>
        </p>
      </form>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <VerifyOtpContent />
    </Suspense>
  )
}
