import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  required?: boolean
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  required,
  description,
  children,
  className,
}: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined
  const descriptionId = description ? `${htmlFor}-description` : undefined

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600">
          {description}
        </p>
      )}
      <div>
        {React.cloneElement(children as React.ReactElement<any>, {
          id: htmlFor,
          "aria-invalid": error ? "true" : "false",
          "aria-describedby": [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
        })}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
