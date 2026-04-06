import Link from 'next/link';
import type { Metadata } from 'next';
import { AboutPageClient } from './AboutPageClient';

export const metadata: Metadata = {
  title: 'project breakdown',
  description: 'a simple explanation of how watchparty is built',
};

export default function AboutPage() {
  return <AboutPageClient />;
}