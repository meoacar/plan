import { Toast } from "@/components/ui/toast"

export const toast = {
  success: (title: string, description?: string, duration?: number) => ({
    type: "success" as const,
    title,
    description,
    duration,
  }),
  error: (title: string, description?: string, duration?: number) => ({
    type: "error" as const,
    title,
    description,
    duration,
  }),
  warning: (title: string, description?: string, duration?: number) => ({
    type: "warning" as const,
    title,
    description,
    duration,
  }),
  info: (title: string, description?: string, duration?: number) => ({
    type: "info" as const,
    title,
    description,
    duration,
  }),
}
