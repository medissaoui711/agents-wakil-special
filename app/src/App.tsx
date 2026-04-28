import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import AgentProfile from './pages/AgentProfile'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Matches from './pages/Matches'
import Login from './pages/Login'
import Register from './pages/Register'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import WhatsAppTools from './pages/WhatsAppTools'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/agent/:handle" element={<AgentProfile />} />
      <Route path="/chat/:agentId" element={<Chat />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/search" element={<Search />} />
      <Route path="/matches" element={<Matches />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/whatsapp-tools" element={<WhatsAppTools />} />
    </Routes>
  )
}
