import { Eyebrow } from './Eyebrow';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: 'left' | 'center';
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  className = '',
  align = 'left',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : '';

  return (
    <div className={`max-w-2xl ${alignClass} ${className}`.trim()}>
      {eyebrow && <Eyebrow label={eyebrow} className="mb-5 block" />}
      <h2 className="text-display-md md:text-display-lg font-bold text-content-primary tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-content-secondary leading-relaxed text-lg">{description}</p>
      )}
    </div>
  );
}
