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
  ChevronLeft,
  FileCheck,
  AlertCircle,
  Settings,
  Bookmark,
  ChevronDown,
  FileUp,
  ArrowLeft,
  History as HistoryIcon,
  MessageSquare,
  Copy,
  Sparkles,
  Lightbulb,
  FileEdit,
  Info,
  Mic,
  Moon, 
  Sun, 
  Share2, 
  Download, 
  Menu, 
  X, 
  ChevronUp
} from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useTheme } from '@/hooks/useTheme'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Custom animations
const customStyles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.3s ease-out forwards;
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out forwards;
}

.animate-pulse-ring {
  animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.message-bubble {
  transition: all 0.2s ease;
}

.message-bubble:hover {
  transform: translateY(-1px);
}

.typing-dot {
  animation: bounce 1.4s ease-in-out infinite both;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
`

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
  console.log('[LegalAdvisor] Component starting...')
  const { agentId } = useParams<{ agentId: string }>()
  console.log('[LegalAdvisor] agentId:', agentId)
  
  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [citizenMode, setCitizenMode] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null)
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar')
  const [showHistory, setShowHistory] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type.includes('pdf') || file.type.includes('document') || file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.txt'))) {
      // Process the dropped file
      const newDoc: UploadedDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
      }
      setTimeout(() => {
        newDoc.analysis = {
          summary: 'تحليل بنود هذا العقد ومطابقاتها للمعاملات التجارية التونسية...',
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
        toast.success('تم رفع الوثيقة وتحليلها بنجاح', {
          description: `${file.name} جاهزة للمراجعة`,
          icon: <FileCheck className="h-4 w-4" />,
        })
      }, 1500)
      setUploadedDocs(prev => [...prev, newDoc])
      toast.info('جاري رفع الوثيقة...', {
        description: file.name,
      })
    } else {
      toast.error('نوع الملف غير مدعوم', {
        description: 'يرجى رفع ملف PDF, DOC, DOCX, أو TXT',
      })
    }
  }, [])

  // Export chat to file
  const exportChat = useCallback((format: 'txt' | 'json') => {
    const chatData = {
      agent: activeAgent,
      messages: messages,
      timestamp: new Date().toISOString(),
      document: selectedDoc
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `legal-consultation-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      let text = `=== استشارة قانونية ===\n`
      text += `التاريخ: ${new Date().toLocaleString('ar-SA')}\n`
      text += `الوكيل: ${activeAgent.display_name}\n\n`
      messages.forEach(m => {
        const role = m.role === 'user' ? 'أنت' : 'المستشار القانوني'
        text += `[${role}] ${new Date(m.created_at).toLocaleTimeString('ar-SA')}\n${m.content}\n\n`
      })
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `legal-consultation-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
    toast.success(`تم تصدير المحادثة بصيغة ${format.toUpperCase()}`)
  }, [messages, activeAgent, selectedDoc])

  // Share consultation link
  const shareConsultation = useCallback(() => {
    const shareUrl = `${window.location.origin}/legal/${agentId}?shared=true`
    navigator.clipboard.writeText(shareUrl)
    toast.success('تم نسخ رابط المشاركة', {
      description: 'يمكنك مشاركته الآن مع الآخرين',
      icon: <Share2 className="h-4 w-4" />
    })
    setShareDialogOpen(false)
  }, [agentId])

  useEffect(() => {
    console.log('[LegalAdvisor] Fetching agent:', agentId)
    const fetchAgent = async () => {
      try {
        const data = await api.getAgent(agentId as string)
        console.log('[LegalAdvisor] Agent fetched:', data)
        setAgent(data)
      } catch (error) {
        console.error('[LegalAdvisor] Failed to fetch agent:', error)
      } finally {
        setLoading(false)
      }
    }
    if (agentId) {
      fetchAgent()
    } else {
      console.log('[LegalAdvisor] No agentId provided')
      setLoading(false)
    }
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
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const response = await api.generateAIResponse(Number(agentId), input, history)
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage])
      toast.success('تم استلام الرد', {
        icon: <Bot className="h-4 w-4" />,
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('فشل إرسال الرسالة', {
        description: 'يرجى المحاولة مرة أخرى',
      })
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
      toast.success('تم رفع الوثيقة وتحليلها بنجاح', {
        description: `${file.name} جاهزة للمراجعة`,
        icon: <FileCheck className="h-4 w-4" />,
      })
    }, 1500)
    setUploadedDocs(prev => [...prev, newDoc])
    toast.info('جاري رفع الوثيقة...', {
      description: file.name,
    })
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

  // Fallback agent for demo purposes
  const fallbackAgent: Agent = {
    id: 0,
    handle: 'legal_advisor',
    display_name: 'مستشار قانوني',
    role: 'مستشار قانوني - استشارات للمحامين والطلاب والمواطنين',
    country: '🇪🇬 Cairo, EG',
    tags: ['Law', 'Legal', 'Consulting', 'Contracts', 'Rights', 'Court'],
    bio: 'مستشار قانوني متخصص في تقديم الاستشارات القانونية للمحامين، طلاب القانون، والمواطنين. خبير في العقود، الحقوق، والإجراءات القضائية'
  }

  // Use fallback if no agent found
  const activeAgent = agent || fallbackAgent

  // If we're using fallback, show a notification but still render the UI
  const usingFallback = !agent
  console.log('[LegalAdvisor] Rendering, usingFallback:', usingFallback)

  return (
    <>
      <style>{customStyles}</style>
      <div className="h-screen flex bg-[#f5f3f0] dark:bg-[#0f1a0f] transition-colors" dir="rtl">
      {console.log('[LegalAdvisor] JSX rendering')}
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - Dark Green - Responsive */}
      <div className={`${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} fixed lg:static lg:translate-x-0 right-0 top-0 h-full w-72 bg-[#1a2f1a] text-[#e8e4df] flex flex-col z-50 transition-transform duration-300 lg:order-none order-2`}>
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
                {activeAgent.display_name?.[0] || 'L'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activeAgent.display_name}</p>
              <p className="text-xs text-[#8fa88f] truncate">{activeAgent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8fa88f]">
            <Settings className="h-3 w-3" />
            <span>GDPR/INDP Settings</span>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col overflow-hidden order-1 w-full">
        {/* Fallback Notification */}
        {usingFallback && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 px-4 py-2 text-center">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              ⚠️ يتم استخدام وضع العرض التجريبي - الوكيل القانوني غير مسجل في قاعدة البيانات
            </p>
          </div>
        )}
        {/* Header - Mobile Responsive */}
        <header className="bg-white dark:bg-[#1a1a1a] border-b border-[#e0dcd5] dark:border-[#333] px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#5c4a3a] dark:text-[#c4a574] hover:bg-[#f0ebe5] dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <Button variant="ghost" size="sm" asChild className="text-[#5c4a3a] dark:text-[#c4a574]">
              <Link to={`/agent/${activeAgent.handle}`}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                <span className="hidden sm:inline">العودة</span>
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-[#7a6a5a] dark:text-[#9a8a7a] hover:text-[#5c4a3a] dark:hover:text-[#c4a574] hover:bg-[#f0ebe5] dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
              title={resolvedTheme === 'dark' ? 'وضع النهار' : 'وضع الليل'}
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            {/* Export Button */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="hidden sm:flex p-2 text-[#7a6a5a] hover:text-[#5c4a3a] hover:bg-[#f0ebe5] rounded-lg transition-colors" title="تصدير المحادثة">
                  <Download className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="dark:bg-[#1a1a1a] dark:border-[#333]">
                <DialogHeader>
                  <DialogTitle className="text-[#5c4a3a] dark:text-[#c4a574]">تصدير المحادثة</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                  <button 
                    onClick={() => exportChat('txt')}
                    className="flex items-center gap-3 p-4 bg-[#f5f3f0] dark:bg-[#2a2a2a] hover:bg-[#ebe7e0] dark:hover:bg-[#333] rounded-xl transition-colors text-right"
                  >
                    <FileText className="h-5 w-5 text-[#5c4a3a] dark:text-[#c4a574]" />
                    <div>
                      <p className="font-medium text-[#5c4a3a] dark:text-[#e8e4df]">تصدير كنص</p>
                      <p className="text-xs text-[#7a6a5a] dark:text-[#9a8a7a]">TXT format</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => exportChat('json')}
                    className="flex items-center gap-3 p-4 bg-[#f5f3f0] dark:bg-[#2a2a2a] hover:bg-[#ebe7e0] dark:hover:bg-[#333] rounded-xl transition-colors text-right"
                  >
                    <FileEdit className="h-5 w-5 text-[#5c4a3a] dark:text-[#c4a574]" />
                    <div>
                      <p className="font-medium text-[#5c4a3a] dark:text-[#e8e4df]">تصدير كـ JSON</p>
                      <p className="text-xs text-[#7a6a5a] dark:text-[#9a8a7a]">JSON format</p>
                    </div>
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Share Button */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <button className="hidden sm:flex p-2 text-[#7a6a5a] hover:text-[#5c4a3a] hover:bg-[#f0ebe5] rounded-lg transition-colors" title="مشاركة">
                  <Share2 className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="dark:bg-[#1a1a1a] dark:border-[#333]">
                <DialogHeader>
                  <DialogTitle className="text-[#5c4a3a] dark:text-[#c4a574]">مشاركة الاستشارة</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <p className="text-sm text-[#7a6a5a] dark:text-[#9a8a7a] mb-4">انسخ الرابط لمشاركة هذه الاستشارة مع الآخرين</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/legal/${agentId}?shared=true`}
                      className="flex-1 p-3 bg-[#f5f3f0] dark:bg-[#2a2a2a] border border-[#e0dcd5] dark:border-[#333] rounded-xl text-sm text-[#5c4a3a] dark:text-[#e8e4df]"
                    />
                    <Button onClick={shareConsultation} className="bg-[#5c4a3a] hover:bg-[#4a3a2a] text-white">
                      نسخ
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#5c4a3a]">
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

        {/* Content Area - Responsive Three Columns */}
        <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
          {/* Document View (Center) - Responsive */}
          <div className="hidden lg:flex w-5/12 flex-col border-l border-[#e0dcd5] dark:border-[#333]">
            {/* Upload Bar - Enhanced with Drag & Drop */}
            <div 
              className={`bg-white p-4 border-b border-[#e0dcd5] transition-all duration-300 ${isDragOver ? 'bg-[#f0f9ff] border-blue-400' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {selectedDoc ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#f0ebe5] to-[#e8e4df] rounded-xl flex items-center justify-center shadow-sm">
                    <FileText className="h-6 w-6 text-[#5c4a3a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#5c4a3a] truncate">{selectedDoc.name}</p>
                    <p className="text-xs text-[#7a6a5a] mt-0.5">PDF • 2.4 MB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] h-6">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1"></span>
                      {selectedDoc.analysis?.confidence || 98}% دقة
                    </Badge>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-[#7a6a5a] hover:text-[#5c4a3a] hover:bg-[#f0ebe5] rounded-lg transition-colors"
                      title="استبدل الوثيقة"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                    isDragOver 
                      ? 'border-[#5c4a3a] bg-[#faf8f5] scale-[1.02] shadow-lg' 
                      : 'border-[#d0ccc5] hover:border-[#c4a574] hover:bg-[#faf8f5]'
                  }`}
                >
                  <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDragOver ? 'bg-[#5c4a3a] scale-110' : 'bg-[#f0ebe5]'
                  }`}>
                    <Upload className={`h-7 w-7 transition-colors ${isDragOver ? 'text-white' : 'text-[#9a8a7a]'}`} />
                  </div>
                  <p className="text-sm font-medium text-[#5c4a3a] mb-1">
                    {isDragOver ? 'أفلت الملف هنا' : 'رفع وثيقة قانونية'}
                  </p>
                  <p className="text-xs text-[#9a8a7a]">PDF, DOC, DOCX, TXT</p>
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

          {/* Chat Panel (Right) - Full width on mobile */}
          <div className="flex-1 lg:w-3/12 flex flex-col bg-white dark:bg-[#1a1a1a] relative overflow-hidden">
            
            {/* Chat History Sidebar */}
            <div className={`absolute inset-0 bg-white dark:bg-[#1a1a1a] z-20 transition-transform duration-300 ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="p-4 border-b border-[#e0dcd5] dark:border-[#333] flex items-center justify-between bg-gradient-to-r from-[#faf8f5] to-white dark:from-[#1a1a1a] dark:to-[#1a1a1a]">
                <h3 className="text-sm font-bold text-[#5c4a3a] dark:text-[#c4a574] flex items-center gap-2">
                  <HistoryIcon className="h-4 w-4" />
                  سجل المحادثات
                </h3>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 text-[#7a6a5a] hover:text-[#5c4a3a] hover:bg-[#f0ebe5] rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {/* Mock Chat History */}
                  {[
                    { title: 'استشارة عقد كراء', date: '2024-01-15', preview: 'ما مدى قانونية بند...' },
                    { title: 'مراجعة عقد عمل', date: '2024-01-14', preview: 'هل يمكن إضافة شرط...' },
                    { title: 'استفسار قانوني', date: '2024-01-13', preview: 'ما هي إجراءات التقاضي...' },
                    { title: 'صياغة عقد تجاري', date: '2024-01-12', preview: 'أحتاج صياغة عقد...' },
                  ].map((chat, idx) => (
                    <button
                      key={idx}
                      className="w-full text-right p-3 bg-[#f5f3f0] hover:bg-[#ebe7e0] rounded-xl transition-all group"
                    >
                      <p className="text-sm font-medium text-[#5c4a3a] group-hover:text-[#4a3a2a]">{chat.title}</p>
                      <p className="text-xs text-[#9a8a7a] mt-1 line-clamp-1">{chat.preview}</p>
                      <p className="text-[10px] text-[#c4a574] mt-2">{chat.date}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Header - Enhanced */}
            <div className="px-4 py-4 border-b border-[#e0dcd5] bg-gradient-to-r from-[#faf8f5] to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-[#c4a574] ring-offset-2 ring-offset-white">
                      <AvatarFallback className="bg-gradient-to-br from-[#5c4a3a] to-[#7a6a5a] text-white font-bold text-sm">
                        {activeAgent.display_name?.slice(0, 2) || 'L'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#5c4a3a]">{activeAgent.display_name || 'المستشار القانوني'}</p>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] h-5 px-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1 animate-pulse"></span>
                        متصل
                      </Badge>
                    </div>
                    <p className="text-xs text-[#7a6a5a] truncate max-w-[150px]">{activeAgent.role || 'متخصص في العقود والاستشارات'}</p>
                  </div>
                </div>
                
                {/* Quick Status Icons */}
                <div className="flex items-center gap-1">
                  <button className="p-2 text-[#7a6a5a] hover:text-[#5c4a3a] hover:bg-[#f0ebe5] rounded-lg transition-colors" title="معلومات">
                    <Info className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-[#7a6a5a] hover:text-[#5c4a3a] hover:bg-[#f0ebe5] rounded-lg transition-colors" title="الإعدادات">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2 rounded-lg transition-colors ${showHistory ? 'text-[#5c4a3a] bg-[#f0ebe5]' : 'text-[#7a6a5a] hover:text-[#5c4a3a] hover:bg-[#f0ebe5]'}`}
                    title="سجل المحادثات"
                  >
                    <HistoryIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages.length === 0 && !sending ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#5c4a3a] to-[#7a6a5a] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm text-[#7a6a5a] mb-4 font-medium">كيف يمكنني مساعدتك في هذا العقد؟</p>
                    <div className="space-y-2">
                      {['ما مدى قانونية بند الزيادة السنوية؟', 'هل يمكن تعديل مدة العقد؟', 'ما حقوق المكتري في حال الإخلاء؟'].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(q)}
                          className="block w-full text-right px-4 py-3 text-xs text-[#5c4a3a] bg-white border border-[#e0dcd5] rounded-xl hover:bg-[#f5f3f0] hover:border-[#c4a574] transition-all duration-200 shadow-sm hover:shadow-md group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform inline-block">{q}</span>
                          <ChevronLeft className="h-3 w-3 inline-block mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((m, index) => (
                      <div 
                        key={m.id} 
                        className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-fadeIn`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <Avatar className="h-8 w-8 shrink-0 shadow-sm">
                          <AvatarFallback className={`${m.role === 'user' ? 'bg-[#d0ccc5]' : 'bg-gradient-to-br from-[#5c4a3a] to-[#7a6a5a] text-white'} text-[10px]`}>
                            {m.role === 'user' ? <User className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`group relative max-w-[85%] ${m.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                          <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm transition-shadow hover:shadow-md ${
                            m.role === 'user' 
                              ? 'bg-gradient-to-br from-[#5c4a3a] to-[#4a3a2a] text-white rounded-tr-sm' 
                              : 'bg-white text-[#4a3a2a] rounded-tl-sm border border-[#e8e4df]'
                          }`}>
                            <div className="leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                              {m.content.split('\n').map((line, i) => (
                                <span key={i}>
                                  {line.startsWith('**') && line.endsWith('**') ? (
                                    <strong className="text-inherit">{line.slice(2, -2)}</strong>
                                  ) : line.startsWith('- ') ? (
                                    <span className="flex items-start gap-2">
                                      <span className="mt-2 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                                      <span>{line.slice(2)}</span>
                                    </span>
                                  ) : line.match(/^\d+\./) ? (
                                    <span className="flex items-start gap-2">
                                      <span className="font-bold flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
                                      <span>{line.replace(/^\d+\.\s*/, '')}</span>
                                    </span>
                                  ) : (
                                    line
                                  )}
                                  {i < m.content.split('\n').length - 1 && <br />}
                                </span>
                              ))}
                            </div>
                            
                            {/* Message Actions */}
                            <div className={`flex items-center gap-1 mt-2 pt-2 border-t ${m.role === 'user' ? 'border-white/20' : 'border-[#e8e4df]'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                              <button 
                                onClick={() => navigator.clipboard.writeText(m.content)}
                                className={`p-1.5 rounded-lg ${m.role === 'user' ? 'hover:bg-white/20' : 'hover:bg-[#f5f3f0]'} transition-colors`}
                                title="نسخ"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              <button 
                                className={`p-1.5 rounded-lg ${m.role === 'user' ? 'hover:bg-white/20' : 'hover:bg-[#f5f3f0]'} transition-colors`}
                                title="حفظ"
                              >
                                <Bookmark className="h-3 w-3" />
                              </button>
                              <span className={`text-[10px] mr-auto ${m.role === 'user' ? 'text-white/60' : 'text-[#9a8a7a]'}`}>
                                {new Date(m.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {sending && (
                      <div className="flex gap-3 animate-fadeIn">
                        <Avatar className="h-8 w-8 shrink-0 shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-[#5c4a3a] to-[#7a6a5a] text-white text-[10px]">
                            <Scale className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-2xl rounded-tl-sm border border-[#e8e4df] px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-[#5c4a3a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-[#5c4a3a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-[#5c4a3a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-[#e0dcd5] bg-gradient-to-b from-white to-[#faf8f5]">
              {/* Quick Actions */}
              {messages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => setInput('صياغة عقد جديد')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#5c4a3a]/10 hover:bg-[#5c4a3a]/20 text-[#5c4a3a] rounded-full text-[11px] font-medium transition-colors"
                  >
                    <FileEdit className="h-3 w-3" />
                    صياغة عقد
                  </button>
                  <button
                    onClick={() => setInput('تحليل قانوني للمخاطر')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full text-[11px] font-medium transition-colors"
                  >
                    <AlertCircle className="h-3 w-3" />
                    تحليل المخاطر
                  </button>
                  <button
                    onClick={() => setInput('اقتراحات تحسين العقد')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-[11px] font-medium transition-colors"
                  >
                    <Lightbulb className="h-3 w-3" />
                    اقتراحات
                  </button>
                  <button
                    onClick={() => setInput('المراجع القانونية')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-full text-[11px] font-medium transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    مراجع قانونية
                  </button>
                </div>
              )}
              
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="سؤال قانوني..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    disabled={sending}
                    className="min-h-[70px] resize-none text-sm border-[#d0ccc5] focus:border-[#c4a574] focus:ring-2 focus:ring-[#c4a574]/20 pr-16 rounded-xl shadow-sm"
                    dir="rtl"
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-1">
                    <button
                      onClick={() => {
                        toast.info('التعرف على الصوت', {
                          description: 'انقر على الميكروفون وتحدث',
                        })
                      }}
                      className="p-1.5 text-[#9a8a7a] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="إدخال صوتي"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 text-[#9a8a7a] hover:text-[#5c4a3a] hover:bg-[#f5f3f0] rounded-lg transition-colors"
                      title="رفع وثيقة"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button 
                    onClick={handleSend} 
                    disabled={!input.trim() || sending} 
                    className="bg-gradient-to-br from-[#5c4a3a] to-[#4a3a2a] hover:from-[#4a3a2a] hover:to-[#3d2d1d] h-10 px-3 shadow-md hover:shadow-lg transition-all rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Bottom Actions */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2 text-[#7a6a5a] hover:text-[#5c4a3a] hover:bg-[#f0ebe5]">
                    <Bookmark className="h-3 w-3 ml-1" />
                    حفظ المحادثة
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2 text-[#7a6a5a] hover:text-[#5c4a3a] hover:bg-[#f0ebe5]">
                    <HistoryIcon className="h-3 w-3 ml-1" />
                    السجل
                  </Button>
                </div>
                <span className="text-[10px] text-[#9a8a7a]">
                  Enter للإرسال
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
