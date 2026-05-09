type BrandMarkProps = {
  className?: string
  label?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { mark: 22, text: 'text-sm' },
  md: { mark: 28, text: 'text-base' },
  lg: { mark: 36, text: 'text-lg' },
}

export function BrandMark({ className = '', label = true, size = 'md' }: BrandMarkProps) {
  const selected = sizes[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={selected.mark}
        height={selected.mark}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="4" fill="currentColor" />
        <line x1="16" y1="12" x2="16" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="18.9" x2="27" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="18.9" x2="5" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {label && (
        <span
          className={selected.text}
          style={{ fontWeight: 600, color: 'currentColor' }}
        >
          monad
        </span>
      )}
    </div>
  )
}
