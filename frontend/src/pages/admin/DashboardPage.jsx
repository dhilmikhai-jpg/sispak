import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { diagnosisAPI } from "../../services/api";

const StatCard = ({ icon, label, value, trend, trendColor, iconBg }) => (
  <div
    className="bg-white rounded-xl p-5"
    style={{ border: "1px solid #e5e7eb" }}
  >
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
      style={{ background: iconBg }}
    >
      {icon}
    </div>
    <p className="text-2xl font-bold" style={{ color: "#111" }}>
      {value}
    </p>
    <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
      {label}
    </p>
    {trend && (
      <p className="text-xs font-semibold mt-1" style={{ color: trendColor }}>
        {trend}
      </p>
    )}
  </div>
);

const QuickLink = ({ to, icon, label, bg, color }) => (
  <Link
    to={to}
    className="rounded-xl p-4 text-center border transition-colors flex flex-col items-center gap-2"
    style={{ border: "1px solid #e5e7eb", background: "#fff" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "#93c5fd";
      e.currentTarget.style.background = "#eff6ff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "#e5e7eb";
      e.currentTarget.style.background = "#fff";
    }}
  >
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ background: bg }}
    >
      <span style={{ color, fontSize: 14 }}>{icon}</span>
    </div>
    <span className="text-xs font-semibold" style={{ color: "#374151" }}>
      {label}
    </span>
  </Link>
);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    diagnosisAPI
      .getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => setError("Gagal memuat data dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: "#e5e7eb", borderTopColor: "#2563eb" }}
        />
      </div>
    );

  if (error)
    return (
      <div
        className="rounded-xl p-4 text-sm"
        style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#991b1b",
        }}
      >
        {error}
      </div>
    );

  const {
    ringkasan,
    kerusakan_terbanyak,
    konsultasi_per_bulan,
    status_kasus_cbr,
  } = data;

  const pieData = (status_kasus_cbr || []).map((s) => ({
    name: s.status === "verified" ? "Terverifikasi" : "Belum Verifikasi",
    value: s.total,
  }));
  const PIE_COLORS = ["#2563eb", "#e5e7eb"];
  const totalKasus = pieData.reduce((a, b) => a + b.value, 0);
  const verifiedPct = totalKasus
    ? Math.round((pieData[0]?.value / totalKasus) * 100)
    : 0;

  const maxKerusakan = kerusakan_terbanyak?.[0]?.jumlah || 1;

  return (
    <div className="space-y-5" style={{ animation: "fadeIn .2s ease" }}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#111" }}>
            Dashboard
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
            Ringkasan sistem pakar diagnosa komputer
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors"
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            color: "#374151",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f7f4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M10 6A4 4 0 112 6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M10 3v3H7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2l2 4 5 .7-3.6 3.5.9 4.9L8 13l-4.3 2.1.9-4.9L1 6.7 6 6z"
                stroke="#2563eb"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          }
          iconBg="#eff6ff"
          label="Total Konsultasi"
          value={ringkasan.total_konsultasi}
          trend="Semua waktu"
          trendColor="#6b7280"
        />
        <StatCard
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2C5.79 2 4 3.79 4 6s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
                stroke="#16a34a"
                strokeWidth="1.2"
              />
              <path
                d="M2 14c0-2.21 2.69-4 6-4s6 1.79 6 4"
                stroke="#16a34a"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          }
          iconBg="#f0fdf4"
          label="Total Gejala"
          value={ringkasan.total_gejala}
          trend="Aktif semua"
          trendColor="#16a34a"
        />
        <StatCard
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="5.5"
                stroke="#ea580c"
                strokeWidth="1.2"
              />
              <path
                d="M8 5v4"
                stroke="#ea580c"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="8" cy="11" r=".75" fill="#ea580c" />
            </svg>
          }
          iconBg="#fff7ed"
          label="Jenis Kerusakan"
          value={ringkasan.total_kerusakan}
          trend="Hardware"
          trendColor="#6b7280"
        />
        <StatCard
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="2"
                y="3"
                width="12"
                height="10"
                rx="1.5"
                stroke="#9333ea"
                strokeWidth="1.2"
              />
              <path
                d="M5 7h6M5 10h4"
                stroke="#9333ea"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          }
          iconBg="#fdf4ff"
          label="Kasus CBR"
          value={ringkasan.total_kasus_cbr}
          trend={`${pieData[0]?.value || 0} terverifikasi`}
          trendColor="#9333ea"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart kerusakan */}
        <div
          className="bg-white rounded-xl p-5"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#111" }}>
                Kerusakan terbanyak
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                Berdasarkan jumlah konsultasi
              </p>
            </div>
            <Link
              to="/admin/laporan"
              className="text-xs"
              style={{ color: "#2563eb" }}
            >
              Lihat laporan →
            </Link>
          </div>
          {kerusakan_terbanyak?.length > 0 ? (
            <div className="space-y-2.5">
              {kerusakan_terbanyak.map((k, i) => {
                const colors = [
                  "#2563eb",
                  "#10b981",
                  "#f59e0b",
                  "#8b5cf6",
                  "#ec4899",
                ];
                const pct = Math.round((k.jumlah / maxKerusakan) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className="text-xs w-28 truncate shrink-0"
                      style={{ color: "#374151" }}
                    >
                      {k.nama_kerusakan?.replace("Kerusakan ", "")}
                    </span>
                    <div
                      className="flex-1 h-1.5 rounded-full"
                      style={{ background: "#f3f4f6" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: colors[i % colors.length],
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold w-6 text-right shrink-0"
                      style={{ color: "#374151" }}
                    >
                      {k.jumlah}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p
              className="text-sm text-center py-8"
              style={{ color: "#9ca3af" }}
            >
              Belum ada data
            </p>
          )}
        </div>

        {/* Pie status kasus */}
        <div
          className="bg-white rounded-xl p-5"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#111" }}>
                Status kasus CBR
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                Verifikasi basis kasus
              </p>
            </div>
            <Link
              to="/admin/kasus"
              className="text-xs"
              style={{ color: "#2563eb" }}
            >
              Kelola →
            </Link>
          </div>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div
                className="relative shrink-0"
                style={{ width: 100, height: 100 }}
              >
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="16"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="16"
                    strokeDasharray={`${verifiedPct * 2.39} 239`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold" style={{ color: "#111" }}>
                    {verifiedPct}%
                  </span>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: PIE_COLORS[i] }}
                      />
                      <span className="text-xs" style={{ color: "#374151" }}>
                        {d.name}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#111" }}
                    >
                      {d.value}
                    </span>
                  </div>
                ))}
                {pieData[1]?.value > 0 && (
                  <div
                    className="rounded-lg p-2.5 mt-2 text-xs"
                    style={{ background: "#eff6ff", color: "#1d4ed8" }}
                  >
                    {pieData[1].value} kasus menunggu verifikasi
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p
              className="text-sm text-center py-8"
              style={{ color: "#9ca3af" }}
            >
              Belum ada data
            </p>
          )}
        </div>
      </div>

      {/* Tren bulan */}
      {konsultasi_per_bulan?.length > 0 && (
        <div
          className="bg-white rounded-xl p-5"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#111" }}>
                Tren konsultasi per bulan
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                12 bulan terakhir
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={[...konsultasi_per_bulan].reverse()}
              margin={{ left: -24, right: 4 }}
            >
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f1117",
                  border: "1px solid #1f2937",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#fff",
                }}
                formatter={(v) => [v, "Konsultasi"]}
              />
              <Bar
                dataKey="jumlah"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickLink to="/admin/gejala"    icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 12c0-2 2.2-3.5 5-3.5s5 1.5 5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>} label="Kelola Gejala"    bg="#f0fdf4" color="#16a34a" />
        <QuickLink to="/admin/kerusakan" icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="9.5" r=".6" fill="currentColor"/></svg>} label="Kelola Kerusakan" bg="#eff6ff" color="#2563eb" />
        <QuickLink to="/admin/kasus"     icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 6h5M4.5 8.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>} label="Basis Kasus CBR"  bg="#fdf4ff" color="#9333ea" />
        <QuickLink to="/admin/laporan"   icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10l3-3 2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Lihat Laporan"    bg="#fff7ed" color="#ea580c" />
      </div>
    </div>
  );
}
