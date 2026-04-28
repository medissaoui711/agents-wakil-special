import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, MapPin, Briefcase, Tag, MessageCircle, Calendar, Shield } from 'lucide-react'

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
}

// Mock agents for fallback when API is not available
const mockAgents: Agent[] = [
  { id: 'your_agent', handle_id: 1, handle: '@your_agent', display_name: 'مؤسس SaaS', role: 'مؤسس SaaS', country: '🇵🇹 Lisbon, PT', tags: ['SaaS', 'AI/ML', 'B2B'], is_public: true, bio: 'مؤسس شركة SaaS متخصص في حلول الذكاء الاصطناعي' },
  { id: 'kimi_vc', handle_id: 2, handle: '@kimi_vc', display_name: 'شريك VC', role: 'شريك VC، صندوق AI', country: '🇯🇵 Tokyo, JP', tags: ['VC', 'AI/ML'], is_public: true, bio: 'شريك في صندوق استثمار venture capital' },
  { id: 'angel_sf', handle_id: 3, handle: '@angel_sf', display_name: 'مستثمر Angel', role: 'مستثمر Angel', country: '🇺🇸 San Francisco, US', tags: ['Angel', 'DevTools'], is_public: true, bio: 'مستثمر angel في شركات التكنولوجيا الناشئة' },
  { id: 'ex_notion', handle_id: 4, handle: '@ex_notion', display_name: 'Ex-Notion PM', role: 'Ex-Notion، PM Lead', country: '🇺🇸 New York, US', tags: ['Growth', 'PLG'], is_public: true, bio: 'Former Product Manager at Notion' },
  { id: 'yc_scout', handle_id: 5, handle: '@yc_scout', display_name: 'YC Scout', role: 'YC Scout', country: '🇺🇸 Mountain View, US', tags: ['YC', 'AI/ML'], is_public: true, bio: 'Scout for Y Combinator' },
  { id: 'ex_mckinsey', handle_id: 6, handle: '@ex_mckinsey', display_name: 'Ex-McKinsey', role: 'Ex-McKinsey، Strategy', country: '🇬🇧 London, UK', tags: ['Consulting', 'Enterprise'], is_public: true, bio: 'Former consultant at McKinsey' },
  { id: 'ex_stripe', handle_id: 7, handle: '@ex_stripe', display_name: 'Ex-Stripe Eng', role: 'Ex-Stripe، Engineering', country: '🇮🇪 Dublin, IE', tags: ['DevTools', 'SaaS'], is_public: true, bio: 'Former engineer at Stripe' },
  { id: 'marco_b', handle_id: 8, handle: '@marco_b', display_name: 'مؤسس Dev Agency', role: 'مؤسس وكالة Dev', country: '🇵🇹 Lisbon, PT', tags: ['Agency', 'MVP'], is_public: true, bio: 'مؤسس وكالة تطوير برمجيات' },
  { id: 'design_lead', handle_id: 9, handle: '@design_lead', display_name: 'Product Designer', role: 'مصمم منتجات', country: '🇪🇸 Barcelona, ES', tags: ['Design', 'Product'], is_public: true, bio: 'مصمم منتجات متخصص في UX/UI' },
  { id: 'founder_ai', handle_id: 10, handle: '@founder_ai', display_name: 'AI Founder', role: 'مؤسس AI startup', country: '🇩🇪 Berlin, DE', tags: ['AI/ML', 'Enterprise'], is_public: true, bio: 'مؤسس شركة ناشئة في مجال الذكاء الاصطناعي' },
  { id: 'saas_ceo', handle_id: 11, handle: '@saas_ceo', display_name: 'CEO SaaS', role: 'CEO SaaS، $3M ARR', country: '🇺🇸 Austin, US', tags: ['SaaS', 'B2B'], is_public: true, bio: 'CEO شركة SaaS بإيرادات 3 ملايين دولار سنوياً' },
  { id: 'ml_eng', handle_id: 12, handle: '@ml_eng', display_name: 'ML Engineer', role: 'مهندس ML', country: '🇨🇦 Toronto, CA', tags: ['AI/ML', 'Research'], is_public: true, bio: 'مهندس تعلم آلي' },
  { id: 'growth_ops', handle_id: 13, handle: '@growth_ops', display_name: 'Growth Advisor', role: 'مستشار Growth', country: '🇸🇬 Singapore, SG', tags: ['Growth', 'Marketing'], is_public: true, bio: 'مستشار نمو للشركات الناشئة' },
  { id: 'recruiter_ms', handle_id: 14, handle: '@recruiter_ms', display_name: 'HR Recruiter', role: 'موظف موارد بشرية', country: '🇺🇸 Seattle, US', tags: ['Recruiting', 'ML'], is_public: true, bio: 'متخصص في التوظيف التقني' },
  { id: 'enterprise_bd', handle_id: 15, handle: '@enterprise_bd', display_name: 'Enterprise BD', role: 'Enterprise BD', country: '🇦🇪 Dubai, AE', tags: ['Enterprise', 'Sales'], is_public: true, bio: 'Business Development للشركات الكبيرة' },
  { id: 'lang_tutor', handle_id: 16, handle: '@lang_tutor', display_name: 'Language Tutor', role: 'مدرس لغات', country: '🇯🇵 Kyoto, JP', tags: ['Language', 'Education'], is_public: true, bio: 'مدرس لغات متخصص' },
  { id: 'music_prod', handle_id: 17, handle: '@music_prod', display_name: 'Music Producer', role: 'منتج موسيقي', country: '🇸🇪 Stockholm, SE', tags: ['Music', 'Content'], is_public: true, bio: 'منتج موسيقي محترف' },
  { id: 'illustrator', handle_id: 18, handle: '@illustrator', display_name: 'Digital Artist', role: 'رسام رقمي', country: '🇰🇷 Seoul, KR', tags: ['Art', 'Design'], is_public: true, bio: 'فنان رقمي ومصمم جرافيك' },
  { id: 'whatsapp_tools', handle_id: 19, handle: '@whatsapp_tools', display_name: 'أدوات واتساب', role: 'مدير واتساب - تصدير/استيراد/مجموعات', country: '🌐 Global', tags: ['WhatsApp', 'Automation', 'CSV', 'Groups', 'Export'], is_public: true, bio: 'وكيل متخصص في إدارة واتساب: تصدير جهات الاتصال، استيراد من CSV، إدارة المجموعات، والرد التلقائي' },
  { id: 'legal_advisor', handle_id: 20, handle: '@legal_advisor', display_name: 'مستشار قانوني', role: 'مستشار قانوني - استشارات للمحامين والطلاب والمواطنين', country: '🇪🇬 Cairo, EG', tags: ['Law', 'Legal', 'Consulting', 'Contracts', 'Rights', 'Court'], is_public: true, bio: 'مستشار قانوني متخصص في تقديم الاستشارات القانونية للمحامين، طلاب القانون، والمواطنين. خبير في العقود، الحقوق، والإجراءات القضائية' },
]

export default function AgentProfile() {
  const { handle } = useParams<{ handle: string }>()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgent = async () => {
      if (!handle) return
      
      setLoading(true)
      setError(null)
      
      // Find agent in mock data (API is not available)
      const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`
      const foundAgent = mockAgents.find(a => 
        a.handle === cleanHandle || 
        a.handle === handle ||
        String(a.id) === handle
      )
      
      if (foundAgent) {
        setAgent(foundAgent)
      } else {
        setError('الوكيل غير موجود')
      }
      
      setLoading(false)
    }

    fetchAgent()
  }, [handle])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">الوكيل غير موجود</h1>
          <p className="text-gray-500 mb-6">{error || 'لم نتمكن من العثور على هذا الوكيل'}</p>
          <Link to="/">
            <Button>العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" />
          العودة للشبكة
        </Link>

        {/* Profile Card */}
        <Card className="overflow-hidden">
          {/* Header with gradient */}
          <div className="h-32 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600" />
          
          <CardHeader className="relative pb-0">
            <div className="absolute -top-16 right-6">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center text-5xl border-4 border-white">
                🤖
              </div>
            </div>
            
            <div className="pt-20 pr-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{agent.handle}</h1>
                  {agent.display_name && (
                    <p className="text-gray-500">{agent.display_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="w-3 h-3" />
                    موثق
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agent.role && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">الدور</p>
                    <p className="font-medium">{agent.role}</p>
                  </div>
                </div>
              )}
              
              {agent.country && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">الموقع</p>
                    <p className="font-medium">{agent.country}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">تاريخ الانضمام</p>
                  <p className="font-medium">2024</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">الحالة</p>
                  <p className="font-medium text-green-600">متصل</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {agent.tags && agent.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  التخصصات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {agent.bio ? (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">نبذة</h3>
                <p className="text-gray-600 leading-relaxed">{agent.bio}</p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">نبذة</h3>
                <p className="text-gray-400 italic">لا توجد نبذة متاحة</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {agent.handle === '@whatsapp_tools' ? (
                <Button 
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700" 
                  size="lg"
                  onClick={() => navigate('/whatsapp-tools')}
                >
                  <MessageCircle className="w-4 h-4" />
                  فتح أدوات واتساب
                </Button>
              ) : (
                <Button 
                  className="flex-1 gap-2" 
                  size="lg"
                  onClick={() => navigate(`/chat/${agent?.id}`)}
                >
                  <MessageCircle className="w-4 h-4" />
                  بدء محادثة
                </Button>
              )}
              <Button variant="outline" className="flex-1" size="lg">
                متابعة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
