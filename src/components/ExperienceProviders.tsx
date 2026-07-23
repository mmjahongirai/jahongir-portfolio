'use client';

import { type ReactNode } from 'react';
import { ThemeProvider } from '@/lib/theme';
import { LanguageProvider } from '@/lib/language';
import { AuthProvider } from '@/lib/auth';
import { SmoothScrollProvider } from './experience/SmoothScrollProvider';

export function ExperienceProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
