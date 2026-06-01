import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="#2563eb" strokeWidth="1.5" />
        <path
          d="M10 7v4l2.5 1.5"
          stroke="#2563eb"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    bg: "bg-blue-50",
    title: "Akurat & Cepat",
    desc: "Kombinasi CBR + CF memberikan hasil diagnosis yang tepat dalam hitungan detik.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M4 10l4 4 8-8"
          stroke="#16a34a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    bg: "bg-green-50",
    title: "Solusi Lengkap",
    desc: "Setiap diagnosis disertai panduan perbaikan yang bisa dilakukan sendiri.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="3"
          y="5"
          width="14"
          height="10"
          rx="2"
          stroke="#ca8a04"
          strokeWidth="1.5"
        />
        <path
          d="M7 9h6M7 12h4"
          stroke="#ca8a04"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    bg: "bg-yellow-50",
    title: "Nilai Kepastian",
    desc: "Persentase keyakinan ditampilkan untuk setiap hasil agar lebih transparan.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="#9333ea" strokeWidth="1.5" />
        <path
          d="M7 10h6M10 7v6"
          stroke="#9333ea"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    bg: "bg-purple-50",
    title: "Basis Kasus CBR",
    desc: "Sistem belajar dari kasus sebelumnya untuk meningkatkan akurasi terus-menerus.",
  },
];

const hardware = [
  { name: "Power Supply", code: "K1", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" rx="2" stroke="#2563eb" strokeWidth="1.3"/><path d="M7 10h2l1-2 2 4 1-2h2" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { name: "Processor",   code: "K2", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="5" width="10" height="10" rx="1.5" stroke="#7c3aed" strokeWidth="1.3"/><rect x="7.5" y="7.5" width="5" height="5" rx="1" stroke="#7c3aed" strokeWidth="1.3"/><path d="M8 3v2M12 3v2M8 15v2M12 15v2M3 8h2M3 12h2M15 8h2M15 12h2" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { name: "Motherboard", code: "K3", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" stroke="#059669" strokeWidth="1.3"/><rect x="5" y="6" width="4" height="3" rx="1" stroke="#059669" strokeWidth="1.2"/><rect x="11" y="6" width="4" height="3" rx="1" stroke="#059669" strokeWidth="1.2"/><path d="M5 13h10M5 15.5h6" stroke="#059669" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { name: "Harddisk",    code: "K4", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="8" rx="2" stroke="#ea580c" strokeWidth="1.3"/><circle cx="14.5" cy="10" r="1.5" stroke="#ea580c" strokeWidth="1.2"/><path d="M5 10h5" stroke="#ea580c" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { name: "CD/DVD ROM",  code: "K5", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#0891b2" strokeWidth="1.3"/><circle cx="10" cy="10" r="2" stroke="#0891b2" strokeWidth="1.3"/><circle cx="10" cy="10" r="0.8" fill="#0891b2"/></svg> },
  { name: "VGA Card",    code: "K6", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="10" rx="2" stroke="#db2777" strokeWidth="1.3"/><rect x="5" y="8" width="5" height="4" rx="1" stroke="#db2777" strokeWidth="1.2"/><circle cx="13" cy="10" r="1.5" stroke="#db2777" strokeWidth="1.2"/><path d="M15 10h1.5" stroke="#db2777" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { name: "RAM",         code: "K7", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="7" width="16" height="6" rx="1.5" stroke="#9333ea" strokeWidth="1.3"/><path d="M5 7V5M8 7V5M11 7V5M14 7V5M5 13v2M8 13v2M11 13v2M14 13v2" stroke="#9333ea" strokeWidth="1.2" strokeLinecap="round"/><rect x="4" y="9" width="2" height="2" rx=".5" fill="#9333ea"/><rect x="7" y="9" width="2" height="2" rx=".5" fill="#9333ea"/><rect x="10" y="9" width="2" height="2" rx=".5" fill="#9333ea"/><rect x="13" y="9" width="2" height="2" rx=".5" fill="#9333ea"/></svg> },
  { name: "Slot Memory", code: "K8", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="2" stroke="#0284c7" strokeWidth="1.3"/><path d="M7 4v12M10 4v12M13 4v12" stroke="#0284c7" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/></svg> },
  { name: "Printer",     code: "K9", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="7" width="14" height="8" rx="1.5" stroke="#16a34a" strokeWidth="1.3"/><path d="M6 7V4h8v3" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 13h8M6 15.5h5" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round"/><circle cx="14.5" cy="10.5" r="1" fill="#16a34a"/></svg> },
];

const steps = [
  {
    num: "1",
    title: "Pilih gejala yang dialami",
    desc: "Centang gejala dari daftar 39 gejala hardware yang tersedia. Bisa pilih lebih dari satu.",
    tag: "Input gejala",
    tagColor: "bg-blue-50 text-blue-700",
  },
  {
    num: "2",
    title: "Sistem memproses CBR + CF",
    desc: "Mencari kasus serupa dari basis pengetahuan dan menghitung nilai Certainty Factor secara otomatis.",
    tag: "Proses AI",
    tagColor: "bg-green-50 text-green-700",
  },
  {
    num: "3",
    title: "Terima hasil & solusi",
    desc: "Dapatkan diagnosis kerusakan, persentase kepastian, kasus referensi, dan langkah perbaikan.",
    tag: "Hasil diagnosis",
    tagColor: "bg-purple-50 text-purple-700",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#f8f7f4" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        style={{ background: "#0f1117" }}
        className="px-4 pt-20 pb-20 text-center relative overflow-hidden"
      >
        {/* subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          {/* badge */}
          <div
            className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full text-xs font-semibold tracking-widest"
            style={{
              background: "rgba(37,99,235,.15)",
              border: "1px solid rgba(37,99,235,.3)",
              color: "#93c5fd",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            CBR + CERTAINTY FACTOR
          </div>

          <h1
            className="text-5xl font-bold leading-tight mb-5 tracking-tight"
            style={{ color: "#fff", letterSpacing: "-.02em" }}
          >
            Diagnosa Kerusakan
            <br />
            <span style={{ color: "#3b82f6" }}>Hardware Komputer</span>
          </h1>

          <p
            className="text-lg mb-9 max-w-xl mx-auto leading-relaxed"
            style={{ color: "#9ca3af" }}
          >
            Identifikasi kerusakan komputer secara cerdas menggunakan{" "}
            <strong style={{ color: "#d1d5db" }}>Case-Based Reasoning</strong>{" "}
            dan <strong style={{ color: "#d1d5db" }}>Certainty Factor</strong>.
            Dapatkan solusi perbaikan tanpa perlu ke teknisi.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/konsultasi"
              className="font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
              style={{ background: "#2563eb", color: "#fff" }}
            >
              Mulai Konsultasi
            </Link>
            <a
              href="#cara-kerja"
              className="font-medium px-8 py-3.5 rounded-xl text-base transition-colors"
              style={{
                background: "transparent",
                color: "#9ca3af",
                border: "1px solid #374151",
              }}
            >
              Cara Kerja
            </a>
          </div>

          {/* stats bar */}
          <div
            className="flex justify-center gap-10 mt-14 pt-10"
            style={{ borderTop: "1px solid #1f2937" }}
          >
            {[
              { num: "9", label: "Jenis Kerusakan" },
              { num: "39", label: "Gejala Hardware" },
              { num: "12+", label: "Kasus Referensi" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#fff" }}>
                  {s.num}
                </div>
                <div className="text-xs mt-1" style={{ color: "#6b7280" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-center text-xs font-bold tracking-widest mb-3 uppercase"
            style={{ color: "#2563eb" }}
          >
            Keunggulan Sistem
          </p>
          <h2
            className="text-3xl font-bold text-center mb-3"
            style={{ color: "#111" }}
          >
            Mengapa menggunakan sistem ini?
          </h2>
          <p className="text-center text-sm mb-10" style={{ color: "#6b7280" }}>
            Teknologi AI yang menggabungkan dua metode terbaik untuk diagnosis
            yang akurat
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className={`${f.bg} rounded-2xl p-6 border border-transparent hover:border-blue-200 transition-all hover:-translate-y-0.5`}
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  {f.icon}
                </div>
                <h3
                  className="font-semibold mb-2 text-sm"
                  style={{ color: "#111" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#6b7280" }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HARDWARE ── */}
      <section className="py-16 px-4" style={{ background: "#f8f7f4" }}>
        <div className="max-w-4xl mx-auto">
          <p
            className="text-center text-xs font-bold tracking-widest mb-3 uppercase"
            style={{ color: "#2563eb" }}
          >
            Cakupan Hardware
          </p>
          <h2
            className="text-3xl font-bold text-center mb-2"
            style={{ color: "#111" }}
          >
            Hardware yang dapat didiagnosa
          </h2>
          <p className="text-center text-sm mb-8" style={{ color: "#6b7280" }}>
            9 komponen hardware dengan 39 gejala tercakup dalam sistem
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
            {hardware.map((h) => (
              <div
                key={h.code}
                className="bg-white rounded-xl p-3 text-center border border-gray-100 hover:border-blue-200 hover:-translate-y-0.5 transition-all cursor-default"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                  {h.icon}
                </div>
                <p
                  className="text-xs font-medium leading-tight"
                  style={{ color: "#374151" }}
                >
                  {h.name}
                </p>
                <p
                  className="text-xs font-mono mt-0.5"
                  style={{ color: "#9ca3af" }}
                >
                  {h.code}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARA KERJA ── */}
      <section id="cara-kerja" className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-center text-xs font-bold tracking-widest mb-3 uppercase"
            style={{ color: "#2563eb" }}
          >
            Cara Kerja
          </p>
          <h2
            className="text-3xl font-bold text-center mb-2"
            style={{ color: "#111" }}
          >
            3 langkah mendapat diagnosis
          </h2>
          <p className="text-center text-sm mb-10" style={{ color: "#6b7280" }}>
            Proses cepat dan mudah tanpa perlu keahlian teknis
          </p>

          <div className="space-y-3">
            {steps.map((s) => (
              <div
                key={s.num}
                className="flex gap-5 items-start bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 text-white"
                  style={{ background: "#0f1117" }}
                >
                  {s.num}
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "#111" }}>
                    {s.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: "#6b7280" }}
                  >
                    {s.desc}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md ${s.tagColor}`}
                  >
                    {s.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-16 px-4 text-center"
        style={{ background: "#0f1117" }}
      >
        <h2 className="text-3xl font-bold mb-3" style={{ color: "#fff" }}>
          Siap mendiagnosa komputer Anda?
        </h2>
        <p className="text-sm mb-8" style={{ color: "#6b7280" }}>
          Gratis, cepat, dan tidak perlu membawa ke teknisi terlebih dahulu
        </p>
        <Link
          to="/konsultasi"
          className="inline-block font-semibold px-10 py-3.5 rounded-xl text-base"
          style={{ background: "#2563eb", color: "#fff" }}
        >
          Mulai Konsultasi Sekarang
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-10 px-4 text-center"
        style={{ background: "#0f1117", borderTop: "1px solid #1f2937" }}
      >
        <p
          className="font-semibold mb-1"
          style={{ color: "#fff", fontSize: "14px" }}
        >
          DiagnosaPC — Sistem Pakar Kerusakan Komputer Kelompok 8
        </p>
        <p style={{ color: "#6b7280", fontSize: "12px" }}>
          Metode Case-Based Reasoning (CBR) + Certainty Factor (CF)
        </p>
        <p
          className="mt-4 pt-4 text-xs"
          style={{ color: "#374151", borderTop: "1px solid #1f2937" }}
        >
          © 2026 DiagnosaPC. All rights reserved. Kelompok 8.
        </p>
      </footer>
    </div>
  );
}
