import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Scale, 
  FileText, 
  BookOpen, 
  Shield, 
  Send, 
  Bot, 
  User,
  Upload,
  ChevronRight,
  FileCheck,
  AlertCircle,
  Settings,
  Bookmark,
  ChevronDown,
  FileUp,
  ArrowLeft
} from 'lucide-react'
import { api } from '@/lib/api'

interface Agent {
  id: number
  handle: string
  display_name?: string
  role?: string
  country?: string
  tags: string[]
  bio?: string
}

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface LegalAnalysis {
  summary: string
  articleNumber: string
  articleName: string
  issueDate: string
  confidence: number
  keyPoints: string[]
  legalRefs: string[]
}

interface UploadedDocument {
  id: string
  name: string
  type: string
  content?: string
  analysis?: LegalAnalysis
}

const SIDEBAR_ITEMS = [
  { id: 'contracts', name: 'مجلة الالتزامات والعقود', icon: FileText },
  { id: 'civil', name: 'مجلة المرافعات المدنية', icon: FileText },
  { id: 'personal', name: 'الأحوال الشخصية', icon: User },
  { id: 'criminal', name: 'مجلة القانون الجنائي', icon: Shield },
]

export default function LegalAdvisor() {
  const { agentId } = useParams<{ agentId: string }>()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [citizenMode, setCitizenMode] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null)
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await api.get(/agents/${agentId})
        setAgent(response.data)
      } catch (error) {
        console.error('Failed to fetch agent:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAgent()
  }, [agentId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)
    try {
      const response = await api.post(/agents/${agentId}/chat, { message: input })
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const newDoc: UploadedDocument = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
    }
    setTimeout(() => {
      newDoc.analysis = {
        summary: 'تحليل بنود هذا العقد ومطابقاتها للمعاملات التجارية التونسية التونسية وأحكام عقل النظم المدنية العاملة في المسايرة العصرية، حيث يتم تقييم الطبقة-مظهر: الفلسف والمشكلة في بناء الطلابة حيث شهدت الأعوام، هل أهلك القانون المدنية والإجراءات الاجتماعية المطابقة للنظم التي تجعل المالك عاصمة مجرزة الوراثات الثور الذي يقف حوائز الأموال للأتعاب المطابقة للنظم التي تجعل المالك عاصمة مجرزة الوراثات الثور',
        articleNumber: 'الفصل: 2359',
        articleName: 'مجلة الشغل',
        issueDate: '1966-04-30',
        confidence: 98,
        keyPoints: [
          'النص صريح القانون مباشر صدر في الفصل المشمول بمقاول ذي الجانب حريات',
          'المؤكد أمنه صدر ضمن أعضاء المجلة التونسية عقود ما إن جود في المجلة التونسية.'
        ],
        legalRefs: ['JORT 2359', 'JORT 4438', 'JORT TT']
      }
      setUploadedDocs(prev => [...prev, newDoc])
      setSelectedDoc(newDoc)
    }, 1500)
    setUploadedDocs(prev => [...prev, newDoc])
  }, [])

  if (loading) {
    return (
      <div className="h-screen flex bg-[#f5f3f0]">
        <div className="w-72 bg-[#1a2f1a] p-4">
          <Skeleton className="h-8 w-32 mb-8 bg-[#2d4a2d]" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-[#2d4a2d]" />
            <Skeleton className="h-12 w-full bg-[#2d4a2d]" />
            <Skeleton className="h-12 w-full bg-[#2d4a2d]" />
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f3f0]">
        <Card className="w-96">
          <CardContent className="py-12 text-center">
            <Scale className="h-16 w-16 mx-auto mb-4 text-[#5c4a3a]" />
            <p className="text-muted-foreground mb-4">المستشار القانوني غير موجود</p>
            <Button asChild className="bg-[#5c4a3a] hover:bg-[#4a3a2a]">
              <Link to="/search">البحث عن مستشار</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-[#f5f3f0]" dir="rtl">
      {/* Sidebar - Dark Green */}
      <div className="w-72 bg-[#1a2f1a] text-[#e8e4df] flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-[#2d4a2d]">
          <Link to="/" className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-[#c4a574]" />
            <span className="text-2xl font-serif text-[#c4a574]">Lex</span>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <div className="px-3">
            <p className="text-xs text-[#8fa88f] mb-3 px-2">المجلات القانونية</p>
            <div className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-[#c8d4c8] hover:bg-[#2d4a2d] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>

          {/* Uploaded Documents */}
          {uploadedDocs.length > 0 && (
            <div className="mt-6 px-3">
              <p className="text-xs text-[#8fa88f] mb-3 px-2">الوثائق المرفوعة</p>
              <div className="space-y-1">
                {uploadedDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                      selectedDoc?.id === doc.id
                        ? 'bg-[#3d5a3d] text-[#c4a574]'
                        : 'text-[#a8b8a8] hover:bg-[#2d4a2d]'
                    }`}
                  >
                    <FileText className="h-3 w-3" />
                    <span className="truncate flex-1 text-right">{doc.name}</span>
                    {doc.analysis && (
                      <span className="text-[10px] bg-[#4a6a4a] px-1.5 py-0.5 rounded">
                        {doc.analysis.confidence}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-[#2d4a2d]">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8 bg-[#5c4a3a]">
              <AvatarFallback className="text-white text-xs">
                {agent.display_name?.[0] || 'L'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{agent.display_name}</p>
              <p className="text-xs text-[#8fa88f] truncate">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8fa88f]">
            <Settings className="h-3 w-3" />
            <span>GDPR/INDP Settings</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#e0dcd5] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-[#5c4a3a]">
              <Link to={`/agent/${agent.handle}`}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-[#5c4a3a]">
              <span className="text-[#7a6a5a]">Français</span>
              <span className="text-[#c4a574]">|</span>
              <span className="font-medium">عربي</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#5c4a3a]">تبسيط اللغة القانونية</span>
              <Switch 
                checked={citizenMode}
                onCheckedChange={setCitizenMode}
                className="data-[state=checked]:bg-[#5c4a3a]"
              />
            </div>
          </div>
        </header>

        {/* Content Area - Three Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document View (Center) */}
          <div className="w-5/12 flex flex-col border-l border-[#e0dcd5]">
            {/* Upload Bar */}
            <div className="bg-white p-4 border-b border-[#e0dcd5]">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {selectedDoc ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f0ebe5] rounded-lg flex items-center justify-center">
                    <FileUp className="h-5 w-5 text-[#5c4a3a]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#5c4a3a]">{selectedDoc.name}</p>
                    <p className="text-xs text-[#9a8a7a]">عقد كراء تجاري - مسودة</p>
                  </div>
                  <Badge className="bg-[#e8f5e9] text-[#2e7d32] border-0">
                    {selectedDoc.analysis?.confidence || 0}% RAG confidence
                  </Badge>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#d0ccc5] rounded-lg p-4 text-center cursor-pointer hover:border-[#c4a574] transition-colors"
                >
                  <Upload className="h-5 w-5 mx-auto mb-2 text-[#9a8a7a]" />
                  <p className="text-sm text-[#5c4a3a]">رفع وثيقة قانونية</p>
                </div>
              )}
            </div>

            {/* Document Content */}
            <ScrollArea className="flex-1 bg-white">
              {selectedDoc ? (
                <div className="p-6">
                  {/* PDF Viewer Mock */}
                  <div className="bg-[#faf8f5] border border-[#e0dcd5] rounded-lg p-8 min-h-[600px]">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-bold text-[#5c4a3a] mb-2">عقد كراء تجاري - مسودة</h2>
                      <p className="text-sm text-[#7a6a5a]">عقد رقم: 2024/001</p>
                    </div>
                    
                    <div className="space-y-4 text-sm leading-relaxed text-[#4a3a2a]">
                      <p>بسم الله الرحمن الرحيم</p>
                      <p className="font-medium mt-4">بنود العقد:</p>
                      <div className="space-y-2 text-[#5a4a3a]">
                        <p>1. مدة العقد: 3 سنوات قابلة للتجديد</p>
                        <p>2. القيمة الإيجارية: 5000 دينار شهرياً</p>
                        <p>3. الزيادة السنوية: 5% من القيمة الإيجارية</p>
                        <p>4. الغرض: استغلال تجاري - محل لبيع الألبسة</p>
                        <p>5. التزامات المكتري: صيانة المحل وإعادته لحالته الأصلية</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-[#9a8a7a]">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-40" />
                    <p>ارفع عقد أو وثيقة قانونية للتحليل</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Analysis Panel (Right) */}
          <div className="w-4/12 flex flex-col bg-[#faf8f5] border-l border-[#e0dcd5]">
            <ScrollArea className="flex-1 p-5">
              {selectedDoc?.analysis ? (
                <div className="space-y-5">
                  {/* Analysis Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-[#e8f5e9] text-[#2e7d32] border-0 text-xs">
                        {selectedDoc.analysis.confidence}% RAG confidence
                      </Badge>
                    </div>
                    
                    <div className="flex items-start gap-3 mb-4">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5c4a3a] text-white text-xs flex items-center justify-center">1</span>
                      <p className="text-sm leading-relaxed text-[#4a3a2a]">{selectedDoc.analysis.summary}</p>
                    </div>
                  </div>

                  {/* Legal Reference Card */}
                  <Card className="bg-[#f5f0ea] border-[#e0dcd5]">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[#7a6a5a] mb-1">رقم الفصل:</p>
                          <p className="text-sm font-medium text-[#5c4a3a]">{selectedDoc.analysis.articleNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#7a6a5a] mb-1">اسم القانون:</p>
                          <p className="text-sm font-medium text-[#5c4a3a]">{selectedDoc.analysis.articleName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#7a6a5a] mb-1">تاريخ الإصدار:</p>
                          <p className="text-sm text-[#5c4a3a]">{selectedDoc.analysis.issueDate}</p>
                        </div>
                        <div className="pt-2 border-t border-[#e0dcd5]">
                          <p className="text-xs text-[#7a6a5a] mb-1">المراجع:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedDoc.analysis.legalRefs.map((ref, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] bg-white">
                                {ref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Points */}
                  <div>
                    <h4 className="text-sm font-medium text-[#5c4a3a] mb-3 flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-[#c4a574]" />
                      النقاط القانونية الأساسية
                    </h4>
                    <div className="space-y-2">
                      {selectedDoc.analysis.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex gap-2 text-sm">
                          <span className="text-[#c4a574] font-medium">{idx + 1}.</span>
                          <p className="text-[#4a3a2a] leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Analysis */}
                  <div>
                    <h4 className="text-sm font-medium text-[#5c4a3a] mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-[#c4a574]" />
                      تحليل المخاطر
                    </h4>
                    <div className="bg-[#fff8e1] border border-[#ffe082] rounded-lg p-3">
                      <p className="text-sm text-[#5d4037]">
                        يُنصح بمراجعة بند الزيادة السنوية (5%) مع المحامي للتأكد من توافقه مع القانون التونسي.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[#9a8a7a]">
                  <div className="text-center">
                    <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">سيتم عرض التحليل القانوني هنا</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Panel (Left - 3/12) */}
          <div className="w-3/12 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-[#e0dcd5] flex items-center gap-3">
              <div className="w-8 h-8 bg-[#5c4a3a] rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#5c4a3a]">المستشار القانوني</p>
                <p className="text-xs text-[#9a8a7a]">جاهز للمساعدة</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#7a6a5a] mb-4">كيف يمكنني مساعدتك في هذا العقد؟</p>
                    <div className="space-y-2">
                      {['ما مدى قانونية بند الزيادة السنوية؟', 'هل يمكن تعديل مدة العقد؟', 'ما حقوق المكتري في حال الإخلاء؟'].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(q)}
                          className="block w-full text-right px-3 py-2 text-xs text-[#5c4a3a] bg-[#f5f3f0] rounded-lg hover:bg-[#ebe7e0] transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className={m.role === 'user' ? 'bg-[#d0ccc5]' : 'bg-[#5c4a3a] text-white text-[10px]'}>
                          {m.role === 'user' ? <User className="h-3 w-3" /> : <Scale className="h-3 w-3" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-3 py-2 max-w-[90%] text-sm ${
                        m.role === 'user' ? 'bg-[#5c4a3a] text-white' : 'bg-[#f5f3f0] text-[#4a3a2a]'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-[#e0dcd5]">
              <div className="flex gap-2">
                <Textarea
                  placeholder="سؤال قانوني..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  disabled={sending}
                  className="flex-1 min-h-[60px] resize-none text-sm border-[#d0ccc5] focus:border-[#c4a574]"
                  dir="rtl"
                />
                <div className="flex flex-col gap-1">
                  <Button onClick={handleSend} disabled={!input.trim() || sending} className="bg-[#5c4a3a] hover:bg-[#4a3a2a] h-8 px-2">
                    <Send className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="h-8 w-8 border-[#d0ccc5]">
                    <Upload className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-1 mt-2">
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-[#7a6a5a]">
                  <Bookmark className="h-3 w-3 ml-1" />
                  حفظ
                </Button>
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-[#7a6a5a]">
                  <History className="h-3 w-3 ml-1" />
                  السجل
                </Button>
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-[#7a6a5a]">
                  <FileCheck className="h-3 w-3 ml-1" />
                  صياغة
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
