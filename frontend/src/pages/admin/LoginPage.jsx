import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { authAPI } from "../../services/api";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.data.token, res.data.data.pakar);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Username atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0f1117" }}
    >
      {/* Form Login - Full width */}
      <div className="w-full max-w-sm p-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#2563eb" }}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="white">
              <rect x="1" y="2" width="14" height="10" rx="2" />
              <rect x="4" y="13" width="8" height="1.5" rx=".75" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#fff" }}>
              DiagnosaPC
            </p>
            <p className="text-xs" style={{ color: "#6b7280" }}>
              Admin Panel
            </p>
          </div>
        </div>

        <h1
          className="text-2xl font-bold mb-2 text-center"
          style={{ color: "#fff" }}
        >
          Selamat datang
        </h1>
        <p className="text-sm mb-8 text-center" style={{ color: "#6b7280" }}>
          Masuk untuk mengelola sistem pakar
        </p>

        {error && (
          <div
            className="rounded-lg px-4 py-3 mb-5 text-sm"
            style={{
              background: "rgba(239,68,68,.1)",
              border: "1px solid rgba(239,68,68,.3)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold mb-2"
              style={{ color: "#9ca3af" }}
            >
              Username
            </label>
            <input
              type="text"
              required
              autoFocus
              value={form.username}
              onChange={(e) =>
                setForm((p) => ({ ...p, username: e.target.value }))
              }
              placeholder="Masukkan username"
              className="w-full text-sm px-4 py-3 rounded-xl outline-none transition-colors"
              style={{
                background: "#1f2937",
                border: "1px solid #374151",
                color: "#fff",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.target.style.borderColor = "#374151")}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-2"
              style={{ color: "#9ca3af" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Masukkan password"
                className="w-full text-sm px-4 py-3 pr-11 rounded-xl outline-none transition-colors"
                style={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  color: "#fff",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#374151")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#6b7280" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  {showPass ? (
                    <path
                      d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z M8 10a2 2 0 100-4 2 2 0 000 4z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  ) : (
                    <>
                      <path
                        d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z M8 10a2 2 0 100-4 2 2 0 000 4z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M2 2l12 12"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3.5 rounded-xl text-sm transition-colors mt-2"
            style={{
              background: loading ? "#1f2937" : "#2563eb",
              color: loading ? "#6b7280" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: "rgba(255,255,255,.2)",
                    borderTopColor: "#fff",
                  }}
                />
                Masuk...
              </span>
            ) : (
              "Masuk ke Panel Admin"
            )}
          </button>
        </form>

        <p className="text-center mt-5 text-xs" style={{ color: "#374151" }}>
          <a
            href="/"
            className="transition-colors"
            style={{ color: "#6b7280" }}
            onMouseEnter={(e) => (e.target.style.color = "#2563eb")}
            onMouseLeave={(e) => (e.target.style.color = "#6b7280")}
          >
            Kembali ke Halaman User
          </a>
        </p>
      </div>
    </div>
  );
}
