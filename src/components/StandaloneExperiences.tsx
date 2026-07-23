'use client';

import { AboutSection } from './AboutSection';
import { ProjectsSection } from './ProjectsSection';
import { BlogSection } from './BlogSection';
import { ContactSection } from './ContactSection';
import { Footer } from './Footer';
import { AdminPanel } from './AdminPanel';

function StandaloneShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="standalone-page">{children}</div>
      <Footer />
    </>
  );
}

export function AboutExperience() {
  return <StandaloneShell><AboutSection /></StandaloneShell>;
}

export function ProjectsExperience() {
  return <StandaloneShell><ProjectsSection /></StandaloneShell>;
}

export function BlogExperience() {
  return <StandaloneShell><BlogSection /></StandaloneShell>;
}

export function ContactExperience() {
  return <StandaloneShell><ContactSection /></StandaloneShell>;
}

export function AdminExperience() {
  return <AdminPanel />;
}
