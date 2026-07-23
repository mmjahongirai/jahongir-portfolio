import { useState, useEffect } from 'react';

type TextRotatorProps = {
  texts: string[];
  className?: string;
};

export function TextRotator({ texts, className = '' }: TextRotatorProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % texts.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <span
      className={`inline-block transition-all duration-350 ${className}`.trim()}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
    >
      {texts[index]}
    </span>
  );
}
