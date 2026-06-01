import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Send, ListChecks, Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { diagnosisAPI } from '../../services/api'

// ── localStorage helpers ─────────────────────────────────────
const SESSIONS_KEY = 'diagnosapc_sessions'
const ACTIVE_KEY   = 'diagnosapc_active_session'

const loadSessions = () => {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [] } catch { return [] }
}
const saveSessions = (sessions) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}
const loadActiveId = () => localStorage.getItem(ACTIVE_KEY) || null
const saveActiveId = (id) => localStorage.setItem(ACTIVE_KEY, id)

// ── Buat sesi baru ───────────────────────────────────────────
const buatSesiBaru = () => ({
  id: Date.now().toString(),
  judul: 'Konsultasi baru',
  tanggal: new Date().toISOString(),
  namaUser: '',
  step: 'nama',
  messages: [
    { id: 1, from: 'bot', type: 'text', text: 'Halo! Saya asisten diagnosa komputer.' },
    { id: 2, from: 'bot', type: 'text', text: 'Ceritakan keluhan laptop atau komputer kamu dengan bahasa bebas.' },
    { id: 'tanya-nama', from: 'bot', type: 'tanya_nama', text: 'Sebelum mulai, siapa nama kamu?' },
  ],
})

// ── Format tanggal ───────────────────────────────────────────
const formatTanggal = (iso) => {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return 'Hari ini'
  if (diff === 1) return 'Kemarin'
  if (diff < 7) return `${diff} hari lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function ChatPage() {
  const [sessions, setSessions]       = useState(() => {
    const s = loadSessions()
    if (s.length === 0) {
      const sesi = buatSesiBaru()
      saveSessions([sesi])
      return [sesi]
    }
    return s
  })
  const [activeId, setActiveId]       = useState(() => {
    const id = loadActiveId()
    const s  = loadSessions()
    if (id && s.find(x => x.id === id)) return id
    return s[0]?.id || null
  })
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null) // untuk konfirmasi hapus
  const bottomRef                     = useRef(null)

  const sesi = sessions.find(s => s.id === activeId) || sessions[0]

  // Simpan ke localStorage setiap perubahan
  useEffect(() => { saveSessions(sessions) }, [sessions])
  useEffect(() => { if (activeId) saveActiveId(activeId) }, [activeId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [sesi?.messages])

  // Update sesi aktif
  const updateSesi = (patch) => {
    setSessions(prev => prev.map(s => s.id === activeId ? { ...s, ...patch } : s))
  }

  const addMessage = (msg) => {
    setSessions(prev => prev.map(s =>
      s.id === activeId
        ? { ...s, messages: [...s.messages, { id: Date.now() + Math.random(), ...msg }] }
        : s
    ))
  }

  // Buat sesi baru
  const handleNewSession = () => {
    const sesi = buatSesiBaru()
    setSessions(prev => [sesi, ...prev])
    setActiveId(sesi.id)
    setInput('')
  }

  // Hapus sesi — dengan konfirmasi
  const handleDeleteSession = (id, e) => {
    e.stopPropagation()
    if (confirmDeleteId === id) {
      // Sudah dikonfirmasi, hapus sekarang
      setConfirmDeleteId(null)
      setSessions(prev => {
        const next = prev.filter(s => s.id !== id)
        if (next.length === 0) {
          const sesi = buatSesiBaru()
          setActiveId(sesi.id)
          return [sesi]
        }
        if (id === activeId) setActiveId(next[0].id)
        return next
      })
    } else {
      // Minta konfirmasi dulu
      setConfirmDeleteId(id)
      // Auto-cancel konfirmasi setelah 3 detik
      setTimeout(() => setConfirmDeleteId(null), 3000)
    }
  }

  // Lewati nama
  const handleSkipNama = () => {
    addMessage({ from: 'user', type: 'text', text: '(Lewati)' })
    setTimeout(() => {
      addMessage({ from: 'bot', type: 'text', text: 'Oke! Ceritakan keluhan komputer kamu.' })
      updateSesi({ step: 'chat' })
    }, 300)
  }

  // Kirim nama
  const handleSendNama = () => {
    const nama = input.trim()
    if (!nama) return
    addMessage({ from: 'user', type: 'text', text: nama })
    setInput('')
    setTimeout(() => {
      addMessage({ from: 'bot', type: 'text', text: `Halo ${nama}! Ceritakan keluhan komputer kamu.` })
      updateSesi({ step: 'chat', namaUser: nama })
    }, 400)
  }

  // Kirim keluhan
  const handleSendChat = async () => {
    const teks = input.trim()
    if (!teks || loading) return

    addMessage({ from: 'user', type: 'text', text: teks })
    setInput('')
    setLoading(true)

    const loadingId = Date.now()
    setSessions(prev => prev.map(s =>
      s.id === activeId
        ? { ...s, messages: [...s.messages, { id: loadingId, from: 'bot', type: 'loading', text: '' }] }
        : s
    ))

    try {
      const res  = await diagnosisAPI.chatDiagnose({ teks, nama_user: sesi.namaUser })
      const data = res.data

      setSessions(prev => prev.map(s =>
        s.id === activeId
          ? { ...s, messages: s.messages.filter(m => m.id !== loadingId) }
          : s
      ))

      if (!data.success || !data.data) {
        // Respons follow-up yang memancing user lebih spesifik
        const followUpMessages = [
          'Bisa ceritakan lebih detail? Misalnya: layarnya blank, sering mati sendiri, bunyi aneh, atau ada gejala lain yang kamu rasakan?',
          'Hmm, saya belum bisa mendeteksi gejalanya. Coba deskripsikan lebih spesifik — apa yang terjadi saat komputer dinyalakan? Ada bunyi, layar gelap, atau mati sendiri?',
          'Kurang spesifik nih. Coba ceritakan gejala yang paling mengganggu — misalnya: "layar tiba-tiba blank", "komputer panas banget", atau "ada bunyi bip saat dinyalakan".',
        ]
        const randomMsg = followUpMessages[Math.floor(Math.random() * followUpMessages.length)]
        addMessage({ from: 'bot', type: 'followup', text: randomMsg })
        return
      }

      const { nlp, diagnosis, certainty_factor, cbr, semua_kandidat } = data.data

      // Update judul sesi dengan nama kerusakan + keluhan singkat user
      const keluhanUser = teks.length > 30 ? teks.substring(0, 30) + '...' : teks
      updateSesi({ judul: diagnosis.nama_kerusakan?.replace('Kerusakan ', '') || 'Konsultasi', subtitle: keluhanUser })

      if (nlp.gejala_terdeteksi?.length > 0) {
        addMessage({
          from: 'bot', type: 'gejala',
          text: `Saya mendeteksi ${nlp.gejala_terdeteksi.length} gejala dari ceritamu:`,
          data: { gejala: nlp.gejala_terdeteksi, tokens: nlp.tokens, tokens_stem: nlp.tokens_stem },
        })
      }

      setTimeout(() => {
        addMessage({
          from: 'bot', type: 'hasil',
          text: 'Berdasarkan analisis sistem pakar, berikut hasilnya:',
          data: { diagnosis, certainty_factor, cbr, semua_kandidat },
        })
      }, 600)

    } catch {
      setSessions(prev => prev.map(s =>
        s.id === activeId
          ? { ...s, messages: s.messages.filter(m => m.id !== loadingId) }
          : s
      ))
      addMessage({ from: 'bot', type: 'text', text: 'Maaf, terjadi kesalahan. Coba lagi ya.' })
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sesi?.step === 'nama' ? handleSendNama() : handleSendChat()
    }
  }

  return (
    <div style={{ height: '100vh', background: '#f0ede8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside style={{
          width: sidebarOpen ? 240 : 0,
          minWidth: sidebarOpen ? 240 : 0,
          background: '#0a0c12',
          borderRight: '1px solid #1a2035',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width .25s ease, min-width .25s ease',
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '14px 12px', borderBottom: '1px solid #1a2035', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/" style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}>
              <Bot size={14} color="#fff" />
            </Link>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#f1f5f9', flex: 1, whiteSpace: 'nowrap' }}>Riwayat Chat</p>
            <button
              onClick={handleNewSession}
              title="Konsultasi baru"
              style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid #374151', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9ca3af' }}
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Daftar sesi */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => { setActiveId(s.id); setInput(''); setConfirmDeleteId(null) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 2,
                  background: s.id === activeId ? 'rgba(29,78,216,0.3)' : 'transparent',
                  borderLeft: s.id === activeId ? '3px solid #3b82f6' : '3px solid transparent',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { if (s.id !== activeId) e.currentTarget.style.background = '#1f2937' }}
                onMouseLeave={e => { if (s.id !== activeId) e.currentTarget.style.background = 'transparent' }}
              >
                <MessageSquare size={13} color={s.id === activeId ? '#93c5fd' : '#6b7280'} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: s.id === activeId ? '#fff' : '#d1d5db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.judul}
                  </p>
                  <p style={{ margin: 0, fontSize: 10, color: s.id === activeId ? '#93c5fd' : '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.subtitle || formatTanggal(s.tanggal)}
                  </p>
                </div>
                {/* Tombol hapus dengan konfirmasi */}
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  title={confirmDeleteId === s.id ? 'Klik lagi untuk hapus' : 'Hapus sesi'}
                  style={{
                    background: confirmDeleteId === s.id ? 'rgba(239,68,68,0.15)' : 'none',
                    border: confirmDeleteId === s.id ? '1px solid rgba(239,68,68,0.4)' : 'none',
                    cursor: 'pointer',
                    color: confirmDeleteId === s.id ? '#ef4444' : '#4b5563',
                    padding: '2px 4px', borderRadius: 4, flexShrink: 0, display: 'flex',
                    alignItems: 'center', gap: 3, fontSize: 10, transition: 'all .15s',
                  }}
                  onMouseEnter={e => { if (confirmDeleteId !== s.id) e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { if (confirmDeleteId !== s.id) e.currentTarget.style.color = '#4b5563' }}
                >
                  <Trash2 size={11} />
                  {confirmDeleteId === s.id && <span>Hapus?</span>}
                </button>
              </div>
            ))}
          </div>

          {/* Sidebar footer — navigasi */}
          <div style={{ padding: '10px 8px', borderTop: '1px solid #1a2035', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Link to="/konsultasi" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, textDecoration: 'none', color: '#6b7280', fontSize: 12 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.color = '#9ca3af' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' }}
            >
              <ListChecks size={13} /> Mode Checklist
            </Link>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, textDecoration: 'none', color: '#6b7280', fontSize: 12 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.color = '#9ca3af' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' }}
            >
              <Home size={13} /> Beranda
            </Link>
          </div>
        </aside>

        {/* ── Main chat area ───────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Chat header */}
          <div style={{ background: '#0a0c12', borderBottom: '1px solid #1a2035', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: 4, borderRadius: 6 }}
              onMouseEnter={e => e.currentTarget.style.color = '#9ca3af'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sesi?.judul || 'Konsultasi baru'}
              </p>
              <p style={{ margin: 0, fontSize: 10, color: '#475569' }}>NLP · CBR · Certainty Factor</p>
            </div>

            <button
              onClick={handleNewSession}
              style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: '1px solid #1a2035', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#374151' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = '#1a2035' }}
            >
              <Plus size={12} /> Baru
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sesi?.messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onSkip={handleSkipNama}
                onSuggestion={(text) => setInput(text)}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '12px 16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={sesi?.step === 'nama' ? 'Ketik nama kamu, atau tekan Lewati...' : 'Ceritakan keluhan komputer kamu...'}
                rows={1}
                style={{
                  flex: 1, resize: 'none', border: '1.5px solid #e2e8f0', borderRadius: 14,
                  padding: '10px 14px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                  lineHeight: 1.5, maxHeight: 120, overflowY: 'auto', transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                disabled={loading}
              />
              {sesi?.step === 'nama' && (
                <button
                  onClick={handleSkipNama}
                  style={{ height: 42, padding: '0 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#6b7280', fontSize: 12, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#6b7280' }}
                >
                  Lewati
                </button>
              )}
              <button
                onClick={sesi?.step === 'nama' ? handleSendNama : handleSendChat}
                disabled={loading || !input.trim()}
                style={{
                  width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: loading || !input.trim() ? '#e2e8f0' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  color: loading || !input.trim() ? '#94a3b8' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s',
                }}
              >
                <Send size={16} />
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8', margin: '8px 0 0' }}>
              Enter untuk kirim · Shift+Enter untuk baris baru
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Bubble components ────────────────────────────────────────

function BotBubble({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bot size={15} color="#fff" />
      </div>
      <div style={{ background: '#fff', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', maxWidth: '80%', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
        {children}
      </div>
    </div>
  )
}

function UserBubble({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '16px 4px 16px 16px', padding: '10px 14px', maxWidth: '80%' }}>
        <p style={{ margin: 0, fontSize: 13, color: '#fff', lineHeight: 1.6 }}>{children}</p>
      </div>
    </div>
  )
}

function MessageBubble({ msg, onSkip, onSuggestion }) {
  if (msg.from === 'user') return <UserBubble>{msg.text}</UserBubble>

  if (msg.type === 'loading') {
    return (
      <BotBubble>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', animation: `bounce 1s ${i * 0.2}s infinite` }} />
          ))}
          <style>{`@keyframes bounce{0%,80%,100%{transform:scale(.8);opacity:.5}40%{transform:scale(1.2);opacity:1}}`}</style>
        </div>
      </BotBubble>
    )
  }

  if (msg.type === 'followup') {
    const suggestions = [
      'layar blank atau gelap',
      'sering mati sendiri',
      'komputer panas banget',
      'ada bunyi bip',
      'blue screen',
      'harddisk tidak terdeteksi',
      'printer tidak bisa cetak',
    ]
    return (
      <BotBubble>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{msg.text}</p>
        <p style={{ margin: '0 0 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>CONTOH KELUHAN</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => onSuggestion && onSuggestion(s)}
              style={{
                fontSize: 11, padding: '5px 10px', borderRadius: 999,
                border: '1px solid #ddd6fe', background: '#f5f3ff',
                color: '#7c3aed', cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.color = '#7c3aed' }}
            >
              {s}
            </button>
          ))}
        </div>
      </BotBubble>
    )
  }

  if (msg.type === 'tanya_nama') {
    return (
      <BotBubble>
        <p style={{ margin: '0 0 10px', fontSize: 13, color: '#334155' }}>Sebelum mulai, siapa nama kamu?</p>
        <button
          onClick={onSkip}
          style={{ fontSize: 11, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}
        >
          Lewati →
        </button>
      </BotBubble>
    )
  }

  if (msg.type === 'gejala') {
    return (
      <BotBubble>
        <p style={{ margin: '0 0 10px', fontSize: 13, color: '#334155', fontWeight: 600 }}>{msg.text}</p>
        <div style={{ background: '#f8f7f4', borderRadius: 10, padding: '8px 12px', marginBottom: 10, fontSize: 11 }}>
          <p style={{ margin: '0 0 4px', color: '#94a3b8', fontWeight: 600, letterSpacing: '.05em' }}>PROSES NLP</p>
          <p style={{ margin: '0 0 2px', color: '#64748b' }}>
            <span style={{ color: '#7c3aed', fontWeight: 600 }}>Tokens: </span>{msg.data.tokens?.join(', ')}
          </p>
          <p style={{ margin: 0, color: '#64748b' }}>
            <span style={{ color: '#7c3aed', fontWeight: 600 }}>Setelah stemming: </span>{msg.data.tokens_stem?.join(', ')}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {msg.data.gejala?.map(g => (
            <div key={g.kode_gejala} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 10px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#16a34a', flexShrink: 0, marginTop: 1 }}>{g.kode_gejala}</span>
              <span style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>{g.nama_gejala}</span>
            </div>
          ))}
        </div>
      </BotBubble>
    )
  }

  if (msg.type === 'hasil') {
    const { diagnosis, certainty_factor, cbr, semua_kandidat } = msg.data
    const cfPersen = certainty_factor.persen
    const cfColor  = cfPersen >= 80 ? '#059669' : cfPersen >= 60 ? '#d97706' : '#dc2626'

    return (
      <BotBubble>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#334155', fontWeight: 600 }}>{msg.text}</p>

        <div style={{ background: 'linear-gradient(135deg,#0a0c12,#0f1628)', borderRadius: 14, padding: '16px 18px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#475569', letterSpacing: '.05em' }}>DIAGNOSIS</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{diagnosis.nama_kerusakan}</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#475569' }}>{cbr.keterangan_metode}</p>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: cfColor }}>{cfPersen.toFixed(1)}%</p>
              <p style={{ margin: 0, fontSize: 10, color: '#475569' }}>{certainty_factor.interpretasi}</p>
            </div>
          </div>
        </div>

        {semua_kandidat?.filter(k => k.kode_kerusakan !== diagnosis.kode_kerusakan).length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>KANDIDAT LAIN</p>
            {semua_kandidat.filter(k => k.kode_kerusakan !== diagnosis.kode_kerusakan).slice(0, 3).map(k => (
              <div key={k.kode_kerusakan} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                <span style={{ color: '#475569' }}>{k.nama_kerusakan}</span>
                <span style={{ color: '#94a3b8' }}>{k.cf_persen.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: '#eff6ff', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, color: '#2563eb', fontWeight: 600 }}>SOLUSI</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {diagnosis.solusi?.split('\n').filter(Boolean).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#334155' }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{i + 1}</span>
                <span style={{ lineHeight: 1.6 }}>{s.replace(/^\d+\.\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8' }}>
          Ingin konsultasi ulang? Ceritakan keluhan lain atau{' '}
          <a href="/konsultasi" style={{ color: '#7c3aed', textDecoration: 'none' }}>gunakan mode checklist</a>.
        </p>
      </BotBubble>
    )
  }

  return (
    <BotBubble>
      <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{msg.text}</p>
    </BotBubble>
  )
}
