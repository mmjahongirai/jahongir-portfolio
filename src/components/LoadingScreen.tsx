import { useState, useEffect } from 'react';

export function LoadingScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-surface-primary flex flex-col items-center justify-center transition-opacity duration-500 ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-10 h-10 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-yellow animate-spin" />
      </div>
      <div className="text-xs font-semibold text-content-tertiary tracking-widest uppercase animate-pulse">
        Loading
      </div>
    </div>
  );
}
