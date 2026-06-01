import { useState, useEffect } from "react";
import { diagnosisAPI } from "../../services/api";
import {
  PageHeader,
  AdminModal,
  AdminTable,
  AdminTd,
  SearchBar,
  AlertBanner,
  EmptyState,
  Badge,
} from "../../components/common/AdminUI";

const metodeInfo = (m) => {
  const map = {
    CBR_dominant: { label: "CBR Dominan", color: "blue" },
    CBR_CF_agree: { label: "CBR + CF Sepakat", color: "green" },
    CBR_CF_disagree_CBR_wins: { label: "CBR Menang", color: "blue" },
    CBR_CF_disagree_CF_wins: { label: "CF Menang", color: "yellow" },
    CF_only: { label: "CF Saja", color: "gray" },
    CF_dominant: { label: "CF Dominan", color: "yellow" },
  };
  return map[m] || { label: m || "-", color: "gray" };
};

export default function LaporanPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [statistik, setStatistik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const load = (offset = 0) => {
    setLoading(true);
    diagnosisAPI
      .getLaporan({ limit: LIMIT, offset })
      .then((res) => {
        setData(res.data.data);
        setTotal(res.data.pagination.total);
        setStatistik(res.data.statistik);
      })
      .catch(() => setError("Gagal memuat laporan."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load(page * LIMIT);
  }, [page]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetail({});
    try {
      const res = await diagnosisAPI.getDetailLaporan(id);
      setDetail(res.data.data);
    } catch {
      setDetail(null);
      setError("Gagal memuat detail.");
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = data.filter(
    (d) =>
      d.nama_user?.toLowerCase().includes(search.toLowerCase()) ||
      d.nama_kerusakan?.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(total / LIMIT);
  const maxJumlah = statistik?.kerusakan_terbanyak?.[0]?.jumlah || 1;

  return (
    <div style={{ animation: "fadeIn .2s ease" }}>
      <PageHeader
        title="Laporan Konsultasi"
        subtitle={`${total} konsultasi tercatat dalam sistem`}
        action={
          <button
            onClick={() => load(page * LIMIT)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-lg transition-colors"
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
        }
      />

      {error && (
        <AlertBanner
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {/* Stats */}
      {statistik && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 mb-5">
          <div
            className="bg-white rounded-xl p-5"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: "#111" }}>
              Kerusakan terbanyak didiagnosa
            </p>
            <div className="space-y-2.5">
              {statistik.kerusakan_terbanyak?.map((k, i) => {
                const colors = [
                  "#2563eb",
                  "#10b981",
                  "#f59e0b",
                  "#8b5cf6",
                  "#ec4899",
                ];
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className="text-xs w-5 text-center"
                      style={{ color: "#9ca3af" }}
                    >
                      {i + 1}
                    </span>
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
                          width: `${Math.round((k.jumlah / maxJumlah) * 100)}%`,
                          background: colors[i % colors.length],
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold w-6 text-right"
                      style={{ color: "#374151" }}
                    >
                      {k.jumlah}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className="bg-white rounded-xl p-5"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: "#111" }}>
              Konsultasi per bulan
            </p>
            <div className="space-y-2.5">
              {statistik.per_bulan?.slice(0, 6).map((b, i) => {
                const max = statistik.per_bulan[0]?.jumlah || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className="text-xs font-mono w-14 shrink-0"
                      style={{ color: "#9ca3af" }}
                    >
                      {b.bulan}
                    </span>
                    <div
                      className="flex-1 h-1.5 rounded-full"
                      style={{ background: "#f3f4f6" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((b.jumlah / max) * 100)}%`,
                          background: "#10b981",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold w-5 text-right"
                      style={{ color: "#374151" }}
                    >
                      {b.jumlah}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid #f3f4f6" }}
        >
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama user atau kerusakan..."
            rightSlot={
              <span className="text-xs" style={{ color: "#9ca3af" }}>
                {filtered.length} hasil
              </span>
            }
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-7 h-7 border-2 rounded-full animate-spin"
              style={{ borderColor: "#e5e7eb", borderTopColor: "#2563eb" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Belum ada data konsultasi" />
        ) : (
          <AdminTable
            columns={[
              "ID",
              "Nama User",
              "Hasil Diagnosis",
              "CF",
              "Similarity",
              "Metode",
              "Tanggal",
              "",
            ]}
          >
            {filtered.map((d) => {
              const m = metodeInfo(d.metode_diagnosis);
              const cfPct = (d.cf_hasil || 0) * 100;
              const cfColor =
                cfPct >= 80 ? "#16a34a" : cfPct >= 60 ? "#d97706" : "#374151";
              return (
                <tr
                  key={d.id}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <AdminTd muted>
                    <span className="font-mono text-xs">#{d.id}</span>
                  </AdminTd>
                  <AdminTd>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "#111" }}
                    >
                      {d.nama_user || "Anonim"}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <p
                      className="font-medium text-sm"
                      style={{ color: "#374151" }}
                    >
                      {d.nama_kerusakan || "-"}
                    </p>
                    <p
                      className="text-xs font-mono mt-0.5"
                      style={{ color: "#9ca3af" }}
                    >
                      {d.kode_kerusakan_hasil}
                    </p>
                  </AdminTd>
                  <AdminTd center>
                    <span
                      className="text-sm font-bold"
                      style={{ color: cfColor }}
                    >
                      {cfPct.toFixed(1)}%
                    </span>
                  </AdminTd>
                  <AdminTd center>
                    <span className="text-xs" style={{ color: "#9ca3af" }}>
                      {d.similarity_score
                        ? `${(d.similarity_score * 100).toFixed(1)}%`
                        : "—"}
                    </span>
                  </AdminTd>
                  <AdminTd center>
                    <Badge color={m.color}>{m.label}</Badge>
                  </AdminTd>
                  <AdminTd muted>
                    <span className="text-xs">
                      {new Date(d.tanggal).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </AdminTd>
                  <td
                    className="px-4 py-3.5"
                    style={{ borderBottom: "1px solid #f9fafb" }}
                  >
                    <button
                      onClick={() => openDetail(d.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      style={{ background: "#eff6ff", color: "#1d4ed8" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#dbeafe")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#eff6ff")
                      }
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </AdminTable>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderTop: "1px solid #f3f4f6" }}
          >
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Hal {page + 1} dari {totalPages} · {total} total
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs px-3 py-2 rounded-lg font-medium transition-colors"
                style={{
                  background: page === 0 ? "#f3f4f6" : "#fff",
                  color: page === 0 ? "#9ca3af" : "#374151",
                  border: "1px solid #e5e7eb",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                }}
              >
                ← Prev
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs px-3 py-2 rounded-lg font-medium transition-colors"
                style={{
                  background: page >= totalPages - 1 ? "#f3f4f6" : "#fff",
                  color: page >= totalPages - 1 ? "#9ca3af" : "#374151",
                  border: "1px solid #e5e7eb",
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AdminModal
        isOpen={detail !== null}
        onClose={() => setDetail(null)}
        title={`Detail Konsultasi #${detail?.id}`}
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-10">
            <div
              className="w-7 h-7 border-2 rounded-full animate-spin"
              style={{ borderColor: "#e5e7eb", borderTopColor: "#2563eb" }}
            />
          </div>
        ) : detail?.id ? (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Nama User", value: detail.nama_user || "Anonim" },
                {
                  label: "Tanggal",
                  value: new Date(detail.tanggal).toLocaleString("id-ID"),
                },
                {
                  label: "Diagnosis",
                  value: detail.nama_kerusakan,
                  bold: true,
                  color: "#1d4ed8",
                },
                {
                  label: "Certainty Factor",
                  value: `${((detail.cf_hasil || 0) * 100).toFixed(2)}%`,
                  bold: true,
                  color: "#16a34a",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-xl p-3"
                  style={{ background: "#f8f7f4", border: "1px solid #e5e7eb" }}
                >
                  <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>
                    {row.label}
                  </p>
                  <p
                    className={`text-sm ${row.bold ? "font-bold" : "font-medium"}`}
                    style={{ color: row.color || "#111" }}
                  >
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
            {detail.solusi && (
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: "#9ca3af" }}
                >
                  Solusi
                </p>
                <div
                  className="rounded-xl p-4 text-xs leading-relaxed whitespace-pre-line"
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#374151",
                  }}
                >
                  {detail.solusi}
                </div>
              </div>
            )}
            {Array.isArray(detail.gejala_dipilih) &&
              detail.gejala_dipilih.length > 0 && (
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-2"
                    style={{ color: "#9ca3af" }}
                  >
                    Gejala Dipilih ({detail.gejala_dipilih.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.gejala_dipilih.map((kode) => (
                      <span
                        key={kode}
                        className="font-mono text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        {kode}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
