import { type ReactNode } from 'react';

type CardVariant = 'glass' | 'elevated';

type CardProps = {
  variant?: CardVariant;
  hover?: boolean;
  glow?: boolean;
  className?: string;
  children: ReactNode;
};

export function Card({
  variant = 'elevated',
  hover = false,
  glow = false,
  className = '',
  children,
}: CardProps) {
  const variantClass = variant === 'glass' ? 'glass-card' : 'card-dark';
  const hoverClass = hover ? 'hover-lift group' : '';
  const glowClass = glow ? 'glow-border' : '';

  return (
    <div className={`${variantClass} rounded-apple ${hoverClass} ${glowClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
