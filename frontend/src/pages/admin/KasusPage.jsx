import { useState, useEffect } from "react";
import { kasusAPI, kerusakanAPI, gejalaAPI } from "../../services/api";
import {
  PageHeader,
  PrimaryBtn,
  SecondaryBtn,
  AdminInput,
  AdminSelect,
  AdminModal,
  ConfirmModal,
  AdminTable,
  AdminTd,
  SearchBar,
  AlertBanner,
  EmptyState,
  Badge,
} from "../../components/common/AdminUI";

export default function KasusPage() {
  const [kasus, setKasus] = useState([]);
  const [kerusakan, setKerusakan] = useState([]);
  const [semuaGejala, setSemuaGejala] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    nama_kasus: "",
    kode_kerusakan: "",
    gejala_list: [],
    cf_nilai: "",
    status: "unverified",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [detailKasus, setDetailKasus] = useState(null);
  const [gejalaSearch, setGejalaSearch] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([kasusAPI.getAll(), kerusakanAPI.getAll(), gejalaAPI.getAll()])
      .then(([r1, r2, r3]) => {
        setKasus(r1.data.data);
        setKerusakan(r2.data.data);
        setSemuaGejala(r3.data.data);
      })
      .catch(() => setError("Gagal memuat data kasus."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setEditData(null);
    setForm({
      nama_kasus: "",
      kode_kerusakan: kerusakan[0]?.kode_kerusakan || "",
      gejala_list: [],
      cf_nilai: "",
      status: "unverified",
    });
    setFormError("");
    setGejalaSearch("");
    setModalOpen(true);
  };
  const openEdit = (k) => {
    const aktif = semuaGejala
      .filter((g) => k.gejala_vektor?.[g.kode_gejala] === 1)
      .map((g) => g.kode_gejala);
    setEditData(k);
    setForm({
      nama_kasus: k.nama_kasus || "",
      kode_kerusakan: k.kode_kerusakan,
      gejala_list: aktif,
      cf_nilai: k.cf_nilai || "",
      status: k.status,
    });
    setFormError("");
    setGejalaSearch("");
    setModalOpen(true);
  };
  const toggleGejala = (kode) =>
    setForm((p) => ({
      ...p,
      gejala_list: p.gejala_list.includes(kode)
        ? p.gejala_list.filter((k) => k !== kode)
        : [...p.gejala_list, kode],
    }));
  const handleSave = async () => {
    setFormError("");
    if (!form.kode_kerusakan || form.gejala_list.length === 0) {
      setFormError("Pilih kerusakan dan minimal 1 gejala.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, cf_nilai: parseFloat(form.cf_nilai) || 0 };
      if (editData) await kasusAPI.update(editData.id, payload);
      else await kasusAPI.create(payload);
      setModalOpen(false);
      setSuccess(
        editData ? "Kasus berhasil diperbarui." : "Kasus berhasil ditambahkan.",
      );
      load();
    } catch (e) {
      setFormError(e.response?.data?.message || "Gagal menyimpan kasus.");
    } finally {
      setSaving(false);
    }
  };
  const handleVerify = async (id) => {
    setVerifying(id);
    try {
      await kasusAPI.verify(id);
      setSuccess("Kasus berhasil diverifikasi!");
      load();
    } catch {
      setError("Gagal memverifikasi kasus.");
    } finally {
      setVerifying(null);
    }
  };
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await kasusAPI.delete(deleteId);
      setDeleteId(null);
      setSuccess("Kasus berhasil dihapus.");
      load();
    } catch {
      setError("Gagal menghapus kasus.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = kasus.filter((k) => {
    const matchFilter = filter === "all" || k.status === filter;
    const matchSearch =
      k.nama_kasus?.toLowerCase().includes(search.toLowerCase()) ||
      k.nama_kerusakan?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });
  const verifiedCount = kasus.filter((k) => k.status === "verified").length;
  const unverifiedCount = kasus.filter((k) => k.status === "unverified").length;
  const filteredGejala = semuaGejala.filter(
    (g) =>
      g.kode_gejala.toLowerCase().includes(gejalaSearch.toLowerCase()) ||
      g.nama_gejala.toLowerCase().includes(gejalaSearch.toLowerCase()),
  );

  const FILTERS = [
    { value: "all", label: "Semua", count: kasus.length },
    { value: "verified", label: "Terverifikasi", count: verifiedCount },
    { value: "unverified", label: "Belum Verifikasi", count: unverifiedCount },
  ];

  return (
    <div style={{ animation: "fadeIn .2s ease" }}>
      <PageHeader
        title="Basis Kasus CBR"
        subtitle="Kelola kasus untuk proses Case-Based Reasoning"
        action={<PrimaryBtn onClick={openCreate}>+ Tambah Kasus</PrimaryBtn>}
      />

      <div className="space-y-3">
        {error && (
          <AlertBanner
            type="error"
            message={error}
            onClose={() => setError("")}
          />
        )}
        {success && (
          <AlertBanner
            type="success"
            message={success}
            onClose={() => setSuccess("")}
          />
        )}
      </div>

      {/* Filter + search */}
      <div className="flex flex-wrap items-center gap-3 mt-4 mb-3">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              style={{
                background: filter === f.value ? "#0f1117" : "#fff",
                color: filter === f.value ? "#fff" : "#6b7280",
                border: `1px solid ${filter === f.value ? "#0f1117" : "#e5e7eb"}`,
              }}
            >
              {f.label}
              <span className="font-mono text-xs opacity-70">{f.count}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kasus..."
          />
        </div>
      </div>

      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid #e5e7eb" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-7 h-7 border-2 rounded-full animate-spin"
              style={{ borderColor: "#e5e7eb", borderTopColor: "#2563eb" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Belum ada kasus"
            desc="Tambahkan kasus baru untuk memulai proses CBR."
          />
        ) : (
          <AdminTable
            columns={[
              "ID",
              "Nama Kasus",
              "Kerusakan",
              "CF",
              "Status",
              "Gejala",
              "Aksi",
            ]}
          >
            {filtered.map((k) => {
              const jmlGejala = semuaGejala.filter(
                (g) => k.gejala_vektor?.[g.kode_gejala] === 1,
              ).length;
              const cfPct = (k.cf_nilai * 100).toFixed(1);
              const cfColor =
                k.cf_nilai >= 0.8
                  ? "#16a34a"
                  : k.cf_nilai >= 0.6
                    ? "#d97706"
                    : "#ef4444";
              return (
                <tr
                  key={k.id}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <AdminTd muted>
                    <span className="font-mono text-xs">#{k.id}</span>
                  </AdminTd>
                  <AdminTd>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "#111" }}
                    >
                      {k.nama_kasus}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                      {new Date(k.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </AdminTd>
                  <AdminTd>
                    <span
                      className="font-mono text-xs font-bold px-2 py-1 rounded-md"
                      style={{ background: "#eff6ff", color: "#1d4ed8" }}
                    >
                      {k.kode_kerusakan}
                    </span>
                    <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
                      {k.nama_kerusakan}
                    </p>
                  </AdminTd>
                  <AdminTd center>
                    <span
                      className="text-sm font-bold"
                      style={{ color: cfColor }}
                    >
                      {cfPct}%
                    </span>
                  </AdminTd>
                  <AdminTd center>
                    {k.status === "verified" ? (
                      <Badge color="green">✓ Terverifikasi</Badge>
                    ) : (
                      <Badge color="yellow">Belum Verifikasi</Badge>
                    )}
                  </AdminTd>
                  <AdminTd center>
                    <button
                      onClick={() => setDetailKasus(k)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                      style={{ background: "#eff6ff", color: "#1d4ed8" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#dbeafe")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#eff6ff")
                      }
                    >
                      {jmlGejala}
                    </button>
                  </AdminTd>
                  <td
                    className="px-4 py-3.5"
                    style={{ borderBottom: "1px solid #f9fafb" }}
                  >
                    <div className="flex gap-1.5 flex-wrap">
                      {k.status === "unverified" && (
                        <button
                          onClick={() => handleVerify(k.id)}
                          disabled={verifying === k.id}
                          className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                          style={{ background: "#f0fdf4", color: "#166534" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#dcfce7")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#f0fdf4")
                          }
                        >
                          {verifying === k.id ? "..." : "✓ Verifikasi"}
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(k)}
                        className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                        style={{ background: "#eff6ff", color: "#1d4ed8" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#dbeafe")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#eff6ff")
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(k.id)}
                        className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                        style={{ background: "#fef2f2", color: "#b91c1c" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fee2e2")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#fef2f2")
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminTable>
        )}
      </div>

      {/* Detail modal */}
      <AdminModal
        isOpen={!!detailKasus}
        onClose={() => setDetailKasus(null)}
        title={`Gejala: ${detailKasus?.nama_kasus}`}
        size="lg"
      >
        {detailKasus && (
          <div className="space-y-3">
            <div className="flex gap-3 text-sm flex-wrap">
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "#eff6ff", color: "#1d4ed8" }}
              >
                {detailKasus.nama_kerusakan}
              </span>
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "#f0fdf4", color: "#166534" }}
              >
                CF: {(detailKasus.cf_nilai * 100).toFixed(1)}%
              </span>
            </div>
            <div className="space-y-2">
              {semuaGejala
                .filter((g) => detailKasus.gejala_vektor?.[g.kode_gejala] === 1)
                .map((g) => (
                  <div
                    key={g.kode_gejala}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm"
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <span
                      className="font-mono font-bold shrink-0 text-xs"
                      style={{ color: "#1d4ed8" }}
                    >
                      {g.kode_gejala}
                    </span>
                    <span style={{ color: "#374151" }}>{g.nama_gejala}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </AdminModal>

      {/* Form modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editData ? `Edit Kasus #${editData.id}` : "Tambah Kasus Baru"}
        size="xl"
      >
        <div className="space-y-4">
          {formError && <AlertBanner type="error" message={formError} />}
          <AdminInput
            label="Nama Kasus"
            value={form.nama_kasus}
            placeholder="Contoh: Kasus Power Supply mati total"
            onChange={(e) =>
              setForm((p) => ({ ...p, nama_kasus: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <AdminSelect
              label="Kerusakan"
              required
              value={form.kode_kerusakan}
              onChange={(e) =>
                setForm((p) => ({ ...p, kode_kerusakan: e.target.value }))
              }
            >
              {kerusakan.map((k) => (
                <option key={k.kode_kerusakan} value={k.kode_kerusakan}>
                  {k.kode_kerusakan} - {k.nama_kerusakan}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              label="Nilai CF (0–1)"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={form.cf_nilai}
              placeholder="0.90"
              onChange={(e) =>
                setForm((p) => ({ ...p, cf_nilai: e.target.value }))
              }
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: "#374151" }}>
                Gejala <span style={{ color: "#ef4444" }}>*</span>
                <span
                  className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#eff6ff", color: "#1d4ed8" }}
                >
                  {form.gejala_list.length} dipilih
                </span>
              </p>
              <input
                type="text"
                value={gejalaSearch}
                onChange={(e) => setGejalaSearch(e.target.value)}
                placeholder="Cari gejala..."
                className="text-xs px-3 py-1.5 rounded-lg outline-none"
                style={{
                  background: "#f8f7f4",
                  border: "1px solid #e5e7eb",
                  color: "#111",
                  width: 160,
                }}
              />
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: "1px solid #e5e7eb",
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {filteredGejala.map((g, i) => (
                <label
                  key={g.kode_gejala}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                  style={{
                    borderBottom:
                      i < filteredGejala.length - 1
                        ? "1px solid #f9fafb"
                        : "none",
                    background: form.gejala_list.includes(g.kode_gejala)
                      ? "#eff6ff"
                      : "transparent",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                    style={{
                      border: form.gejala_list.includes(g.kode_gejala)
                        ? "none"
                        : "1.5px solid #d1d5db",
                      background: form.gejala_list.includes(g.kode_gejala)
                        ? "#2563eb"
                        : "transparent",
                    }}
                  >
                    {form.gejala_list.includes(g.kode_gejala) && (
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
                    className="sr-only"
                    checked={form.gejala_list.includes(g.kode_gejala)}
                    onChange={() => toggleGejala(g.kode_gejala)}
                  />
                  <span
                    className="font-mono text-xs font-bold shrink-0"
                    style={{ color: "#2563eb", width: 28 }}
                  >
                    {g.kode_gejala}
                  </span>
                  <span className="text-xs flex-1" style={{ color: "#374151" }}>
                    {g.nama_gejala}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <AdminSelect
            label="Status"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="unverified">Belum Terverifikasi</option>
            <option value="verified">Terverifikasi</option>
          </AdminSelect>
          <div className="flex gap-2 justify-end pt-1">
            <SecondaryBtn onClick={() => setModalOpen(false)}>
              Batal
            </SecondaryBtn>
            <PrimaryBtn onClick={handleSave} loading={saving}>
              {editData ? "Simpan Perubahan" : "Tambahkan"}
            </PrimaryBtn>
          </div>
        </div>
      </AdminModal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Kasus"
        message={`Yakin ingin menghapus kasus #${deleteId}? Kasus yang terverifikasi sebaiknya tidak dihapus.`}
      />
    </div>
  );
}
