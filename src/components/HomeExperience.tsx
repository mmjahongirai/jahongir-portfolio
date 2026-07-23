'use client';

import { HomeSection } from './HomeSection';
import { AboutSection } from './AboutSection';
import { ProjectsSection } from './ProjectsSection';
import { BlogSection } from './BlogSection';
import { ContactSection } from './ContactSection';
import { Footer } from './Footer';

export function HomeExperience() {
  return (
    <>
      <HomeSection />
      <AboutSection />
      <ProjectsSection />
      <BlogSection />
      <ContactSection />
      <Footer />
    </>
  );
}
