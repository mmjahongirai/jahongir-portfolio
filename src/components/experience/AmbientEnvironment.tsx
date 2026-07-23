'use client';

/**
 * Flat canvas only — same hex as theme-color / --chrome-bg.
 * No orbs/glows: those made the middle look different from top/bottom (sandwich seam).
 */
export function AmbientEnvironment() {
  return <div className="ambient-environment" aria-hidden="true" />;
}
