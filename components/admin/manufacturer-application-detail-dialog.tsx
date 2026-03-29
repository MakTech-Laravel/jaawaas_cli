"use client"

import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { ManufacturerApplication } from "@/lib/api/admin-manufacturer-registrations"
import {
  Building2,
  Calendar,
  FileText,
  Globe,
  Hash,
  IdCard,
  ImageIcon,
  Laptop,
  MapPin,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="break-words text-sm text-foreground">{children}</div>
    </div>
  )
}

function displayName(row: ManufacturerApplication) {
  return [row.first_name, row.last_name].filter(Boolean).join(" ").trim() || "—"
}

export function ManufacturerApplicationDetailDialog({
  open,
  onOpenChange,
  application,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: ManufacturerApplication
}) {
  const submitted =
    application.created_at &&
    (() => {
      try {
        return format(new Date(application.created_at), "PPpp")
      } catch {
        return application.created_at
      }
    })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92vh,56rem)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 space-y-3 border-b border-border px-4 pb-4 pt-6 text-left sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15">
                <Building2 className="h-6 w-6 text-secondary" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-serif text-xl leading-snug sm:text-2xl">
                  {application.company_name?.trim() || "Manufacturer application"}
                </DialogTitle>
                <DialogDescription className="mt-1 text-left text-sm text-muted-foreground">
                  Reference{" "}
                  <span className="font-mono text-foreground">
                    {application.application_reference || `#${application.id}`}
                  </span>
                </DialogDescription>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit shrink-0 capitalize">
              {application.status || "pending"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          <div className="space-y-8">
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <IdCard className="h-4 w-4 text-secondary" />
                Primary contact
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">{displayName(application)}</Field>
                <Field label="Email">
                  <a href={`mailto:${application.email}`} className="text-secondary hover:underline">
                    {application.email}
                  </a>
                </Field>
                <Field label="Phone">
                  {application.phone ? (
                    <a href={`tel:${application.phone}`} className="text-secondary hover:underline">
                      {application.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </Field>
                <Field label="Terms accepted">
                  {application.terms_accepted ? (
                    <span className="inline-flex items-center gap-1 text-secondary">
                      <ShieldCheck className="h-4 w-4" />
                      Yes
                    </span>
                  ) : (
                    "—"
                  )}
                </Field>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-secondary" />
                Company
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company name">{application.company_name || "—"}</Field>
                <Field label="Industry">{application.primary_industry || "—"}</Field>
                <Field label="Headcount (stated)">{application.employee_count || "—"}</Field>
                <Field label="Website">
                  {application.company_website?.trim() ? (
                    <a
                      href={application.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 break-all text-secondary hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      {application.company_website}
                    </a>
                  ) : (
                    "—"
                  )}
                </Field>
                <Field label="Location" className="sm:col-span-2">
                  <span className="inline-flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    {[application.city, application.country].filter(Boolean).join(", ") || "—"}
                  </span>
                </Field>
                <Field label="Tax / VAT ID">{application.tax_id || "—"}</Field>
                <Field label="Business registration">{application.business_registration_id || "—"}</Field>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ScrollText className="h-4 w-4 text-secondary" />
                Application notes
              </h3>
              <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
                {application.notes?.trim() || "No additional notes provided."}
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-secondary" />
                Documents
              </h3>
              <Field label="Business license file">
                {application.business_license_file ? (
                  <span className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {application.business_license_file}
                  </span>
                ) : (
                  "—"
                )}
              </Field>
            </section>

            {application.factory_images && application.factory_images.length > 0 && (
              <>
                <Separator />
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ImageIcon className="h-4 w-4 text-secondary" />
                    Factory photos ({application.factory_images.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {application.factory_images.map((src, i) => (
                      <a
                        key={`${src}-${i}`}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        <img
                          src={src}
                          alt={`Factory ${i + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                </section>
              </>
            )}

            <Separator />

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Hash className="h-4 w-4 text-secondary" />
                Submission meta
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Submitted">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {submitted || "—"}
                  </span>
                </Field>
                <Field label="Application ID">{String(application.id)}</Field>
                <Field label="Device / client" className="sm:col-span-2">
                  <span className="inline-flex items-start gap-1.5">
                    <Laptop className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    {application.device_name || "—"}
                  </span>
                </Field>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
