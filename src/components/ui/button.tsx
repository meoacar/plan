import * as React from "react"
import { cn } from "@/lib/utils"
import { Spinner } from "./spinner"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg"
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#2d7a4a] text-white hover:bg-[#236038] shadow-sm": variant === "default",
            "border-2 border-[#2d7a4a] text-[#2d7a4a] bg-white hover:bg-[#2d7a4a] hover:text-white": variant === "outline",
            "text-gray-700 hover:bg-gray-200": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 shadow-sm": variant === "destructive",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-sm": size === "sm",
            "h-12 px-8": size === "lg",
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
