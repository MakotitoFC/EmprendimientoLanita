'use client'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors rounded-lg disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-stone-800 text-white hover:bg-stone-700': variant === 'primary',
            'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-300': variant === 'secondary',
            'hover:bg-stone-100 text-stone-700': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
            'bg-green-600 text-white hover:bg-green-700 gap-2': variant === 'whatsapp',
          },
          {
            'text-sm px-3 py-1.5': size === 'sm',
            'text-sm px-4 py-2': size === 'md',
            'text-base px-6 py-3': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
export default Button
