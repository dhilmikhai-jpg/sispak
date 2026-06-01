import { Link, useLocation } from 'react-router-dom'
import { Monitor, Stethoscope, MessageSquare, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg">
          <Monitor size={22} strokeWidth={2} />
          <span className="hidden sm:block text-sm leading-tight">
            Sistem Pakar<br/>
            <span className="font-normal text-gray-500 text-xs">Diagnosa Komputer</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${pathname === '/' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}>
            Beranda
          </Link>
          <Link to="/konsultasi" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${pathname.startsWith('/konsultasi') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}>
            <Stethoscope size={14} />
            Konsultasi
          </Link>
          <Link to="/chat" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${pathname.startsWith('/chat') ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:text-purple-600'}`}>
            <MessageSquare size={14} />
            Chat
          </Link>
          <Link to="/admin/login" className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5">
            <ShieldCheck size={14} />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}
