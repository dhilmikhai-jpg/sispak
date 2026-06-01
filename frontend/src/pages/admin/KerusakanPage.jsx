import { useState, useEffect } from "react";
import { kerusakanAPI, gejalaAPI } from "../../services/api";
import {
  PageHeader,
  PrimaryBtn,
  SecondaryBtn,
  AdminInput,
  AdminTextarea,
  AdminModal,
  ConfirmModal,
  AdminTable,
  AdminTd,
  SearchBar,
  AlertBanner,
  EmptyState,
  Badge,
} from "../../components/common/AdminUI";

const EMPTY = {
  kode_kerusakan: "",
  nama_kerusakan: "",
  keterangan: "",
  solusi: "",
  gejala_list: [],
};

export default function KerusakanPage() {
  const [kerusakan, setKerusakan] = useState([]);
  const [semuaGejala, setSemuaGejala] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [gejalaSearch, setGejalaSearch] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([kerusakanAPI.getAll(), gejalaAPI.getAll()])
      .then(([r1, r2]) => {
        setKerusakan(r1.data.data);
        setSemuaGejala(r2.data.data);
      })
      .catch(() => setError("Gagal memuat data."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setEditData(null);
    setForm(EMPTY);
    setFormError("");
    setGejalaSearch("");
    setModalOpen(true);
  };
  const openEdit = async (k) => {
    setEditData(k);
    setFormError("");
    setGejalaSearch("");
    try {
      const res = await kerusakanAPI.getByKode(k.kode_kerusakan);
      const d = res.data.data;
      setForm({
        kode_kerusakan: d.kode_kerusakan,
        nama_kerusakan: d.nama_kerusakan,
        keterangan: d.keterangan || "",
        solusi: d.solusi || "",
        gejala_list: (d.gejala || []).map((g) => g.kode_gejala),
      });
    } catch {
      setForm({ ...k, gejala_list: [] });
    }
    setModalOpen(true);
  };
  const openDetail = async (k) => {
    try {
      const res = await kerusakanAPI.getByKode(k.kode_kerusakan);
      setDetail(res.data.data);
    } catch {
      setDetail(k);
    }
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
    if (!form.kode_kerusakan || !form.nama_kerusakan) {
      setFormError("Kode dan nama kerusakan wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      if (editData) await kerusakanAPI.update(editData.kode_kerusakan, form);
      else await kerusakanAPI.create(form);
      setModalOpen(false);
      setSuccess(
        editData
          ? "Kerusakan berhasil diperbarui."
          : "Kerusakan berhasil ditambahkan.",
      );
      load();
    } catch (e) {
      setFormError(e.response?.data?.message || "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await kerusakanAPI.delete(deleteId);
      setDeleteId(null);
      setSuccess("Kerusakan berhasil dihapus.");
      load();
    } catch {
      setError("Gagal menghapus kerusakan.");
    } finally {
      setDeleting(false);
    }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const filtered = kerusakan.filter(
    (k) =>
      k.kode_kerusakan.toLowerCase().includes(search.toLowerCase()) ||
      k.nama_kerusakan.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredGejala = semuaGejala.filter(
    (g) =>
      g.kode_gejala.toLowerCase().includes(gejalaSearch.toLowerCase()) ||
      g.nama_gejala.toLowerCase().includes(gejalaSearch.toLowerCase()),
  );

  return (
    <div style={{ animation: "fadeIn .2s ease" }}>
      <PageHeader
        title="Data Kerusakan"
        subtitle={`${kerusakan.length} jenis kerusakan hardware terdaftar`}
        action={
          <PrimaryBtn onClick={openCreate}>+ Tambah Kerusakan</PrimaryBtn>
        }
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

      <div
        className="bg-white rounded-xl overflow-hidden mt-4"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid #f3f4f6" }}
        >
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kerusakan..."
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
          <EmptyState title="Belum ada kerusakan" />
        ) : (
          <AdminTable
            columns={["Kode", "Nama Kerusakan", "Jml Gejala", "Aksi"]}
          >
            {filtered.map((k) => (
              <tr
                key={k.kode_kerusakan}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fafafa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <AdminTd>
                  <span
                    className="font-mono font-bold text-xs px-2 py-1 rounded-md"
                    style={{ background: "#eff6ff", color: "#1d4ed8" }}
                  >
                    {k.kode_kerusakan}
                  </span>
                </AdminTd>
                <AdminTd>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "#111" }}
                  >
                    {k.nama_kerusakan}
                  </p>
                </AdminTd>
                <AdminTd center>
                  <Badge color="blue">{k.jumlah_gejala || 0} gejala</Badge>
                </AdminTd>
                <td
                  className="px-4 py-3.5"
                  style={{ borderBottom: "1px solid #f9fafb" }}
                >
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openDetail(k)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      style={{ background: "#f3f4f6", color: "#374151" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#e5e7eb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#f3f4f6")
                      }
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => openEdit(k)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
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
                      onClick={() => setDeleteId(k.kode_kerusakan)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
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
            ))}
          </AdminTable>
        )}
      </div>

      {/* Detail Modal */}
      <AdminModal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.nama_kerusakan || ""}
        size="lg"
      >
        {detail && (
          <div className="space-y-4 text-sm">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: "#9ca3af" }}
              >
                Keterangan
              </p>
              <p className="leading-relaxed" style={{ color: "#374151" }}>
                {detail.keterangan}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: "#9ca3af" }}
              >
                Solusi Perbaikan
              </p>
              <div
                className="rounded-xl p-4 leading-relaxed whitespace-pre-line"
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#374151",
                }}
              >
                {detail.solusi}
              </div>
            </div>
            {detail.gejala?.length > 0 && (
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: "#9ca3af" }}
                >
                  Gejala Terkait ({detail.gejala.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.gejala.map((g) => (
                    <span
                      key={g.kode_gejala}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <span className="font-mono font-bold">
                        {g.kode_gejala}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Form Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editData
            ? `Edit – ${editData.kode_kerusakan}`
            : "Tambah Kerusakan Baru"
        }
        size="lg"
      >
        <div className="space-y-4">
          {formError && <AlertBanner type="error" message={formError} />}
          <div className="grid grid-cols-2 gap-3">
            <AdminInput
              label="Kode Kerusakan"
              required
              value={form.kode_kerusakan}
              disabled={!!editData}
              placeholder="K1"
              onChange={(e) =>
                set("kode_kerusakan", e.target.value.toUpperCase())
              }
              style={{ fontFamily: "monospace" }}
            />
            <AdminInput
              label="Nama Kerusakan"
              required
              value={form.nama_kerusakan}
              placeholder="Kerusakan Power Supply"
              onChange={(e) => set("nama_kerusakan", e.target.value)}
            />
          </div>
          <AdminTextarea
            label="Keterangan"
            rows={3}
            value={form.keterangan}
            placeholder="Deskripsi kerusakan..."
            onChange={(e) => set("keterangan", e.target.value)}
          />
          <AdminTextarea
            label="Solusi Perbaikan"
            rows={4}
            value={form.solusi}
            placeholder={"1. Langkah pertama...\n2. Langkah kedua..."}
            onChange={(e) => set("solusi", e.target.value)}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: "#374151" }}>
                Gejala Terkait
                {form.gejala_list.length > 0 && (
                  <span
                    className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#eff6ff", color: "#1d4ed8" }}
                  >
                    {form.gejala_list.length} dipilih
                  </span>
                )}
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
                maxHeight: 200,
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
                  <span className="text-xs" style={{ color: "#374151" }}>
                    {g.nama_gejala}
                  </span>
                </label>
              ))}
            </div>
          </div>
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
        title="Hapus Kerusakan"
        message={`Yakin ingin menghapus kerusakan ${deleteId}? Semua kasus CBR terkait juga akan terhapus.`}
      />
    </div>
  );
}
