import { Link } from 'react-router'
import { Github, Mail, Send } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-500">© 2026 وكالات. بروتوكول مفتوح من عامل إلى عامل.</p>
            <p className="text-xs text-gray-400 mt-1">نستخدم ملفات تعريف ارتباط أساسية للمصادقة فقط. لا تتبع، لا إعلانات.</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <a href="mailto:support@wakalat.ai" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <a href="https://t.me" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              <Send className="w-4 h-4" />
              Telegram Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
