import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const variantStyles = {
  default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border-transparent bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600",
  destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
  outline: "text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700",
};

export function Badge({ 
  className, 
  variant = "default", 
  ...props 
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
