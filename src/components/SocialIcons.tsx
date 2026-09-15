import type { SocialLinks } from '@/lib/data/types';

/**
 * Icônes de réseaux sociaux — SVG inline maison.
 * Règle : seuls les réseaux configurés par l'administrateur sont affichés.
 * Aucun lien n'est inventé : si `social_links` est vide, la zone reste vide.
 */
const ICONS: { key: keyof SocialLinks; label: string; path: string }[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1Zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.4-.3.8-.3 1.9-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.1.8.3 1.9.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.4.3-.8.3-1.9.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.4-.1-.8-.3-1.9-.3-1.3-.1-1.7-.1-4.8-.1Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm5.2-3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    path: 'M13.5 21.5v-7.4h2.5l.4-2.9h-2.9V9.3c0-.8.2-1.4 1.4-1.4h1.6V5.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.1H7.9v2.9h2.5v7.4h3.1Z',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    path: 'M16.6 2.8c.4 1.9 1.6 3.2 3.6 3.4v2.6c-1.3 0-2.5-.4-3.6-1.1v5.9c0 3.4-2.3 5.7-5.4 5.7-3 0-5.3-2.2-5.3-5.2 0-3 2.3-5.2 5.4-5.2.3 0 .7 0 1 .1v2.7c-.3-.1-.7-.2-1-.2-1.5 0-2.7 1.1-2.7 2.6s1.2 2.6 2.6 2.6c1.5 0 2.7-1.1 2.7-2.9V2.8h2.7Z',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    path: 'M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z',
  },
];

export function ConfiguredSocialLinks({ links, className }: { links?: SocialLinks; className?: string }) {
  const configured = ICONS.filter((i) => Boolean(links?.[i.key]));
  if (configured.length === 0) return null;
  return (
    <div className={className}>
      {configured.map((i) => (
        <a
          key={i.key}
          href={links?.[i.key] as string}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={i.label}
          className="icon-btn focus-ring !h-10 !w-10"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true" focusable="false">
            <path d={i.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}
