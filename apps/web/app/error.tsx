'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error('BasisForum route error:', error);
  }, [error]);

  return (
    <main style={{ minHeight: '100vh', boxSizing: 'border-box', padding: 'clamp(24px, 6vw, 96px)', background: '#000000', color: '#FFFFFF', fontFamily: 'Inter, Helvetica, Arial, sans-serif' }}>
      <section aria-labelledby="route-error-title" style={{ maxWidth: 760, borderTop: '2px solid #FFFFFF', borderBottom: '1px solid #404040', padding: '18px 0 28px' }}>
        <p style={{ margin: '0 0 14px', color: '#A3A3A3', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>SYSTEM NOTICE / RECOVERY</p>
        <h1 id="route-error-title" style={{ margin: 0, fontSize: 'clamp(1.25rem, 3vw, 2rem)', letterSpacing: '-0.03em' }}>This study page did not load.</h1>
        <p style={{ maxWidth: 520, margin: '14px 0 24px', color: '#A3A3A3', lineHeight: 1.55 }}>Your work is safe. Try the page again, or return to the discussion index and continue from there.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" onClick={reset} style={{ minHeight: 40, padding: '9px 14px', border: '1px solid #FFFFFF', borderRadius: 0, background: '#FFFFFF', color: '#000000', cursor: 'pointer', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Try again</button>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 40, boxSizing: 'border-box', padding: '9px 14px', border: '1px solid #404040', color: '#FFFFFF', textDecoration: 'none', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Discussion index</a>
        </div>
      </section>
    </main>
  );
}
