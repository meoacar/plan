import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
  label?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    showLabel = false,
    label,
    variant = 'default',
    size = 'md',
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const variantColors = {
      default: 'bg-[#2d7a4a]',
      success: 'bg-green-600',
      warning: 'bg-yellow-500',
      danger: 'bg-red-600',
    }

    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    }

    return (
      <div ref={ref} className="w-full">
        {(showLabel || label) && (
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="text-gray-600">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-gray-200",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              variantColors[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

// Profil tamamlama progress bileşeni
interface ProfileCompletionProps {
  completedFields: number
  totalFields: number
  className?: string
}

const ProfileCompletion = ({ completedFields, totalFields, className }: ProfileCompletionProps) => {
  const percentage = (completedFields / totalFields) * 100
  
  return (
    <div className={cn("rounded-lg border bg-white p-4 shadow-sm", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Profil Tamamlama</h3>
        <span className="text-sm font-medium text-green-600">
          {completedFields}/{totalFields}
        </span>
      </div>
      <Progress 
        value={completedFields} 
        max={totalFields} 
        variant={percentage === 100 ? 'success' : 'default'}
        size="lg"
      />
      {percentage < 100 && (
        <p className="mt-2 text-xs text-gray-600">
          Profilini tamamla ve daha fazla özelliğe erişim kazan!
        </p>
      )}
    </div>
  )
}

// Hedef ilerleme bileşeni
interface GoalProgressProps {
  current: number
  target: number
  unit?: string
  label: string
  className?: string
}

const GoalProgress = ({ current, target, unit = 'kg', label, className }: GoalProgressProps) => {
  const percentage = (current / target) * 100
  const remaining = target - current
  
  return (
    <div className={cn("rounded-lg border bg-white p-4 shadow-sm", className)}>
      <div className="mb-3">
        <h3 className="mb-1 font-semibold text-gray-900">{label}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-green-600">{current}</span>
          <span className="text-gray-600">/ {target} {unit}</span>
        </div>
      </div>
      <Progress 
        value={current} 
        max={target}
        variant={percentage >= 100 ? 'success' : percentage >= 75 ? 'warning' : 'default'}
        size="lg"
      />
      <p className="mt-2 text-sm text-gray-600">
        {remaining > 0 ? `${remaining} ${unit} kaldı` : 'Hedefe ulaştın! 🎉'}
      </p>
    </div>
  )
}

export { Progress, ProfileCompletion, GoalProgress }
