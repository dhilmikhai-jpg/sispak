import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { LoadingSpinner, Alert } from "../../components/common/UI";
import { gejalaAPI, diagnosisAPI } from "../../services/api";

export default function KonsultasiPage() {
  const navigate = useNavigate();
  const [gejala, setGejala] = useState([]);
  const [selected, setSelected] = useState([]);
  const [namaUser, setNamaUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    gejalaAPI
      .getAll()
      .then((res) => setGejala(res.data.data))
      .catch(() =>
        setError("Gagal memuat data gejala. Pastikan server backend berjalan."),
      )
      .finally(() => setLoading(false));
  }, []);

  const toggle = (kode) =>
    setSelected((prev) =>
      prev.includes(kode) ? prev.filter((k) => k !== kode) : [...prev, kode],
    );

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setError("Pilih minimal 1 gejala terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await diagnosisAPI.diagnose({
        nama_user: namaUser || "Anonim",
        gejala_dipilih: selected,
      });
      navigate("/hasil", { state: { hasil: res.data.data } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal melakukan diagnosis. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = gejala.filter(
    (g) =>
      g.nama_gejala.toLowerCase().includes(search.toLowerCase()) ||
      g.kode_gejala.toLowerCase().includes(search.toLowerCase()),
  );

  const progressPct = Math.min((selected.length / 39) * 100, 100);

  if (loading)
    return (
      <div style={{ minHeight: "100vh", background: "#f0ede8" }}>
        <Navbar />
        <LoadingSpinner text="Memuat daftar gejala..." />
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede8" }}>
      <Navbar />

      {/* Page header */}
      <div
        style={{
          maxWidth: 1024,
          margin: "0 auto",
          padding: "24px 16px 8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 4,
              height: 28,
              borderRadius: 99,
              background: "#2563eb",
              flexShrink: 0,
            }}
          />
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-.02em",
            }}
          >
            Form Konsultasi
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 0 16px" }}>
          Centang semua gejala yang dialami komputer Anda, sistem akan
          menganalisis dengan metode{" "}
          <span style={{ fontWeight: 700, color: "#2563eb" }}>CBR + CF</span>{" "}
          untuk mendapatkan hasil diagnosis akurat.
        </p>
      </div>

      {error && (
        <div
          style={{ maxWidth: 1024, margin: "8px auto 0", padding: "0 16px" }}
        >
          <Alert type="error" message={error} onClose={() => setError("")} />
        </div>
      )}

      <div
        style={{
          maxWidth: 1024,
          margin: "0 auto",
          padding: "16px 16px 48px",
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 16,
        }}
      >
        {/* ── Gejala list panel ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid #ddd9d2",
            boxShadow: "0 2px 8px rgba(0,0,0,.05)",
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "2px solid #f0ede8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #fafaf9 0%, #fff 100%)",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Daftar Gejala Hardware
              </p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0" }}>
                Pilih semua gejala yang relevan dengan masalah komputer Anda
              </p>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 12px",
                borderRadius: 999,
                background: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #dbeafe",
              }}
            >
              {filtered.length} gejala
            </span>
          </div>

          {/* Search */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div style={{ position: "relative" }}>
              <svg
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="#9ca3af"
                  strokeWidth="1.2"
                />
                <path
                  d="M9.5 9.5l2 2"
                  stroke="#9ca3af"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari gejala berdasarkan nama atau kode..."
                style={{
                  width: "100%",
                  fontSize: 13,
                  padding: "9px 12px 9px 34px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#f8f7f4",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color .2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#93c5fd")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 480, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "48px 0",
                  fontSize: 13,
                  color: "#9ca3af",
                }}
              >
                Gejala tidak ditemukan
              </p>
            ) : (
              filtered.map((g) => {
                const isChecked = selected.includes(g.kode_gejala);
                return (
                  <label
                    key={g.kode_gejala}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 20px",
                      borderBottom: "1px solid #f9fafb",
                      cursor: "pointer",
                      background: isChecked
                        ? "linear-gradient(90deg, #eff6ff 0%, #fff 80%)"
                        : "transparent",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked)
                        e.currentTarget.style.background = "#fafaf9";
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Custom checkbox */}
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 5,
                        border: isChecked ? "none" : "1.5px solid #cbd5e1",
                        background: isChecked ? "#2563eb" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all .15s",
                      }}
                    >
                      {isChecked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path
                            d="M1 3.5l2.5 2.5L8 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(g.kode_gejala)}
                      style={{ display: "none" }}
                    />
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 10,
                        fontWeight: 700,
                        flexShrink: 0,
                        padding: "2px 6px",
                        borderRadius: 5,
                        background: isChecked ? "#2563eb" : "#f1f5f9",
                        color: isChecked ? "#fff" : "#2563eb",
                        transition: "all .15s",
                        minWidth: 36,
                        textAlign: "center",
                      }}
                    >
                      {g.kode_gejala}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: "#334155",
                        lineHeight: 1.5,
                      }}
                    >
                      {g.nama_gejala}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#9ca3af",
                        flexShrink: 0,
                        fontFamily: "monospace",
                        background: "#f8f7f4",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      MB: {g.mb}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* Progress bar */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #f1f5f9",
              background: "#fafaf9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                marginBottom: 6,
              }}
            >
              <span style={{ color: "#6b7280", fontWeight: 500 }}>
                {selected.length} gejala dipilih
              </span>
              <span style={{ color: "#2563eb", fontWeight: 700 }}>
                {progressPct.toFixed(0)}%
              </span>
            </div>
            <div
              style={{
                height: 3,
                borderRadius: 99,
                background: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPct}%`,
                  height: "100%",
                  borderRadius: 99,
                  background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                  transition: "width .4s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Nama card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid #ddd9d2",
              boxShadow: "0 1px 4px rgba(0,0,0,.04)",
            }}
          >
            <div
              style={{
                padding: "13px 16px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #fafaf9 0%, #fff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle
                      cx="6"
                      cy="4"
                      r="2"
                      stroke="#2563eb"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M2 10v-1a3 3 0 016 0v1"
                      stroke="#2563eb"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}
                >
                  Nama Anda
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  background: "#f3f4f6",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                opsional
              </span>
            </div>
            <div style={{ padding: 14 }}>
              <input
                type="text"
                value={namaUser}
                onChange={(e) => setNamaUser(e.target.value)}
                placeholder="Masukkan nama Anda..."
                style={{
                  width: "100%",
                  fontSize: 13,
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#f8f7f4",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color .2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#93c5fd")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "8px 0 0" }}>
                Nama akan ditampilkan di hasil diagnosis
              </p>
            </div>
          </div>

          {/* Selected summary */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid #ddd9d2",
              boxShadow: "0 1px 4px rgba(0,0,0,.04)",
            }}
          >
            <div
              style={{
                padding: "13px 16px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #fafaf9 0%, #fff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path
                      d="M1 5l3.5 3.5L11 1"
                      stroke="#16a34a"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}
                >
                  Gejala Dipilih
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: selected.length ? "#2563eb" : "#f1f5f9",
                  color: selected.length ? "#fff" : "#9ca3af",
                  transition: "all .2s",
                }}
              >
                {selected.length}
              </span>
            </div>
            <div style={{ padding: "12px 16px" }}>
              {selected.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="6" width="20" height="18" rx="2.5" stroke="#cbd5e1" strokeWidth="1.5"/><path d="M9 12h10M9 16h7" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"/><rect x="10" y="3" width="8" height="5" rx="1.5" stroke="#cbd5e1" strokeWidth="1.5"/></svg>
                  </div>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    Belum ada gejala dipilih.
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#d1d5db",
                      margin: "4px 0 0",
                    }}
                  >
                    Pilih dari daftar di samping
                  </p>
                </div>
              ) : (
                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  {selected.map((kode) => {
                    const g = gejala.find((x) => x.kode_gejala === kode);
                    return (
                      <div
                        key={kode}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          padding: "7px 0",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 10,
                            fontWeight: 700,
                            flexShrink: 0,
                            padding: "2px 5px",
                            borderRadius: 4,
                            background: "#2563eb",
                            color: "#fff",
                          }}
                        >
                          {kode}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            fontSize: 11,
                            color: "#6b7280",
                            lineHeight: 1.4,
                          }}
                        >
                          {g?.nama_gejala?.substring(0, 55)}
                          {g?.nama_gejala?.length > 55 ? "…" : ""}
                        </span>
                        <button
                          onClick={() => toggle(kode)}
                          style={{
                            fontSize: 11,
                            color: "#d1d5db",
                            cursor: "pointer",
                            border: "none",
                            background: "none",
                            flexShrink: 0,
                            padding: 0,
                            lineHeight: 1,
                            transition: "color .15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#ef4444")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#d1d5db")
                          }
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {selected.length > 0 && (
                <button
                  onClick={() => setSelected([])}
                  style={{
                    fontSize: 11,
                    color: "#ef4444",
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                    marginTop: 10,
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    padding: "6px",
                    borderRadius: 8,
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fef2f2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  Hapus semua gejala
                </button>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              onClick={handleSubmit}
              disabled={submitting || selected.length === 0}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                cursor: selected.length === 0 ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                background:
                  selected.length === 0
                    ? "#e2e8f0"
                    : "linear-gradient(135deg, #0a0c12 0%, #1a1f2e 100%)",
                color: selected.length === 0 ? "#94a3b8" : "#fff",
                transition: "opacity .15s",
              }}
              onMouseEnter={(e) => {
                if (selected.length > 0) e.currentTarget.style.opacity = ".9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {submitting ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "kspin .7s linear infinite",
                    }}
                  />
                  Memproses Diagnosis...
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      background: selected.length === 0 ? "#d1d5db" : "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path
                        d="M1.5 4.5h6M4.5 1.5l3 3-3 3"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  Diagnosa Sekarang
                </>
              )}
            </button>
            <p
              style={{
                fontSize: 11,
                textAlign: "center",
                marginTop: 8,
                color: "#9ca3af",
              }}
            >
              {selected.length === 0
                ? "Pilih minimal 1 gejala untuk melanjutkan"
                : `${selected.length} gejala dipilih · siap diproses`}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes kspin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .konsultasi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
