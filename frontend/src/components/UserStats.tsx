import { GlobalStats, Quota } from '../types'

interface UserStatsProps {
  globalStats: GlobalStats | null
  allQuotas: Quota[]
}

export default function UserStats({ globalStats, allQuotas }: UserStatsProps) {
  return (
    <div style={{ width: 300, flexShrink: 0, padding: '2rem', borderLeft: '1px solid var(--border-color)', overflowY: 'auto', background: 'var(--sidebar-bg)' }}>
      {globalStats && (
        <div style={{ marginBottom: 32, padding: 16, background: 'var(--card-bg)', color: 'var(--text-primary)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Global Daily Usage</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 700, marginRight: 8 }}>{globalStats.total_count}</span>
              <span style={{ fontSize: 14, opacity: 0.8 }}>/ {globalStats.limit}</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, (globalStats.total_count / globalStats.limit) * 100)}%`,
              height: '100%',
              background: globalStats.total_count >= globalStats.limit ? '#e74c3c' : '#2ecc71',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>User Quotas</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {allQuotas.length === 0 && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No active users today.</p>}
        {allQuotas.map((q) => (
          <div key={q.user} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{q.user}</span>
            <span style={{ fontSize: 14, color: q.usage >= q.limit ? '#e74c3c' : '#27ae60', fontWeight: 700 }}>
              {q.usage}/{q.limit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

