/* ── Reusable Admin UI Components ── */

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-lg font-bold" style={{ color: "#111" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PrimaryBtn({
  children,
  onClick,
  disabled,
  loading,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
      style={{
        background: disabled || loading ? "#e5e7eb" : "#0f1117",
        color: disabled || loading ? "#9ca3af" : "#fff",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        border: "none",
      }}
    >
      {loading ? (
        <>
          <span
            className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
            style={{
              borderColor: "rgba(255,255,255,.3)",
              borderTopColor: "#fff",
            }}
          />
          Menyimpan...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function SecondaryBtn({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-medium px-4 py-2.5 rounded-lg transition-colors"
      style={{
        background: "#fff",
        color: "#374151",
        border: "1px solid #e5e7eb",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f7f4")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
    >
      {children}
    </button>
  );
}

export function DangerBtn({ children, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
      style={{
        background: loading ? "#fee2e2" : "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
        cursor: loading ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) =>
        !loading && (e.currentTarget.style.background = "#fee2e2")
      }
      onMouseLeave={(e) =>
        !loading && (e.currentTarget.style.background = "#fef2f2")
      }
    >
      {loading ? "Menghapus..." : children}
    </button>
  );
}

export function AdminInput({ label, required, ...props }) {
  return (
    <div>
      {label && (
        <label
          className="block text-xs font-semibold mb-1.5"
          style={{ color: "#374151" }}
        >
          {label}
          {required && <span style={{ color: "#ef4444" }}> *</span>}
        </label>
      )}
      <input
        {...props}
        className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition-colors"
        style={{
          background: "#f8f7f4",
          border: "1px solid #e5e7eb",
          color: "#111",
          ...props.style,
        }}
        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
      />
    </div>
  );
}

export function AdminTextarea({ label, required, rows = 3, ...props }) {
  return (
    <div>
      {label && (
        <label
          className="block text-xs font-semibold mb-1.5"
          style={{ color: "#374151" }}
        >
          {label}
          {required && <span style={{ color: "#ef4444" }}> *</span>}
        </label>
      )}
      <textarea
        rows={rows}
        {...props}
        className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition-colors resize-none"
        style={{
          background: "#f8f7f4",
          border: "1px solid #e5e7eb",
          color: "#111",
          ...props.style,
        }}
        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
      />
    </div>
  );
}

export function AdminSelect({ label, required, children, ...props }) {
  return (
    <div>
      {label && (
        <label
          className="block text-xs font-semibold mb-1.5"
          style={{ color: "#374151" }}
        >
          {label}
          {required && <span style={{ color: "#ef4444" }}> *</span>}
        </label>
      )}
      <select
        {...props}
        className="w-full text-sm px-3 py-2.5 rounded-lg outline-none transition-colors"
        style={{
          background: "#f8f7f4",
          border: "1px solid #e5e7eb",
          color: "#111",
          ...props.style,
        }}
        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
      >
        {children}
      </select>
    </div>
  );
}

export function AdminModal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;
  const widths = { sm: 380, md: 520, lg: 680, xl: 860 };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full flex flex-col"
        style={{
          maxWidth: widths[size],
          maxHeight: "88vh",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #f3f4f6" }}
        >
          <h2 className="text-sm font-bold" style={{ color: "#111" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "#9ca3af" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.color = "#374151";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 2l8 8M10 2l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}) {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-relaxed mb-5" style={{ color: "#6b7280" }}>
        {message}
      </p>
      <div className="flex gap-2 justify-end">
        <SecondaryBtn onClick={onClose}>Batal</SecondaryBtn>
        <DangerBtn onClick={onConfirm} loading={loading}>
          Hapus
        </DangerBtn>
      </div>
    </AdminModal>
  );
}

export function AdminTable({ columns, children, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{ borderBottom: "1px solid #f3f4f6", background: "#f8f7f4" }}
          >
            {columns.map((col, i) => (
              <th
                key={i}
                className="text-left px-4 py-3"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#9ca3af",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

export function AdminTd({ children, center, mono, muted }) {
  return (
    <td
      className="px-4 py-3.5"
      style={{
        fontSize: 13,
        color: muted ? "#9ca3af" : "#374151",
        fontFamily: mono ? "monospace" : "inherit",
        textAlign: center ? "center" : "left",
        borderBottom: "1px solid #f9fafb",
      }}
    >
      {children}
    </td>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Cari...",
  rightSlot,
}) {
  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1 max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2"
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
        >
          <circle cx="5.5" cy="5.5" r="4" stroke="#9ca3af" strokeWidth="1.2" />
          <path
            d="M9 9l2.5 2.5"
            stroke="#9ca3af"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-colors"
          style={{
            background: "#f8f7f4",
            border: "1px solid #e5e7eb",
            color: "#111",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>
      {rightSlot}
    </div>
  );
}

export function AlertBanner({ type = "error", message, onClose }) {
  const styles = {
    error: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
    warning: { bg: "#fefce8", border: "#fde68a", text: "#92400e" },
    info: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  };
  if (!message) return null;
  const s = styles[type];
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 opacity-60 hover:opacity-100"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 2l8 8M10 2l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, desc }) {
  return (
    <div className="py-16 text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ background: "#f3f4f6" }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect
            x="3"
            y="5"
            width="14"
            height="10"
            rx="2"
            stroke="#9ca3af"
            strokeWidth="1.2"
          />
          <path
            d="M7 9h6M7 12h4"
            stroke="#9ca3af"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-sm font-medium" style={{ color: "#374151" }}>
        {title}
      </p>
      {desc && (
        <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
          {desc}
        </p>
      )}
    </div>
  );
}

export function Badge({ children, color = "gray" }) {
  const map = {
    green: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
    blue: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
    yellow: { bg: "#fefce8", text: "#a16207", border: "#fde68a" },
    red: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
    purple: { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
    gray: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
  };
  const s = map[color];
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {children}
    </span>
  );
}
