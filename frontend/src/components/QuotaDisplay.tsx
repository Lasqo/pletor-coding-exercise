import { QuotaStatus } from '../types'

interface QuotaDisplayProps {
  quota: QuotaStatus
}

export const QuotaDisplay = ({ quota }: QuotaDisplayProps) => {
  return (
    <div style={{ marginBottom: 32, padding: 24, background: '#f8f9fa', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: 600, color: '#222', textAlign: 'center' }}>
        Upload Quotas
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div style={{ padding: 16, background: 'white', borderRadius: 8, border: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 600, color: '#555' }}>
            Your Quota ({quota.user})
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: quota.user_remaining > 0 ? '#27ae60' : '#e74c3c' }}>
            {quota.user_remaining}/{quota.user_limit}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#666' }}>
            uploads remaining today
          </p>
          {quota.user_remaining === 0 && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: '#e74c3c', fontWeight: 600 }}>
              ⚠️ Daily limit reached
            </p>
          )}
        </div>
        <div style={{ padding: 16, background: 'white', borderRadius: 8, border: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 600, color: '#555' }}>
            Global Quota
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: quota.global_remaining > 0 ? '#27ae60' : '#e74c3c' }}>
            {quota.global_remaining}/{quota.global_limit}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#666' }}>
            uploads remaining today (all users)
          </p>
          {quota.global_remaining === 0 && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: '#e74c3c', fontWeight: 600 }}>
              ⚠️ Global limit reached
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
