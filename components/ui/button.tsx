import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'

/**
 * Heights come from the control tokens, so `data-density="kiosk"` lifts every
 * button to the larger targets without a `kiosk` size existing here:
 * 36 / 44 / 52 becomes 44 / 56 / 64.
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

const CONTROL: Record<ButtonSize, string> = {
  sm: 'var(--control-sm)',
  md: 'var(--control-md)',
  lg: 'var(--control-lg)',
}

const TEXT: Record<ButtonSize, string> = {
  sm: 'text-small',
  md: 'text-body',
  lg: 'text-body-lg',
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active',
  secondary:
    'bg-transparent text-primary border border-hairline hover:bg-sunken active:bg-sunken',
  ghost: 'bg-transparent text-accent hover:bg-accent-subtle active:bg-accent-subtle',
  // The label inverts with the fill: --danger lightens on a black ground, so
  // white text there would land at 3.6:1.
  destructive: 'bg-danger text-on-danger hover:brightness-110 active:brightness-95',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch to the container — sticky footers and the cart screen CTA. */
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const height = CONTROL[size]

  return (
    <button
      type={type}
      // Disabled swaps the fill rather than dropping opacity, which would take
      // the label below the contrast floor.
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
        'transition-[background-color,color] duration-(--dur-fast) ease-(--ease-standard)',
        'disabled:pointer-events-none disabled:border-transparent',
        'disabled:bg-disabled disabled:text-disabled-text',
        TEXT[size],
        VARIANT[variant],
        block ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        blockSize: height,
        minInlineSize: height,
        paddingInline: `calc(${height} * 0.45)`,
      }}
      {...props}
    />
  )
}
