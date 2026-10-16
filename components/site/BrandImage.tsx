import { site } from '@/lib/site'

export default function BrandImage() {
  return (
    <div
      style={{
        alignItems: 'center',
        background: '#f8fafc',
        color: '#18181b',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        padding: 72,
        width: '100%',
      }}
    >
      <span
        style={{
          background: '#4f46e5',
          borderRadius: 24,
          color: '#ffffff',
          display: 'flex',
          fontSize: 34,
          fontWeight: 700,
          marginBottom: 28,
          padding: '14px 26px',
        }}
      >
        {site.name}
      </span>
      <span
        style={{
          display: 'flex',
          fontSize: 54,
          fontWeight: 700,
          letterSpacing: '-2px',
          lineHeight: 1.15,
        }}
      >
        {site.tagline}
      </span>
      <span style={{ color: '#71717a', display: 'flex', fontSize: 24, marginTop: 28 }}>
        by {site.organization}
      </span>
    </div>
  )
}
