import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { 
  Scale, 
  FileText, 
  BookOpen, 
  Gavel, 
  Shield, 
  Send, 
  Bot, 
  User,
  Upload,
  ChevronRight,
  Landmark,
  FileCheck,
  AlertCircle,
  Languages,
  Settings,
  ArrowLeft,
  MessageSquare,
  History,
  Bookmark
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
  analysis?: LegalAnalysis
}

interface LegalAnalysis {
  documentType?: string
  riskLevel: 'low' | 'medium' | 'high'
  keyClauses: string[]
  concerns: string[]
  suggestions: string[]
  legalRefs: string[]
  confidence: number
}

interface UploadedDocument {
  id: string
  name: string
  type: string
  content?: string
  analysis?: LegalAnalysis
}

const LEGAL_CATEGORIES = [
  { id: 'contract', name: 'العقود', icon: FileText, desc: 'صياغة ومراجعة العقود' },
  { id: 'company', name: 'تأسيس الشركات', icon: Landmark, desc: 'إجراءات التأسيس والترخيص' },
  { id: 'ip', name: 'الملكية الفكرية', icon: Shield, desc: 'براءات الاختراع والعلامات' },
  { id: 'dispute', name: 'النزاعات', icon: Gavel, desc: 'التقاضي والتحكيم' },
  { id: 'compliance', name: 'الامتثال', icon: FileCheck, desc: 'اللوائح والمعايير' },
]

const SIDEBAR_ITEMS = [
  { id: 'contracts', name: 'مجلة الالتزامات والعقود', icon: FileText },
  { id: 'civil', name: 'مجلة المرافعات المدنية', icon: BookOpen },
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
  const [activeCategory, setActiveCategory] = useState('contract')
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null)
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')
  const [showAnalysis, setShowAnalysis] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await api.get(`/agents/${agentId}`)
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
      const response = await api.post(`/agents/${agentId}/chat`, { message: input })
      
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response,
        created_at: new Date().toISOString(),
        analysis: response.data.analysis
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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

    // Simulate document analysis
    setTimeout(() => {
      newDoc.analysis = {
        documentType: 'عقد تجاري',
        riskLevel: 'medium',
        keyClauses: [
          'بند المسؤولية (Liability Clause)',
          'بند فض النزاعات (Dispute Resolution)',
          'بند سرية المعلومات (Confidentiality)'
        ],
        concerns: [
          'النص غير واضح في بند المسؤولية',
          'نقص شروط الحماية للطرف الأول'
        ],
        suggestions: [
          'إضافة بند للتعويض المحدود',
          'توضيح آلية فض النزاعات',
          'إضافة فترة سماح للسداد'
        ],
        legalRefs: [
          'الفصل 2359 من القانون التونسي',
          'JORT 2359',
          'JORT 4438'
        ],
        confidence: 98
      }
      setUploadedDocs(prev => [...prev, newDoc])
      setSelectedDoc(newDoc)
      setShowAnalysis(true)
    }, 1500)

    setUploadedDocs(prev => [...prev, newDoc])
  }, [])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low': return 'مخاطر منخفضة'
      case 'medium': return 'مخاطر متوسطة'
      case 'high': return 'مخاطر عالية'
      default: return 'غير محدد'
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex">
        <div className="w-64 bg-slate-900 p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
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
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="py-12 text-center">
            <Scale className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-muted-foreground mb-4">المستشار القانوني غير موجود</p>
            <Button asChild>
              <Link to="/search">البحث عن مستشار</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLegalAgent = agent.tags?.some(t => 
    ['legal', 'law', 'قانون', 'عقود', 'contracts'].includes(t.toLowerCase())
  )

  return (
    <div className="h-screen flex bg-slate-50" dir="rtl">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-500">Lex</h1>
              <p className="text-xs text-slate-400">المستشار القانوني الذكي</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <div className="px-4 mb-6">
            <p className="text-xs font-medium text-slate-500 uppercase mb-3">المجلات القانونية</p>
            <div className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-800 mx-4 w-auto" />

          {/* Categories */}
          <div className="px-4 mt-6">
            <p className="text-xs font-medium text-slate-500 uppercase mb-3">التخصصات</p>
            <div className="space-y-1">
              {LEGAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id 
                      ? 'bg-amber-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Uploaded Documents */}
          {uploadedDocs.length > 0 && (
            <>
              <Separator className="bg-slate-800 mx-4 w-auto mt-6" />
              <div className="px-4 mt-6">
                <p className="text-xs font-medium text-slate-500 uppercase mb-3">الوثائق المرفوعة</p>
                <div className="space-y-2">
                  {uploadedDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoc(doc)
                        setShowAnalysis(true)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                        selectedDoc?.id === doc.id
                          ? 'bg-slate-800 text-amber-400'
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{doc.name}</span>
                      {doc.analysis && (
                        <Badge variant="outline" className={`text-[10px] px-1 py-0 ${getRiskColor(doc.analysis.riskLevel)}`}>
                          {doc.analysis.confidence}%
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-amber-600 text-white text-xs">
                {agent.display_name?.[0] || 'L'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{agent.display_name}</p>
              <p className="text-xs text-slate-400 truncate">{agent.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Settings className="h-3 w-3" />
            <span>GDPR/INDP Settings</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/agent/${agent.handle}`}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للملف الشخصي
              </Link>
            </Button>
            
            {isLegalAgent && (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                <Scale className="h-3 w-3 ml-1" />
                مستشار قانوني معتمد
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Languages className="h-4 w-4" />
              <button 
                onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
                className="hover:text-amber-600"
              >
                {language === 'ar' ? 'Français' : 'عربي'}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">تبسيط اللغة القانونية</span>
              <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document & Analysis Panel */}
          <div className="w-1/2 flex flex-col border-l">
            {/* Upload Area */}
            <div className="p-4 bg-white border-b">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {!selectedDoc ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto mb-3 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">ارفع عقد أو وثيقة قانونية</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, TXT</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedDoc.name}</p>
                      {selectedDoc.analysis && (
                        <p className="text-xs text-slate-500">
                          تم التحليل • ثقة {selectedDoc.analysis.confidence}%
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAnalysis(!showAnalysis)}
                    >
                      {showAnalysis ? 'إخفاء التحليل' : 'عرض التحليل'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedDoc(null)
                        setShowAnalysis(false)
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Document Preview / Analysis */}
            <ScrollArea className="flex-1 bg-slate-50">
              {selectedDoc ? (
                showAnalysis && selectedDoc.analysis ? (
                  <div className="p-6 space-y-6">
                    {/* Risk Level */}
                    <Card className={`border-l-4 ${selectedDoc.analysis.riskLevel === 'high' ? 'border-l-red-500' : selectedDoc.analysis.riskLevel === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className={`h-5 w-5 ${selectedDoc.analysis.riskLevel === 'high' ? 'text-red-500' : selectedDoc.analysis.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                            <span className="font-medium">مستوى المخاطر</span>
                          </div>
                          <Badge className={getRiskColor(selectedDoc.analysis.riskLevel)}>
                            {getRiskLabel(selectedDoc.analysis.riskLevel)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          ثقة التحليل: {selectedDoc.analysis.confidence}%
                        </p>
                      </CardHeader>
                    </Card>

                    {/* Key Clauses */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Bookmark className="h-4 w-4 text-amber-600" />
                        البنود القانونية المهمة
                      </h4>
                      <div className="space-y-2">
                        {selectedDoc.analysis.keyClauses.map((clause, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border text-sm">
                            <span className="text-amber-600 font-medium ml-2">{idx + 1}.</span>
                            {clause}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Concerns */}
                    {selectedDoc.analysis.concerns.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          نقاط تستوجب الانتباه
                        </h4>
                        <div className="space-y-2">
                          {selectedDoc.analysis.concerns.map((concern, idx) => (
                            <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-800">
                              {concern}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-600">
                        <FileCheck className="h-4 w-4" />
                        توصيات التحسين
                      </h4>
                      <div className="space-y-2">
                        {selectedDoc.analysis.suggestions.map((suggestion, idx) => (
                          <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm text-green-800">
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legal References */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-slate-600">
                        <BookOpen className="h-4 w-4" />
                        المراجع القانونية
                      </h4>
                      <div className="space-y-2">
                        {selectedDoc.analysis.legalRefs.map((ref, idx) => (
                          <div key={idx} className="bg-slate-100 p-3 rounded-lg text-sm font-mono text-slate-700">
                            {ref}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">معاينة الوثيقة</p>
                    <p className="text-sm text-slate-400 mt-2">جاري تحليل المحتوى...</p>
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <Scale className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>ارفع وثيقة لتحليلها قانونياً</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Panel */}
          <div className="w-1/2 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">المستشار القانوني</p>
                <p className="text-xs text-slate-500">جاهز للمساعدة</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="font-medium mb-2">ابدأ استشارتك القانونية</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      يمكنك طرح أي سؤال قانوني حول العقود، تأسيس الشركات، الملكية الفكرية، أو أي موضوع قانوني آخر.
                    </p>
                    
                    {/* Quick Questions */}
                    <div className="mt-6 space-y-2">
                      {[
                        'ما هي بنود العقد الأساسية التي يجب مراجعتها؟',
                        'كيف أحمي فكرتي قبل التحدث مع مستثمرين؟',
                        'ما الإجراءات المطلوبة لتأسيس شركة في الإمارات؟'
                      ].map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInput(q)
                          }}
                          className="block w-full text-right px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="h-4 w-4 inline ml-2" />
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={
                          message.role === 'user'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-900 text-white'
                        }>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Scale className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg px-4 py-3 max-w-[85%] ${
                          message.role === 'user'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        
                        {message.analysis && message.role === 'assistant' && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <button 
                              onClick={() => setShowAnalysis(true)}
                              className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                            >
                              <FileCheck className="h-3 w-3" />
                              عرض التحليل القانوني
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Textarea
                  placeholder="اكتب سؤالك القانوني هنا..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={sending}
                  className="flex-1 min-h-[60px] resize-none"
                  dir="rtl"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="رفع وثيقة"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="text-xs">
                  <Bookmark className="h-3 w-3 ml-1" />
                  حفظ المحادثة
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <History className="h-3 w-3 ml-1" />
                  سجل الاستشارات
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <FileCheck className="h-3 w-3 ml-1" />
                  صياغة عقد
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Gavel className="h-3 w-3 ml-1" />
                  تحليل قانوني
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
