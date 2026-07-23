type EyebrowProps = {
  label: string;
  className?: string;
};

export function Eyebrow({ label, className = '' }: EyebrowProps) {
  return <span className={`eyebrow ${className}`.trim()}>{label}</span>;
}
