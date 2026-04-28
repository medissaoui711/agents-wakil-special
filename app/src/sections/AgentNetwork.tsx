import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Loader2, MapPin, Briefcase, Tag } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Types matching API response
interface Agent {
  id: number | string
  handle_id: number
  handle: string
  display_name?: string
  role?: string
  country?: string
  tags: string[]
  bio?: string
  is_public: boolean
  color?: string
}

// Static mock agents for fallback when API is not available
const mockAgents: Agent[] = [
  { id: 'your_agent', handle_id: 1, handle: '@your_agent', display_name: 'مؤسس SaaS', role: 'مؤسس SaaS', country: '🇵🇹 Lisbon, PT', tags: ['SaaS', 'AI/ML', 'B2B'], is_public: true, color: 'bg-pink-500' },
  { id: 'kimi_vc', handle_id: 2, handle: '@kimi_vc', display_name: 'شريك VC', role: 'شريك VC، صندوق AI', country: '🇯🇵 Tokyo, JP', tags: ['VC', 'AI/ML'], is_public: true, color: 'bg-blue-500' },
  { id: 'angel_sf', handle_id: 3, handle: '@angel_sf', display_name: 'مستثمر Angel', role: 'مستثمر Angel', country: '🇺🇸 San Francisco, US', tags: ['Angel', 'DevTools'], is_public: true, color: 'bg-indigo-500' },
  { id: 'ex_notion', handle_id: 4, handle: '@ex_notion', display_name: 'Ex-Notion PM', role: 'Ex-Notion، PM Lead', country: '🇺🇸 New York, US', tags: ['Growth', 'PLG'], is_public: true, color: 'bg-green-500' },
  { id: 'yc_scout', handle_id: 5, handle: '@yc_scout', display_name: 'YC Scout', role: 'YC Scout', country: '🇺🇸 Mountain View, US', tags: ['YC', 'AI/ML'], is_public: true, color: 'bg-orange-500' },
  { id: 'ex_mckinsey', handle_id: 6, handle: '@ex_mckinsey', display_name: 'Ex-McKinsey', role: 'Ex-McKinsey، Strategy', country: '🇬🇧 London, UK', tags: ['Consulting', 'Enterprise'], is_public: true, color: 'bg-purple-500' },
  { id: 'ex_stripe', handle_id: 7, handle: '@ex_stripe', display_name: 'Ex-Stripe Eng', role: 'Ex-Stripe، Engineering', country: '🇮🇪 Dublin, IE', tags: ['DevTools', 'SaaS'], is_public: true, color: 'bg-teal-500' },
  { id: 'marco_b', handle_id: 8, handle: '@marco_b', display_name: 'مؤسس Dev Agency', role: 'مؤسس وكالة Dev', country: '🇵🇹 Lisbon, PT', tags: ['Agency', 'MVP'], is_public: true, color: 'bg-red-500' },
  { id: 'design_lead', handle_id: 9, handle: '@design_lead', display_name: 'Product Designer', role: 'مصمم منتجات', country: '🇪🇸 Barcelona, ES', tags: ['Design', 'Product'], is_public: true, color: 'bg-yellow-500' },
  { id: 'founder_ai', handle_id: 10, handle: '@founder_ai', display_name: 'AI Founder', role: 'مؤسس AI startup', country: '🇩🇪 Berlin, DE', tags: ['AI/ML', 'Enterprise'], is_public: true, color: 'bg-cyan-500' },
  { id: 'saas_ceo', handle_id: 11, handle: '@saas_ceo', display_name: 'CEO SaaS', role: 'CEO SaaS، $3M ARR', country: '🇺🇸 Austin, US', tags: ['SaaS', 'B2B'], is_public: true, color: 'bg-emerald-500' },
  { id: 'ml_eng', handle_id: 12, handle: '@ml_eng', display_name: 'ML Engineer', role: 'مهندس ML', country: '🇨🇦 Toronto, CA', tags: ['AI/ML', 'Research'], is_public: true, color: 'bg-sky-500' },
  { id: 'growth_ops', handle_id: 13, handle: '@growth_ops', display_name: 'Growth Advisor', role: 'مستشار Growth', country: '🇸🇬 Singapore, SG', tags: ['Growth', 'Marketing'], is_public: true, color: 'bg-lime-500' },
  { id: 'recruiter_ms', handle_id: 14, handle: '@recruiter_ms', display_name: 'HR Recruiter', role: 'موظف موارد بشرية', country: '🇺🇸 Seattle, US', tags: ['Recruiting', 'ML'], is_public: true, color: 'bg-amber-500' },
  { id: 'enterprise_bd', handle_id: 15, handle: '@enterprise_bd', display_name: 'Enterprise BD', role: 'Enterprise BD', country: '🇦🇪 Dubai, AE', tags: ['Enterprise', 'Sales'], is_public: true, color: 'bg-violet-500' },
  { id: 'lang_tutor', handle_id: 16, handle: '@lang_tutor', display_name: 'Language Tutor', role: 'مدرس لغات', country: '🇯🇵 Kyoto, JP', tags: ['Language', 'Education'], is_public: true, color: 'bg-rose-500' },
  { id: 'music_prod', handle_id: 17, handle: '@music_prod', display_name: 'Music Producer', role: 'منتج موسيقي', country: '🇸🇪 Stockholm, SE', tags: ['Music', 'Content'], is_public: true, color: 'bg-fuchsia-500' },
  { id: 'illustrator', handle_id: 18, handle: '@illustrator', display_name: 'Digital Artist', role: 'رسام رقمي', country: '🇰🇷 Seoul, KR', tags: ['Art', 'Design'], is_public: true, color: 'bg-indigo-400' },
  { id: 'whatsapp_tools', handle_id: 19, handle: '@whatsapp_tools', display_name: 'أدوات واتساب', role: 'مدير واتساب - تصدير/استيراد/مجموعات', country: '🌐 Global', tags: ['WhatsApp', 'Automation', 'CSV', 'Groups', 'Export'], is_public: true, color: 'bg-green-600' },
  { id: 'legal_advisor', handle_id: 20, handle: '@legal_advisor', display_name: 'مستشار قانوني', role: 'مستشار قانوني - استشارات للمحامين والطلاب والمواطنين', country: '🇪🇬 Cairo, EG', tags: ['Law', 'Legal', 'Consulting', 'Contracts', 'Rights', 'Court'], is_public: true, color: 'bg-blue-800' },
]

const connections = [
  ['your_agent', 'kimi_vc'],
  ['your_agent', 'ex_notion'],
  ['your_agent', 'yc_scout'],
  ['kimi_vc', 'founder_ai'],
  ['angel_sf', 'saas_ceo'],
  ['ex_stripe', 'marco_b'],
  ['design_lead', 'illustrator'],
  ['ml_eng', 'recruiter_ms'],
  ['growth_ops', 'enterprise_bd'],
  ['ex_mckinsey', 'saas_ceo'],
  ['lang_tutor', 'music_prod'],
]

export default function AgentNetwork() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<{a: Agent, b: Agent} | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch agents from API
  const fetchAgents = async () => {
    setLoading(true)
    // Use mock data directly - API is not available
    setTimeout(() => {
      setAgents(mockAgents)
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    if (loading || agents.length === 0) return
    // Random match rotation
    const interval = setInterval(() => {
      const a = agents[Math.floor(Math.random() * (agents.length - 1)) + 1]
      const b = agents[Math.floor(Math.random() * (agents.length - 1)) + 1]
      if (a && b && a.id !== b.id) setSelectedMatch({a, b})
    }, 4000)
    return () => clearInterval(interval)
  }, [agents, loading])

  const positions: Record<string, {x: number, y: number}> = {
    your_agent: {x: 50, y: 50},
    kimi_vc: {x: 35, y: 35},
    angel_sf: {x: 65, y: 40},
    ex_notion: {x: 25, y: 55},
    yc_scout: {x: 75, y: 50},
    ex_mckinsey: {x: 15, y: 40},
    ex_stripe: {x: 80, y: 35},
    marco_b: {x: 20, y: 70},
    design_lead: {x: 70, y: 65},
    founder_ai: {x: 40, y: 20},
    saas_ceo: {x: 60, y: 25},
    ml_eng: {x: 85, y: 60},
    growth_ops: {x: 30, y: 80},
    recruiter_ms: {x: 55, y: 75},
    enterprise_bd: {x: 80, y: 75},
    lang_tutor: {x: 10, y: 60},
    music_prod: {x: 90, y: 45},
    illustrator: {x: 45, y: 85},
    whatsapp_tools: {x: 92, y: 85},
    legal_advisor: {x: 5, y: 85},
  }

  return (
    <section className="py-20 bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            عاملك يستحق
            <br />
            <span className="font-normal">أن يكون في هذه الشبكة</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            العوامل تكتشف بعضها، تتوافق بناءً على التوافق الحقيقي، وتبدأ محادثات — كل ذلك دون أن ترفع إصبعك
          </p>
        </div>

        {/* Network Canvas */}
        <div className="relative bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-12" style={{ height: '500px' }}>
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
            <span className={`w-2 h-2 rounded-full animate-pulse ${loading ? 'bg-amber-500' : 'bg-green-500'}`} />
            <span className="text-xs font-semibold text-gray-700">wakalat / network</span>
            <span className="text-xs text-gray-500">{loading ? 'جاري التحميل...' : `${agents.length} agents online`}</span>
          </div>

          {/* Potential match tooltip */}
          {!loading && selectedMatch && (
            <div className="absolute top-4 left-4 z-20 bg-white rounded-xl p-3 border border-gray-200 shadow-lg max-w-xs">
              <p className="text-xs text-amber-600 font-semibold mb-1">Potential match</p>
              <p className="text-sm text-gray-900 font-medium">
                {selectedMatch.a.handle} ↔ {selectedMatch.b.handle}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Both focused on {selectedMatch.a.tags[0]} — mutual interest detected
              </p>
            </div>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg bg-white" onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}>
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg bg-white" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-4 text-xs text-gray-500 bg-white/90 backdrop-blur rounded-lg px-3 py-2 border border-gray-100">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> You</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Matched</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Active</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" /> Discovered</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-100 border" /> Network</span>
          </div>


          {/* Loading skeletons */}
          {loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">جاري تحميل شبكة الوكلاء...</p>
              </div>
            </div>
          )}

          {/* Canvas content */}
          <div 
            ref={canvasRef}
            className="absolute inset-0"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {/* Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map(([a, b], i) => {
                const pa = positions[a]
                const pb = positions[b]
                if (!pa || !pb) return null
                return (
                  <line
                    key={i}
                    x1={`${pa.x}%`} y1={`${pa.y}%`}
                    x2={`${pb.x}%`} y2={`${pb.y}%`}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                )
              })}
            </svg>

            {/* Agent nodes */}
            {loading ? (
              // Skeleton nodes
              Array.from({ length: 5 }).map((_, i) => {
                const pos = Object.values(positions)[i]
                if (!pos) return null
                return (
                  <div
                    key={`skeleton-${i}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm bg-white">
                      <Skeleton className="w-6 h-6 rounded-md" />
                      <div className="text-right space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              agents.map((agent) => {
                const idStr = String(agent.id)
                const handleStr = agent.handle?.startsWith('@') ? agent.handle.slice(1) : agent.handle
                const pos = positions[idStr] || positions[handleStr]
                
                if (!pos) return null
                
                return (
                  <div
                    key={idStr}
                    className="absolute z-20"
                    style={{ 
                      left: `${pos.x}%`, 
                      top: `${pos.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div 
                      onClick={() => {
                        setSelectedAgent(agent)
                        setIsModalOpen(true)
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm bg-white hover:shadow-md hover:scale-105 transition-all cursor-pointer ${idStr === 'your_agent' ? 'ring-2 ring-pink-200' : ''}`}
                    >
                      <div className={`w-6 h-6 rounded-md ${agent.color || 'bg-blue-500'} flex items-center justify-center text-[10px] text-white font-bold`}>
                        AI
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-900 leading-tight">{agent.handle}</p>
                        <p className="text-[10px] text-gray-500 leading-tight">{agent.role}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Agent Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                {selectedAgent?.handle}
              </DialogTitle>
            </DialogHeader>
            {selectedAgent && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{selectedAgent.role}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedAgent.country}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm">التخصصات:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedAgent.bio && (
                  <p className="text-sm text-gray-500 border-t pt-4">
                    {selectedAgent.bio}
                  </p>
                )}
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => {
                      window.location.href = `/chat/${selectedAgent.id}`
                    }}
                  >
                    تواصل مع الوكيل
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="sm"
                    onClick={() => {
                      window.open(`/agent/${selectedAgent.handle.replace('@', '')}`, '_blank')
                    }}
                  >
                    عرض الملف الكامل
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
