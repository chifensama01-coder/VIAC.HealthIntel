'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#050b14', color: '#e6edf5', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>HealthIntel hit an unexpected error</h1>
            <p style={{ fontSize: 14, color: '#9fb0c2', margin: '0 0 20px' }}>
              The application encountered a problem. Please reload to continue.
            </p>
            {error?.digest && <p style={{ fontSize: 11, color: '#5b6b7d', fontFamily: 'monospace' }}>ref: {error.digest}</p>}
            <button onClick={reset}
              style={{ marginTop: 12, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#2A9CE0', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
