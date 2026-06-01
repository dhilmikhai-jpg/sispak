import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const menu = [
  {
    section: "Menu Utama",
    items: [
      {
        to: "/admin/dashboard",
        label: "Dashboard",
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect
              x="1"
              y="1"
              width="5.5"
              height="5.5"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <rect
              x="8.5"
              y="1"
              width="5.5"
              height="5.5"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <rect
              x="1"
              y="8.5"
              width="5.5"
              height="5.5"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <rect
              x="8.5"
              y="8.5"
              width="5.5"
              height="5.5"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Basis Pengetahuan",
    items: [
      {
        to: "/admin/gejala",
        label: "Data Gejala",
        badge: "39",
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle
              cx="7.5"
              cy="5.5"
              r="3"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M2 13c0-2 2.5-3.5 5.5-3.5S13 11 13 13"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
      {
        to: "/admin/kerusakan",
        label: "Data Kerusakan",
        badge: "9",
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle
              cx="7.5"
              cy="7.5"
              r="5.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M7.5 4.5v4M5.5 6.5l2-2 2 2"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        to: "/admin/kasus",
        label: "Basis Kasus CBR",
        badge: "12",
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect
              x="2"
              y="2.5"
              width="11"
              height="10"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M5 6.5h5M5 9.5h3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Laporan",
    items: [
      {
        to: "/admin/laporan",
        label: "Laporan Konsultasi",
        icon: (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M2 11l3.5-3.5 3 3L13 4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
    ],
  },
];

export default function AdminLayout({ children }) {
  const { pakar, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };
  const initials = (pakar?.nama || pakar?.username || "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f8f7f4" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 60 : 220, background: "#0f1117" }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ borderBottom: "1px solid #1f2937", minHeight: 56 }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#2563eb" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <rect x="1" y="2" width="14" height="10" rx="2" />
              <rect x="4" y="13" width="8" height="1.5" rx=".75" />
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p
                className="text-sm font-bold leading-tight"
                style={{ color: "#fff" }}
              >
                DiagnosaPC
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                Admin Panel
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto shrink-0 p-1 rounded transition-colors"
            style={{ color: "#374151" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#9ca3af")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d={collapsed ? "M5 3l4 4-4 4" : "M9 3L5 7l4 4"}
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 py-3 overflow-y-auto"
          style={{ padding: "12px 8px" }}
        >
          {menu.map((group) => (
            <div key={group.section} className="mb-4">
              {!collapsed && (
                <p
                  className="text-xs font-bold tracking-widest mb-2 px-2"
                  style={{
                    color: "#374151",
                    textTransform: "uppercase",
                    fontSize: 9,
                  }}
                >
                  {group.section}
                </p>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2.5 rounded-lg mb-0.5 transition-colors group"
                  style={({ isActive }) => ({
                    padding: collapsed ? "9px" : "8px 10px",
                    background: isActive ? "#1d4ed8" : "transparent",
                    justifyContent: collapsed ? "center" : "flex-start",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        style={{
                          color: isActive ? "#fff" : "#6b7280",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <>
                          <span
                            className="text-xs font-medium flex-1"
                            style={{ color: isActive ? "#fff" : "#9ca3af" }}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                              style={{
                                background: isActive ? "#3b82f6" : "#1f2937",
                                color: isActive ? "#fff" : "#6b7280",
                                fontSize: 9,
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: "1px solid #1f2937" }}>
          {!collapsed && (
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "#1d4ed8", color: "#fff" }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: "#d1d5db" }}
                >
                  {pakar?.nama || pakar?.username}
                </p>
                <p className="text-xs" style={{ color: "#6b7280" }}>
                  Pakar / Admin
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full rounded-lg p-2 transition-colors text-xs"
            style={{
              color: "#6b7280",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1f2937";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M5 2.5H2.5v8H5M8.5 4.5l2 2-2 2M10.5 6.5H5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {!collapsed && "Keluar"}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center px-6 shrink-0 gap-3"
          style={{
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            height: 52,
          }}
        >
          <div className="flex-1" />
          <a
            href="/"
            target="_blank"
            className="text-xs transition-colors"
            style={{ color: "#2563eb" }}
          >
            Lihat Halaman User ↗
          </a>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "#0f1117", color: "#fff" }}
          >
            {initials}
          </div>
        </header>

        {/* Content */}
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: "#f8f7f4" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
