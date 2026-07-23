import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSupabaseServerConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured.');
  }

  if (key.startsWith('sb_publishable_') || !key.startsWith('eyJ')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY must be the JWT anon public key (starts with eyJ...).',
    );
  }

  return { url, key };
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseServerConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. Middleware refreshes them.
        }
      },
    },
  });
}
