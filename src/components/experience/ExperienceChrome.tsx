'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { AmbientEnvironment } from './AmbientEnvironment';

const LeftEdgeNavigation = dynamic(
  () => import('./LeftEdgeNavigation').then(module => module.LeftEdgeNavigation),
  { ssr: false },
);

const CentralTimeline = dynamic(
  () => import('./CentralTimeline').then(module => module.CentralTimeline),
  { ssr: false },
);

export function ExperienceChrome() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <AmbientEnvironment />}
      {/* Timeline + edge nav mount on every public route, including /blog and /blog/[slug]. */}
      {!isAdmin && <CentralTimeline />}
      {!isAdmin && <LeftEdgeNavigation />}
    </>
  );
}
