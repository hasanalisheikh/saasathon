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
        <circle cx="16" cy="16" r="4" fill="#a855f7" />
        <line x1="16" y1="12" x2="16" y2="4" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="18.9" x2="27" y2="23" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="18.9" x2="5" y2="23" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {label && (
        <span
          className={selected.text}
          style={{ fontFamily: 'DM Mono, monospace', fontWeight: 500, letterSpacing: '0.08em', color: '#f0f4ff' }}
        >
          monad
        </span>
      )}
    </div>
  )
}
