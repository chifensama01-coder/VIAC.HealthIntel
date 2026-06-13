'use client'

import { Toaster as HotToaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'

export function Toaster() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? 'hsl(222 47% 9%)' : 'hsl(0 0% 100%)',
          color: isDark ? 'hsl(210 40% 95%)' : 'hsl(222 47% 11%)',
          border: `1px solid ${isDark ? 'hsl(222 47% 15%)' : 'hsl(214 32% 91%)'}`,
          borderRadius: '10px',
          fontSize: '13px',
          fontFamily: 'Inter, system-ui, sans-serif',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
        success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
        error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
      }}
    />
  )
}
