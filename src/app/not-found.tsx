import type { Metadata } from 'next';
import PagePlaceholder from '@/components/PagePlaceholder';

export const metadata: Metadata = {
  title: 'Page introuvable',
};

export default function NotFound() {
  return <PagePlaceholder titre="Page introuvable" />;
}
