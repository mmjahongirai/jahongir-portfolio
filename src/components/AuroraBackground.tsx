import { useEffect, useRef } from 'react';

export function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const blobs: HTMLDivElement[] = [];
    const blobConfigs = [
      { x: '15%', y: '15%', size: 420, color: 'rgba(16,185,129,0.07)', duration: 22, delay: 0 },
      { x: '75%', y: '25%', size: 340, color: 'rgba(79,70,229,0.06)', duration: 28, delay: 4 },
      { x: '35%', y: '65%', size: 380, color: 'rgba(16,185,129,0.04)', duration: 25, delay: 8 },
      { x: '65%', y: '55%', size: 300, color: 'rgba(79,70,229,0.04)', duration: 20, delay: 2 },
    ];

    blobConfigs.forEach(config => {
      const blob = document.createElement('div');
      blob.style.cssText = `
        position: absolute;
        left: ${config.x};
        top: ${config.y};
        width: ${config.size}px;
        height: ${config.size}px;
        border-radius: 50%;
        background: radial-gradient(circle, ${config.color} 0%, transparent 70%);
        filter: blur(80px);
        animation: aurora-float ${config.duration}s ease-in-out ${config.delay}s infinite alternate;
        pointer-events: none;
      `;
      container.appendChild(blob);
      blobs.push(blob);
    });

    return () => { blobs.forEach(b => b.remove()); };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-60 dark:opacity-100"
    >
      <style>{`
        @keyframes aurora-float {
          0% { transform: translate(0,0) scale(1); }
          33% { transform: translate(40px,-25px) scale(1.08); }
          66% { transform: translate(-25px,40px) scale(0.95); }
          100% { transform: translate(0,0) scale(1); }
        }
      `}</style>
      <div
        className="absolute inset-0 opacity-70 dark:opacity-100"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 10% 10%, rgba(16,185,129,0.05), transparent 60%),
                       radial-gradient(ellipse 60% 50% at 90% 80%, rgba(79,70,229,0.05), transparent 60%)`,
        }}
      />
    </div>
  );
}
