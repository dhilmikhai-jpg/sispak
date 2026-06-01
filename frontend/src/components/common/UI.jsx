// ── Loading Spinner ───────────────────────────────────────────
export function LoadingSpinner({ text = 'Memuat...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'Tidak ada data', desc = '' }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-medium text-gray-700">{title}</p>
      {desc && <p className="text-sm text-gray-400 mt-1">{desc}</p>}
    </div>
  )
}

// ── Alert ─────────────────────────────────────────────────────
export function Alert({ type = 'info', message, onClose }) {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error:   'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  }
  if (!message) return null
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm flex items-start justify-between gap-3 ${styles[type]}`}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} className="shrink-0 hover:opacity-70">✕</button>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col z-10`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Batal</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger">
          {loading ? 'Menghapus...' : 'Hapus'}
        </button>
      </div>
    </Modal>
  )
}

// ── Stat Card ─────────────────────────────────────────────────
export function StatCard({ icon, label, value, color = 'blue', sub }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red:    'bg-red-50 text-red-600',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── CF Badge ─────────────────────────────────────────────────
export function CFBadge({ persen }) {
  const color = persen >= 80 ? 'success' : persen >= 60 ? 'warning' : 'danger'
  return <span className={`badge-${color}`}>{persen?.toFixed(1)}%</span>
}

// ── Page Header ───────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
