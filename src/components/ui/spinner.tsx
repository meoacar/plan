import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("inline-block", className)}
        {...props}
      >
        <div
          className={cn(
            "border-4 border-[#2d7a4a] border-t-transparent rounded-full animate-spin",
            {
              "w-4 h-4 border-2": size === "sm",
              "w-8 h-8 border-3": size === "md",
              "w-12 h-12 border-4": size === "lg",
            }
          )}
        />
      </div>
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner }
