"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import {
  activateAccount,
  deactivateAccount,
  requestAccountDeletion,
} from "@/lib/api/account"
import { getApiErrorMessage } from "@/lib/api/errors"
import { Loader2 } from "lucide-react"

export function AccountDangerZone() {
  const { toast } = useToast()
  const router = useRouter()
  const { logout } = useAuth()

  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [deactivatePassword, setDeactivatePassword] = useState("")
  const [deactivateReason, setDeactivateReason] = useState("")
  const [activatePassword, setActivatePassword] = useState("")
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteReason, setDeleteReason] = useState("")

  const [loading, setLoading] = useState<"deactivate" | "activate" | "delete" | null>(null)

  const resetDeactivate = () => {
    setDeactivatePassword("")
    setDeactivateReason("")
  }

  const resetActivate = () => {
    setActivatePassword("")
  }

  const resetDelete = () => {
    setDeletePassword("")
    setDeleteReason("")
  }

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("deactivate")
    try {
      const res = await deactivateAccount(
        deactivatePassword,
        deactivateReason.trim() || undefined
      )
      if (res.success) {
        toast({
          title: "Account deactivated",
          description: res.message || "Your account has been deactivated.",
        })
        setDeactivateOpen(false)
        resetDeactivate()
        logout()
        router.push("/auth/signin")
      } else {
        toast({
          title: "Could not deactivate",
          description: res.message || "Please check your password and try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Could not deactivate",
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("activate")
    try {
      const res = await activateAccount(activatePassword)
      if (res.success) {
        toast({
          title: "Account active",
          description: res.message || "Your account is active again.",
        })
        setActivateOpen(false)
        resetActivate()
      } else {
        toast({
          title: "Could not activate",
          description: res.message || "Please check your password and try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Could not activate",
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("delete")
    try {
      const res = await requestAccountDeletion(deletePassword, deleteReason.trim() || "User request")
      if (res.success) {
        toast({
          title: "Deletion requested",
          description:
            res.message ||
            "If your account was scheduled for deletion, follow the email instructions or use Restore account on the sign-in page.",
        })
        setDeleteOpen(false)
        resetDelete()
        logout()
        router.push("/auth/signin")
      } else {
        toast({
          title: "Request failed",
          description: res.message || "Please check your password and try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Request failed",
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Account status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Deactivate account</p>
            <p className="text-sm text-muted-foreground">
              Temporarily disable your account. You can reactivate later with your password.
            </p>
          </div>
          <Dialog
            open={deactivateOpen}
            onOpenChange={(o) => {
              setDeactivateOpen(o)
              if (!o) resetDeactivate()
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                Deactivate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleDeactivate}>
                <DialogHeader>
                  <DialogTitle>Deactivate account</DialogTitle>
                  <DialogDescription>
                    Confirm your password. You will be signed out until you activate again.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="deactivate-pw">Password</Label>
                    <Input
                      id="deactivate-pw"
                      type="password"
                      autoComplete="current-password"
                      value={deactivatePassword}
                      onChange={(e) => setDeactivatePassword(e.target.value)}
                      required
                      disabled={loading === "deactivate"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deactivate-reason">Reason (optional)</Label>
                    <Textarea
                      id="deactivate-reason"
                      value={deactivateReason}
                      onChange={(e) => setDeactivateReason(e.target.value)}
                      rows={2}
                      disabled={loading === "deactivate"}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" variant="destructive" disabled={loading === "deactivate"}>
                    {loading === "deactivate" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deactivating…
                      </>
                    ) : (
                      "Confirm deactivation"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Reactivate account</p>
              <p className="text-sm text-muted-foreground">
                If you previously deactivated, enter your password to turn your account back on.
              </p>
            </div>
            <Dialog
              open={activateOpen}
              onOpenChange={(o) => {
                setActivateOpen(o)
                if (!o) resetActivate()
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  Reactivate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleActivate}>
                  <DialogHeader>
                    <DialogTitle>Reactivate account</DialogTitle>
                    <DialogDescription>Enter your current password to restore full access.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="activate-pw">Password</Label>
                      <Input
                        id="activate-pw"
                        type="password"
                        autoComplete="current-password"
                        value={activatePassword}
                        onChange={(e) => setActivatePassword(e.target.value)}
                        required
                        disabled={loading === "activate"}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading === "activate"}>
                      {loading === "activate" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Reactivating…
                        </>
                      ) : (
                        "Reactivate"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Request permanent deletion. You may need to confirm by email or OTP afterward.
              </p>
            </div>
            <Dialog
              open={deleteOpen}
              onOpenChange={(o) => {
                setDeleteOpen(o)
                if (!o) resetDelete()
              }}
            >
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="shrink-0">
                  Delete account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleDelete}>
                  <DialogHeader>
                    <DialogTitle>Request account deletion</DialogTitle>
                    <DialogDescription>
                      This starts the deletion process on the server. This action cannot be undone from
                      here once completed.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="delete-pw">Password</Label>
                      <Input
                        id="delete-pw"
                        type="password"
                        autoComplete="current-password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        required
                        disabled={loading === "delete"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delete-reason">Reason</Label>
                      <Textarea
                        id="delete-reason"
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        rows={2}
                        placeholder="Tell us why you're leaving (optional but helpful)"
                        disabled={loading === "delete"}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" variant="destructive" disabled={loading === "delete"}>
                      {loading === "delete" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        "Submit deletion request"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Started a deletion by mistake?{" "}
          <Link href="/auth/restore-account" className="font-medium text-secondary hover:underline">
            Restore account
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
