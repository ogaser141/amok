'use client';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  showTagline?: boolean;
}

export default function Logo({ size = 'md', href = '/', showTagline = false }: Props) {
  const { theme } = useTheme();

  const sizes = {
    sm: { am: 22, ok: 22, dot: 4, line: 1.2, gap: 18, w: 72, h: 50 },
    md: { am: 32, ok: 32, dot: 5, line: 1.5, gap: 26, w: 104, h: 72 },
    lg: { am: 46, ok: 46, dot: 7, line: 2,   gap: 38, w: 148, h: 104 },
  };

  const s = sizes[size];
  const isDark = theme === 'dark';

  const amColor  = isDark ? '#10b981' : '#059669';
  const okColor  = isDark ? '#34d399' : '#047857';
  const dotColor = isDark ? '#34d399' : '#059669';
  const glowOpacity = isDark ? '0.10' : '0.07';

  const svg = (
    <svg width={s.w} height={s.h} viewBox={`0 0 ${s.w} ${s.h}`} xmlns="http://www.w3.org/2000/svg">
      <circle cx={s.w / 2} cy={s.h / 2} r={s.h * 0.6} fill={amColor} opacity={glowOpacity}/>
      <text
        x={s.w / 2} y={s.h * 0.42}
        textAnchor="middle"
        fontFamily="system-ui,-apple-system,sans-serif"
        fontSize={s.am} fontWeight="700"
        fill={amColor} letterSpacing="2">AM</text>
      <text
        x={s.w / 2} y={s.h * 0.88}
        textAnchor="middle"
        fontFamily="system-ui,-apple-system,sans-serif"
        fontSize={s.ok} fontWeight="700"
        fill={okColor} letterSpacing="2">OK</text>
      <line
        x1={s.w * 0.18} y1={s.h * 0.52}
        x2={s.w * 0.82} y2={s.h * 0.52}
        stroke={amColor} strokeWidth={s.line} strokeLinecap="round"/>
      <circle cx={s.w * 0.88} cy={s.h * 0.18} r={s.dot} fill={dotColor}/>
    </svg>
  );

  const content = (
    <div className="flex flex-col items-center" style={{ gap: showTagline ? 4 : 0 }}>
      {svg}
      {showTagline && (
        <span style={{
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: '0.25em',
          color: amColor,
          opacity: 0.6,
          fontFamily: 'system-ui,-apple-system,sans-serif',
        }}>
          APRENDE INGLÉS
        </span>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
