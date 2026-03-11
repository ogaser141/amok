import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const geistSans = Geist({ variable: '--font-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AmOK — Aprende inglés con inteligencia',
  description: 'Aprende inglés de verdad con repetición espaciada SRS, niveles CEFR A1-C2 y ejercicios interactivos. Gratis y sin publicidad.',
  keywords: ['AmOK', 'aprender inglés', 'repetición espaciada', 'SRS', 'CEFR', 'inglés online'],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#052e16',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#14532d',
              color: '#d1fae5',
              border: '1px solid #166534',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#052e16' } },
            error:   { style: { background: '#3b0f0f', color: '#fca5a5', border: '1px solid #7f1d1d' } },
          }}
        />
      </body>
    </html>
  );
}
