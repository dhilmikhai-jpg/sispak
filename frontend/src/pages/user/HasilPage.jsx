import { useLocation, useNavigate, Link } from "react-router-dom";

export default function HasilPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.hasil) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f0ede8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 24,
            }}
          >
            🔍
          </div>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
            Data hasil tidak ditemukan.
          </p>
          <Link
            to="/konsultasi"
            style={{
              fontWeight: 700,
              padding: "10px 24px",
              borderRadius: 12,
              background: "#0a0c12",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Kembali ke Konsultasi
          </Link>
        </div>
      </div>
    );
  }

  const {
    diagnosis,
    certainty_factor,
    cbr,
    semua_kandidat,
    gejala_dipilih,
    nama_user,
  } = state.hasil;

  const cfPersen = certainty_factor.persen;

  const cfGradient =
    cfPersen >= 80
      ? "linear-gradient(135deg, #059669, #047857)"
      : cfPersen >= 60
        ? "linear-gradient(135deg, #d97706, #b45309)"
        : "linear-gradient(135deg, #dc2626, #b91c1c)";

  const cfLabel =
    certainty_factor.nilai >= 0.8
      ? "Hampir Pasti"
      : certainty_factor.nilai >= 0.6
        ? "Kemungkinan Besar"
        : certainty_factor.nilai >= 0.4
          ? "Mungkin"
          : "Tidak Pasti";

  const kandidatColor = (i) =>
    i === 0 ? "#10b981" : i === 1 ? "#3b82f6" : "#cbd5e1";

  const kandidatBg = (i) =>
    i === 0
      ? { background: "#f0fdf4", border: "1px solid #bbf7d0" }
      : { background: "#f8f7f4", border: "1px solid transparent" };

  const solusiBullets = diagnosis.solusi?.split("\n").filter(Boolean) || [];

  return (
    <div style={{ minHeight: "100vh", background: "#f0ede8" }}>
      {/* ── Topbar ── */}
      <div
        style={{
          height: 52,
          background: "#0a0c12",
          borderBottom: "1px solid #1a2035",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 12,
        }}
      >
        <button
          onClick={() => navigate("/konsultasi")}
          style={{
            color: "#5b6478",
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "none",
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e8f0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#5b6478")}
        >
          Konsultasi Baru
        </button>
        <div style={{ width: 1, height: 20, background: "#1a2035" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
          Hasil Diagnosis
        </span>
        <Link
          to="/"
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: "#4f8ef7",
            textDecoration: "none",
          }}
        >
          Beranda
        </Link>
      </div>

      <div
        style={{
          maxWidth: 780,
          margin: "0 auto",
          padding: "28px 16px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ── Main result card ── */}
        <div
          style={{
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid #ddd9d2",
            boxShadow: "0 2px 8px rgba(0,0,0,.07)",
          }}
        >
          {/* Dark gradient header */}
          <div
            style={{
              background: "linear-gradient(135deg, #0a0c12 0%, #0f1628 100%)",
              padding: "28px 28px 24px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  background: "rgba(79,142,247,.12)",
                  border: "1px solid rgba(79,142,247,.25)",
                  color: "#93bbfc",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4f8ef7",
                    display: "inline-block",
                  }}
                />
                HASIL DIAGNOSIS · {(nama_user || "ANONIM").toUpperCase()}
              </div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#f1f5f9",
                  marginBottom: 6,
                  letterSpacing: "-.02em",
                  margin: "0 0 6px",
                }}
              >
                {diagnosis.nama_kerusakan}
              </h1>
              <p
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#475569",
                  margin: 0,
                }}
              >
                Kode: {diagnosis.kode_kerusakan} ·{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* CF bubble */}
            <div
              style={{
                borderRadius: 16,
                padding: "16px 20px",
                textAlign: "center",
                flexShrink: 0,
                minWidth: 100,
                background: cfGradient,
              }}
            >
              <p
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {cfPersen.toFixed(1)}%
              </p>
              <p
                style={{
                  fontSize: 11,
                  marginTop: 6,
                  fontWeight: 600,
                  color: "rgba(255,255,255,.75)",
                  margin: "6px 0 0",
                }}
              >
                {cfLabel}
              </p>
            </div>
          </div>

          {/* Info body */}
          <div
            style={{
              background: "#fff",
              padding: "24px 28px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  marginBottom: 10,
                  margin: "0 0 10px",
                }}
              >
                Keterangan Kerusakan
              </p>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.75,
                  color: "#334155",
                  margin: 0,
                }}
              >
                {diagnosis.keterangan}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  margin: "0 0 10px",
                }}
              >
                Langkah Perbaikan
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {solusiBullets.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "8px 0",
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: 13,
                      color: "#334155",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        background: "#eff6ff",
                        color: "#2563eb",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ lineHeight: 1.6 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CBR Reference ── */}
        {cbr.kasus_referensi && (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "20px 24px",
              border: "1px solid #ddd9d2",
              boxShadow: "0 1px 4px rgba(0,0,0,.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                📁
              </div>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Kasus Referensi CBR
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                borderRadius: 14,
                padding: "16px 18px",
                background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                border: "1px solid #bfdbfe",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1e40af",
                    margin: "0 0 4px",
                  }}
                >
                  {cbr.kasus_referensi.nama_kasus}
                </p>
                <p style={{ fontSize: 11, color: "#3b82f6", margin: 0 }}>
                  Metode: {cbr.metode}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginTop: 4,
                    margin: "4px 0 0",
                  }}
                >
                  {cbr.keterangan_metode}
                </p>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#1d4ed8",
                    margin: 0,
                  }}
                >
                  {cbr.kasus_referensi.similarity_persen}%
                </p>
                <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                  Kemiripan
                </p>
              </div>
            </div>

            {cbr.kasus_mirip?.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#94a3b8",
                    margin: "0 0 8px",
                  }}
                >
                  Kasus lain yang mirip:
                </p>
                {cbr.kasus_mirip.slice(1).map((k) => (
                  <div
                    key={k.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderRadius: 10,
                      padding: "9px 12px",
                      background: "#f8f7f4",
                      marginBottom: 6,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "#334155" }}>{k.nama_kasus}</span>
                    <span style={{ color: "#94a3b8" }}>
                      {k.similarity_persen}% mirip
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Kandidat CF ── */}
        {semua_kandidat?.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "20px 24px",
              border: "1px solid #ddd9d2",
              boxShadow: "0 1px 4px rgba(0,0,0,.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "#faf5ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                📊
              </div>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Semua Kandidat Kerusakan
              </h2>
              <span
                style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}
              >
                Certainty Factor
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {semua_kandidat.map((k, i) => (
                <div
                  key={k.kode_kerusakan}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderRadius: 14,
                    padding: "12px 14px",
                    ...kandidatBg(i),
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: i === 0 ? "#dcfce7" : "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i === 0 ? (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4l3 3 5-6"
                          stroke="#16a34a"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span
                        style={{
                          fontSize: 10,
                          color: "#94a3b8",
                          fontWeight: 600,
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: i === 0 ? 700 : 500,
                        color: i === 0 ? "#0f172a" : "#334155",
                      }}
                    >
                      {k.nama_kerusakan}
                    </span>
                    <span
                      style={{ fontSize: 10, color: "#94a3b8", marginLeft: 6 }}
                    >
                      ({k.jumlah_gejala_cocok} gejala)
                    </span>
                  </div>
                  <div
                    style={{
                      width: 80,
                      height: 4,
                      borderRadius: 99,
                      background: "#e2e8f0",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(k.cf_persen, 100)}%`,
                        height: "100%",
                        borderRadius: 99,
                        background: kandidatColor(i),
                      }}
                    />
                  </div>
                  <div
                    style={{ textAlign: "right", flexShrink: 0, minWidth: 60 }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color:
                          i === 0 ? "#16a34a" : i < 2 ? "#374151" : "#9ca3af",
                        margin: 0,
                      }}
                    >
                      {k.cf_persen.toFixed(1)}%
                    </p>
                    <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
                      {k.interpretasi}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Gejala dipilih ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "20px 24px",
            border: "1px solid #ddd9d2",
            boxShadow: "0 1px 4px rgba(0,0,0,.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "#fff7ed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Gejala yang Dipilih
            </h2>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 999,
                background: "#f1f5f9",
                color: "#334155",
              }}
            >
              {gejala_dipilih?.length || 0}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {gejala_dipilih?.map((g) => (
              <div
                key={g.kode_gejala}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 999,
                  padding: "6px 12px",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  fontSize: 11,
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#2563eb",
                  }}
                >
                  {g.kode_gejala}
                </span>
                <span style={{ color: "#475569" }}>
                  {g.nama_gejala?.substring(0, 45)}
                  {g.nama_gejala?.length > 45 ? "…" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            paddingBottom: 8,
          }}
        >
          <Link
            to="/konsultasi"
            style={{
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: 14,
              background: "#0a0c12",
              color: "#fff",
              fontSize: 13,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🔄 Konsultasi Baru
          </Link>
          <button
            onClick={() => window.print()}
            style={{
              fontWeight: 500,
              padding: "12px 28px",
              borderRadius: 14,
              background: "#fff",
              color: "#334155",
              fontSize: 13,
              border: "1px solid #ddd9d2",
              cursor: "pointer",
            }}
          >
            🖨 Cetak Hasil
          </button>
          <Link
            to="/"
            style={{
              fontWeight: 500,
              padding: "12px 28px",
              borderRadius: 14,
              background: "#fff",
              color: "#334155",
              fontSize: 13,
              border: "1px solid #ddd9d2",
              textDecoration: "none",
            }}
          >
            🏠 Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
