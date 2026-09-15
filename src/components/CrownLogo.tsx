export default function CrownLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
      <path d="M2.5 7.5 6.9 11l5.1-7 5.1 7 4.4-3.5L19.6 19H4.4L2.5 7.5Z" />
      <rect x="4.4" y="20" width="15.2" height="2.2" rx="1.1" />
      <circle cx="2.5" cy="6" r="1.7" />
      <circle cx="12" cy="2.6" r="1.7" />
      <circle cx="21.5" cy="6" r="1.7" />
    </svg>
  );
}
