import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-[var(--radius-md)] px-3 py-2',
            'bg-[hsl(var(--color-input-bg))] border border-[hsl(var(--color-input-border))]',
            'text-[hsl(var(--color-text-primary))] text-sm',
            'placeholder:text-[hsl(var(--color-text-muted))]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-input-focus))]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors duration-[var(--transition-base)]',
            error && 'border-[hsl(var(--color-error))] focus-visible:ring-[hsl(var(--color-error))]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[hsl(var(--color-error))]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
