import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function LogoMark() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'footer_logo_url')
      .maybeSingle()
      .then(({ data }) => { if (data?.value) setLogoUrl(data.value); });
  }, []);

  if (logoUrl) {
    return <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl border border-accent-yellow/40 flex items-center justify-center flex-shrink-0 bg-accent-yellow/10">
        <span className="text-[12px] font-bold text-accent-yellow tracking-tighter leading-none">JM</span>
      </div>
      <span className="hidden sm:block text-sm font-semibold text-content-primary tracking-tight">
        Jahongir<span className="text-accent-yellow">.</span>
      </span>
    </div>
  );
}
