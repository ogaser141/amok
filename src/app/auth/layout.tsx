import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-5">
        <Link href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500 hover:text-emerald-300 transition-colors">
          ← Volver
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
            <span className="text-3xl">🟢</span>
            <span className="font-black text-2xl tracking-tight text-emerald-100">
              Am<span className="text-emerald-400">OK</span>
            </span>
          </Link>
          <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-2xl p-7 shadow-xl"
            style={{ boxShadow: '0 0 40px rgba(16,185,129,0.06)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
