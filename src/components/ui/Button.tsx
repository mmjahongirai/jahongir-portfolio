import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'ghost' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  href?: string;
  to?: string;
  className?: string;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs min-h-[36px]',
  md: 'px-7 py-3 text-sm min-h-[44px]',
  lg: 'px-8 py-3.5 text-base min-h-[48px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  href,
  to,
  className = '',
  type,
  ...props
}: ButtonProps) {
  const baseClass =
    variant === 'primary'
      ? 'btn-premium'
      : variant === 'glass'
        ? 'btn-glass'
        : 'btn-ghost';
  const classes = `${baseClass} ${sizeClasses[size]} ${className}`.trim();

  if (to) {
    return (
      <Link href={to} className={classes} data-magnetic data-cursor-hover>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} data-magnetic data-cursor-hover>
        {children}
      </a>
    );
  }

  return (
    <button type={type ?? 'button'} className={classes} data-magnetic data-cursor-hover {...props}>
      {children}
    </button>
  );
}
