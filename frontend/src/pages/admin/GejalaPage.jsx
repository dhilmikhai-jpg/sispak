import { useState, useEffect } from "react";
import { gejalaAPI } from "../../services/api";
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

const EMPTY = { kode_gejala: "", nama_gejala: "", mb: "", md: "" };

export default function GejalaPage() {
  const [gejala, setGejala] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    gejalaAPI
      .getAll()
      .then((r) => setGejala(r.data.data))
      .catch(() => setError("Gagal memuat data gejala."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setEditData(null);
    setForm(EMPTY);
    setFormError("");
    setModalOpen(true);
  };
  const openEdit = (g) => {
    setEditData(g);
    setForm({
      kode_gejala: g.kode_gejala,
      nama_gejala: g.nama_gejala,
      mb: g.mb,
      md: g.md,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormError("");
    if (
      !form.kode_gejala ||
      !form.nama_gejala ||
      form.mb === "" ||
      form.md === ""
    ) {
      setFormError("Semua field wajib diisi.");
      return;
    }
    if (+form.mb < 0 || +form.mb > 1 || +form.md < 0 || +form.md > 1) {
      setFormError("Nilai MB dan MD harus antara 0 dan 1.");
      return;
    }
    setSaving(true);
    try {
      if (editData) await gejalaAPI.update(editData.kode_gejala, form);
      else await gejalaAPI.create(form);
      setModalOpen(false);
      setSuccess(
        editData
          ? "Gejala berhasil diperbarui."
          : "Gejala berhasil ditambahkan.",
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
      await gejalaAPI.delete(deleteId);
      setDeleteId(null);
      setSuccess("Gejala berhasil dihapus.");
      load();
    } catch {
      setError("Gagal menghapus gejala.");
    } finally {
      setDeleting(false);
    }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = gejala.filter(
    (g) =>
      g.kode_gejala.toLowerCase().includes(search.toLowerCase()) ||
      g.nama_gejala.toLowerCase().includes(search.toLowerCase()),
  );

  const cfPreview =
    form.mb !== "" && form.md !== ""
      ? (parseFloat(form.mb || 0) - parseFloat(form.md || 0)).toFixed(4)
      : null;

  return (
    <div style={{ animation: "fadeIn .2s ease" }}>
      <PageHeader
        title="Data Gejala"
        subtitle={`${gejala.length} gejala terdaftar dalam sistem`}
        action={<PrimaryBtn onClick={openCreate}>+ Tambah Gejala</PrimaryBtn>}
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
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #f3f4f6" }}
        >
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama gejala..."
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
          <EmptyState
            title="Belum ada gejala"
            desc="Klik tombol Tambah Gejala untuk menambahkan data."
          />
        ) : (
          <AdminTable
            columns={["Kode", "Nama Gejala", "MB", "MD", "CF", "Aksi"]}
          >
            {filtered.map((g) => {
              const cf = parseFloat(g.mb) - parseFloat(g.md);
              return (
                <tr
                  key={g.kode_gejala}
                  style={{ borderBottom: "1px solid #f9fafb" }}
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
                      {g.kode_gejala}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <span className="text-sm" style={{ color: "#374151" }}>
                      {g.nama_gejala}
                    </span>
                  </AdminTd>
                  <AdminTd center>
                    <Badge color="green">{parseFloat(g.mb).toFixed(2)}</Badge>
                  </AdminTd>
                  <AdminTd center>
                    <Badge color="red">{parseFloat(g.md).toFixed(2)}</Badge>
                  </AdminTd>
                  <AdminTd center>
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{
                        color:
                          cf >= 0.7
                            ? "#16a34a"
                            : cf >= 0.5
                              ? "#f59e0b"
                              : "#374151",
                      }}
                    >
                      {cf.toFixed(2)}
                    </span>
                  </AdminTd>
                  <td
                    className="px-4 py-3.5"
                    style={{ borderBottom: "1px solid #f9fafb" }}
                  >
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEdit(g)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
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
                        onClick={() => setDeleteId(g.kode_gejala)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
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

      {/* Form Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editData
            ? `Edit Gejala – ${editData.kode_gejala}`
            : "Tambah Gejala Baru"
        }
      >
        <div className="space-y-4">
          {formError && <AlertBanner type="error" message={formError} />}
          <AdminInput
            label="Kode Gejala"
            required
            value={form.kode_gejala}
            disabled={!!editData}
            placeholder="G01"
            onChange={(e) => set("kode_gejala", e.target.value.toUpperCase())}
            style={{ fontFamily: "monospace" }}
          />
          {!editData && (
            <p className="text-xs -mt-2" style={{ color: "#9ca3af" }}>
              Format: G01, G02, dst.
            </p>
          )}
          <AdminTextarea
            label="Nama Gejala"
            required
            rows={3}
            value={form.nama_gejala}
            placeholder="Deskripsi gejala yang dialami..."
            onChange={(e) => set("nama_gejala", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <AdminInput
                label="Nilai MB (0–1)"
                required
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={form.mb}
                placeholder="0.80"
                onChange={(e) => set("mb", e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
                Measure of Belief
              </p>
            </div>
            <div>
              <AdminInput
                label="Nilai MD (0–1)"
                required
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={form.md}
                placeholder="0.05"
                onChange={(e) => set("md", e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
                Measure of Disbelief
              </p>
            </div>
          </div>
          {cfPreview !== null && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
              }}
            >
              CF = MB − MD = <strong>{cfPreview}</strong>
            </div>
          )}
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
        title="Hapus Gejala"
        message={`Yakin ingin menghapus gejala ${deleteId}? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua relasi terkait.`}
      />
    </div>
  );
}
