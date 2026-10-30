// components/MessengerBtn.tsx
'use client';

import { usePathname } from 'next/navigation';

export default function MessengerBtn() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const username = process.env.NEXT_PUBLIC_FB_PAGE_USERNAME || '';
  const pageId = process.env.NEXT_PUBLIC_FB_PAGE_ID || '';
  const href = username ? `https://m.me/${username}` : `https://m.me/${pageId}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat Facebook"
      title="Chat Facebook"
      className="group grid place-items-center h-12 w-12 rounded-full bg-white/85 backdrop-blur-md
                 ring-1 ring-black/10 shadow-[0_10px_24px_rgba(38,83,237,.15)]
                 text-[#2653ED] hover:text-white transition-all duration-300 hover:shadow-[0_18px_36px_rgba(38,83,237,.25)]
                 fixed right-3 sm:right-5 z-50"
      style={{ bottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }} // dưới cùng của cụm CTA dọc
    >
      {/* icon messenger */}
      <svg viewBox="0 0 24 24" className="h-6 w-6 relative z-[1]" aria-hidden>
        <path d="M12 2C6.48 2 2 6 2 11.3c0 2.8 1.3 5.3 3.4 7v3.7l3.1-1.7c1 .3 2.1.5 3.5.5 5.52 0 10-4 10-9.3S17.52 2 12 2Zm4.78 8.9-2.62 2.78a1.2 1.2 0 0 1-1.66.09l-1.46-1.23-2.89 2.67a.6.6 0 0 1-.94-.16.64.64 0 0 1 .1-.73l2.62-2.78a1.2 1.2 0 0 1 1.66-.09l1.46 1.23 2.89-2.67a.6.6 0 0 1 .94.16.64.64 0 0 1-.1.73Z" />
      </svg>

      {/* nền gradient khi hover + wiggle nhẹ để hút mắt */}
      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition">
        <span className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(135deg,#2653ED 0%,#4868F6 100%)' }} />
        <span className="absolute inset-0 rounded-full ring-2"
              style={{ boxShadow: '0 0 0 2px #F5ED42 inset' }} />
      </span>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) { .msgr-wiggle { animation: none; } }
        @keyframes msgrWiggle {
          0% { transform: translateY(0) rotate(0) scale(1); }
          2% { transform: translateY(-1px) rotate(-6deg) scale(1.06); }
          4% { transform: translateY(0) rotate(5deg) scale(1.05); }
          6% { transform: translateY(-1px) rotate(-3deg) scale(1.04); }
          8% { transform: translateY(0) rotate(0) scale(1); }
          100% { transform: translateY(0) rotate(0) scale(1); }
        }
        a.group { animation: msgrWiggle 14s ease-in-out infinite 7s; }
      `}</style>
    </a>
  );
}
