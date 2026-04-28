import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowRight, Upload, Download, Users, MessageCircle, FileSpreadsheet, CheckCircle, Copy, Phone, FileDown, MessageSquare, Megaphone, Send, Calendar, Clock, BarChart3, Play, Pause, RotateCcw, Trash2, Globe, Link2, ExternalLink, Search, Loader2, Filter, Building2, Briefcase, Plus, X, MapPin } from 'lucide-react'

interface Contact {
  id: number
  name: string
  phone: string
  group?: string
  status?: string
  source?: string
  lastMessage?: string
  messageCount?: number
  sent?: boolean
  delivered?: boolean
}

interface Campaign {
  id: number
  name: string
  message: string
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused'
  createdAt: string
  scheduledAt: string | null
  recipients: number
  sent: number
  delivered: number
  failed: number
  targetGroups: string[]
  recipientsList: Contact[]
}

export default function WhatsAppTools() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('import')
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: 'أحمد محمد', phone: '+966501234567', group: 'عملاء', status: 'نشط' },
    { id: 2, name: 'سارة علي', phone: '+966509876543', group: 'موردين', status: 'نشط' },
    { id: 3, name: 'خالد عمر', phone: '+966505555555', group: 'عملاء', status: 'غير نشط' },
  ])
  const [csvText, setCsvText] = useState('')
  const [messageText, setMessageText] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [chatText, setChatText] = useState('')
  const [extractedNumbers, setExtractedNumbers] = useState<Contact[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [newCampaignMessage, setNewCampaignMessage] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [scheduleDate, setScheduleDate] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Group links extraction state
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [websiteHtml, setWebsiteHtml] = useState('')
  const [extractedLinks, setExtractedLinks] = useState<GroupLink[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState('')

  // Active members extraction state
  const [groupChatText, setGroupChatText] = useState('')
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([])
  const [activityThreshold, setActivityThreshold] = useState(3)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Number filter state
  const [numbersToFilter, setNumbersToFilter] = useState('')
  const [filteredNumbers, setFilteredNumbers] = useState<FilteredNumber[]>([])
  const [filterOptions, setFilterOptions] = useState({
    removeDuplicates: true,
    removeInvalid: true,
    normalizeFormat: true,
    targetCountry: '966',
    minLength: 10,
    maxLength: 15,
  })
  const [filterStats, setFilterStats] = useState({ total: 0, valid: 0, invalid: 0, duplicates: 0, cleaned: 0 })

  // Number generator state
  const [generatorCountry, setGeneratorCountry] = useState('966')
  const [generatedNumbers, setGeneratedNumbers] = useState<string[]>([])
  const [generatorCount, setGeneratorCount] = useState(10)
  const [numberPrefix, setNumberPrefix] = useState('')
  const [formattedNumbers, setFormattedNumbers] = useState<{original: string, formatted: string, valid: boolean}[]>([])

  // Commercial search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [commercialKeywords, setCommercialKeywords] = useState([
    'شركة', 'مؤسسة', 'متجر', 'محل', 'مصنع', 'وكالة', 'مكتب', 'مركز',
    'مطعم', 'كافيه', 'صيدلية', 'مستشفى', 'عيادة', 'مخبز', 'سوق',
    'فندق', 'شاليه', 'استراحة', 'صالون', 'جيم', 'نادي', 'مدرسة',
    'Company', 'Store', 'Shop', 'Agency', 'Office', 'Center', 'Restaurant',
    'Cafe', 'Pharmacy', 'Hotel', 'Gym', 'Market', 'Business', 'Trade'
  ])
  const [detectedCommercial, setDetectedCommercial] = useState<Contact[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Social media extraction state
  const [socialText, setSocialText] = useState('')
  const [extractedSocial, setExtractedSocial] = useState<SocialProfile[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  // Group joiner state
  const [groupLinksToJoin, setGroupLinksToJoin] = useState<GroupJoinItem[]>([])
  const [newGroupLink, setNewGroupLink] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [joinDelay, setJoinDelay] = useState(3)
  const [isJoining, setIsJoining] = useState(false)
  const [currentJoinIndex, setCurrentJoinIndex] = useState(0)

  // Google Maps search state
  const [mapsSearchQuery, setMapsSearchQuery] = useState('')
  const [mapsLocation, setMapsLocation] = useState('الرياض')
  const [mapsResults, setMapsResults] = useState<MapsBusiness[]>([])
  const [isSearchingMaps, setIsSearchingMaps] = useState(false)
  const [mapsApiKey, setMapsApiKey] = useState('')

  // WhatsApp group search state
  const [groupSearchCategory, setGroupSearchCategory] = useState('تجاري')
  const [foundGroups, setFoundGroups] = useState<WhatsAppGroup[]>([])
  const [isSearchingGroups, setIsSearchingGroups] = useState(false)
  const [groupSearchQuery, setGroupSearchQuery] = useState('')

  // Chatbot auto-reply state
  const [chatbotEnabled, setChatbotEnabled] = useState(false)
  const [chatbotRules, setChatbotRules] = useState<ChatbotRule[]>([])
  const [newRuleKeyword, setNewRuleKeyword] = useState('')
  const [newRuleResponse, setNewRuleResponse] = useState('')
  const [chatbotTestMessage, setChatbotTestMessage] = useState('')
  const [chatbotTestResponse, setChatbotTestResponse] = useState('')
  const [chatbotWelcomeMessage, setChatbotWelcomeMessage] = useState('مرحباً! 👋 أنا بوت الرد الآلي. كيف يمكنني مساعدتك؟')
  const [chatbotDefaultResponse, setChatbotDefaultResponse] = useState('عذراً، لم أفهم طلبك. يمكنك التواصل معنا مباشرة للمساعدة.')

  // Handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setCsvText(text)
        parseCSV(text)
      }
      reader.readAsText(file)
    }
  }

  // Parse CSV text
  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const newContacts: Contact[] = []
    
    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('name')) return // Skip header
      const [name, phone, group = 'عام'] = line.split(',').map(s => s.trim())
      if (name && phone) {
        newContacts.push({
          id: Date.now() + index,
          name,
          phone,
          group,
          status: 'جديد'
        })
      }
    })
    
    if (newContacts.length > 0) {
      setContacts(prev => [...prev, ...newContacts])
    }
  }

  // Export contacts to CSV
  const exportToCSV = () => {
    const headers = 'Name,Phone,Group,Status\n'
    const rows = contacts.map(c => `${c.name},${c.phone},${c.group},${c.status}`).join('\n')
    const csv = headers + rows
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `whatsapp_contacts_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Generate message template
  const generateMessage = (type: string) => {
    const templates: Record<string, string> = {
      welcome: 'مرحباً! 👋\nشكراً لتواصلك معنا.\nكيف يمكننا مساعدتك اليوم؟',
      followup: 'مرحباً! 🌟\nنود متابعة طلبك.\nهل تحتاج أي مساعدة إضافية؟',
      promotion: '🎉 عرض خاص!\nخصم 20% على جميع الخدمات\nلمدة محدودة!',
      reminder: '📅 تذكير:\nلديك موعد غداً الساعة 10 صباحاً',
    }
    setMessageText(templates[type] || '')
  }

  // Extract phone numbers from chat export text
  const extractNumbersFromChat = (text: string) => {
    // Saudi and international phone number patterns
    const patterns = [
      /\+966\d{8,9}/g,  // Saudi +966
      /05\d{8}/g,       // Saudi local 05
      /966\d{8,9}/g,    // Saudi without +
      /\+\d{10,15}/g,   // International
      /\d{10,11}/g,     // Generic 10-11 digits
    ]
    
    const found = new Set<string>()
    const contacts: Contact[] = []
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern) || []
      matches.forEach(num => {
        // Normalize number
        let normalized = num
        if (num.startsWith('05')) {
          normalized = '+966' + num.substring(1)
        } else if (num.startsWith('966') && !num.startsWith('+966')) {
          normalized = '+' + num
        }
        
        if (!found.has(normalized)) {
          found.add(normalized)
          contacts.push({
            id: Date.now() + contacts.length,
            name: `رقم ${contacts.length + 1}`,
            phone: normalized,
            group: 'مستخرج من الدردشات',
            status: 'جديد',
            source: 'chat_extract',
            messageCount: 1
          })
        }
      })
    })
    
    return contacts
  }

  // Handle chat text paste/upload
  const handleChatTextChange = (text: string) => {
    setChatText(text)
    const extracted = extractNumbersFromChat(text)
    setExtractedNumbers(extracted)
  }

  // Export extracted numbers to CSV
  const exportExtractedNumbers = () => {
    const headers = 'Name,Phone,Group,Status,Source\n'
    const rows = extractedNumbers.map(c => `${c.name},${c.phone},${c.group},${c.status},extracted`).join('\n')
    const csv = headers + rows
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `extracted_numbers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Campaign functions
  const createCampaign = () => {
    if (!newCampaignName.trim() || !newCampaignMessage.trim()) return
    
    const targetContacts = selectedGroups.length > 0
      ? contacts.filter(c => selectedGroups.includes(c.group || 'عام'))
      : contacts

    const campaign: Campaign = {
      id: Date.now(),
      name: newCampaignName,
      message: newCampaignMessage,
      status: 'draft',
      createdAt: new Date().toISOString(),
      scheduledAt: scheduleDate || null,
      recipients: targetContacts.length,
      sent: 0,
      delivered: 0,
      failed: 0,
      targetGroups: selectedGroups,
      recipientsList: targetContacts.map(c => ({ ...c, sent: false, delivered: false }))
    }
    
    setCampaigns(prev => [campaign, ...prev])
    setNewCampaignName('')
    setNewCampaignMessage('')
    setSelectedGroups([])
    setScheduleDate('')
    setActiveCampaign(campaign)
  }

  const sendCampaign = async (campaignId: number) => {
    setIsSending(true)
    const campaign = campaigns.find(c => c.id === campaignId)
    if (!campaign) return

    // Update status to sending
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, status: 'sending' } : c
    ))

    // Simulate sending messages
    const total = campaign.recipientsList.length
    for (let i = 0; i < total; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCampaigns(prev => prev.map(c => {
        if (c.id !== campaignId) return c
        const updatedList = [...c.recipientsList]
        updatedList[i] = { ...updatedList[i], sent: true, delivered: Math.random() > 0.1 }
        
        return {
          ...c,
          sent: i + 1,
          delivered: updatedList.filter(r => r.delivered).length,
          failed: updatedList.filter(r => r.sent && !r.delivered).length,
          recipientsList: updatedList
        }
      }))
    }

    // Mark as completed
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, status: 'completed' } : c
    ))
    setIsSending(false)
  }

  const deleteCampaign = (campaignId: number) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId))
    if (activeCampaign?.id === campaignId) {
      setActiveCampaign(null)
    }
  }

  const duplicateCampaign = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now(),
      name: campaign.name + ' (نسخة)',
      status: 'draft',
      createdAt: new Date().toISOString(),
      sent: 0,
      delivered: 0,
      failed: 0,
      recipientsList: campaign.recipientsList.map(r => ({ ...r, sent: false, delivered: false }))
    }
    setCampaigns(prev => [newCampaign, ...prev])
    setActiveCampaign(newCampaign)
  }

  // Group links extraction functions
  interface GroupLink {
    id: number
    url: string
    title?: string
    source: string
    type: 'whatsapp' | 'wame'
  }

  const extractGroupLinks = (html: string, source: string): GroupLink[] => {
    const links: GroupLink[] = []
    const seen = new Set<string>()
    
    // WhatsApp group invite patterns
    const patterns = [
      /https?:\/\/chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9]+)/gi,
      /https?:\/\/wa\.me\/joinchat\/([a-zA-Z0-9]+)/gi,
    ]
    
    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(html)) !== null) {
        const url = match[0]
        if (!seen.has(url)) {
          seen.add(url)
          links.push({
            id: Date.now() + links.length,
            url,
            source,
            type: url.includes('chat.whatsapp.com') ? 'whatsapp' : 'wame'
          })
        }
      }
    })
    
    return links
  }

  const fetchWebsite = async () => {
    if (!websiteUrl.trim()) return
    
    setIsExtracting(true)
    setExtractionError('')
    setExtractedLinks([])
    
    try {
      // Note: In production, this would need a backend proxy due to CORS
      // For now, we simulate or use the pasted HTML
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(websiteUrl)}`)
      const data = await response.json()
      
      if (data.contents) {
        setWebsiteHtml(data.contents)
        const links = extractGroupLinks(data.contents, websiteUrl)
        setExtractedLinks(links)
        
        if (links.length === 0) {
          setExtractionError('لم يتم العثور على روابط مجموعات واتساب في هذه الصفحة')
        }
      } else {
        setExtractionError('تعذر جلب محتوى الصفحة. جرب لصق HTML يدوياً.')
      }
    } catch (error) {
      setExtractionError('خطأ في الاتصال. يمكنك لصق HTML الصفحة يدوياً في الأسفل.')
    } finally {
      setIsExtracting(false)
    }
  }

  const extractFromPastedHtml = () => {
    if (!websiteHtml.trim()) return
    
    const links = extractGroupLinks(websiteHtml, 'HTML manually pasted')
    setExtractedLinks(links)
    
    if (links.length === 0) {
      setExtractionError('لم يتم العثور على روابط مجموعات واتساب في النص الملصق')
    } else {
      setExtractionError('')
    }
  }

  const exportGroupLinks = () => {
    const text = extractedLinks.map(l => l.url).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `whatsapp_groups_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
  }

  // Active members extraction functions
  interface ActiveMember {
    id: number
    name: string
    phone?: string
    messageCount: number
    lastActivity: string
    isActive: boolean
    activityScore: number
  }

  const analyzeGroupChat = () => {
    if (!groupChatText.trim()) return
    
    setIsAnalyzing(true)
    
    // Parse chat text to extract member activity
    const memberMap = new Map<string, { name: string, messages: string[], lastSeen: string }>()
    
    // WhatsApp chat export pattern: [date, time] name: message
    const lines = groupChatText.split('\n')
    
    lines.forEach(line => {
      // Match patterns like: [4/27/26, 10:30 AM] John: Hello everyone
      // Or: 4/27/26, 10:30 AM - John: Hello
      const patterns = [
        /\[?\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}[\s,]+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\]?\s*[-–]?\s*([^:]+):\s*(.+)/i,
        /\[?\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}[\s,]+\d{1,2}:\d{2}(?::\d{2})?\]?\s*[-–]?\s*([^\d\W][^:]+):\s*(.+)/,
      ]
      
      for (const pattern of patterns) {
        const match = line.match(pattern)
        if (match) {
          const name = match[1].trim()
          const message = match[2].trim()
          
          // Extract phone if present in message or name
          const phoneMatch = (name + ' ' + message).match(/\+?\d{10,15}/)
          
          if (!memberMap.has(name)) {
            memberMap.set(name, { name, messages: [], lastSeen: line.substring(0, 20) })
          }
          
          const member = memberMap.get(name)!
          member.messages.push(message)
          member.lastSeen = line.substring(0, Math.min(line.indexOf(':') || 20, 30))
          
          break
        }
      }
    })
    
    // Convert to active members array
    const members: ActiveMember[] = Array.from(memberMap.entries()).map(([name, data], index) => {
      const phoneMatch = groupChatText.match(new RegExp(`${name}[^\n]*?(\+?\d{10,15})`))
      const messageCount = data.messages.length
      
      return {
        id: index + 1,
        name,
        phone: phoneMatch?.[1] || undefined,
        messageCount,
        lastActivity: data.lastSeen,
        isActive: messageCount >= activityThreshold,
        activityScore: Math.min(messageCount * 10, 100)
      }
    })
    
    // Sort by activity (message count)
    members.sort((a, b) => b.messageCount - a.messageCount)
    
    setActiveMembers(members)
    setIsAnalyzing(false)
  }

  const exportActiveMembers = () => {
    const activeOnly = activeMembers.filter(m => m.isActive)
    const headers = 'Name,Phone,MessageCount,LastActivity,ActivityScore\n'
    const rows = activeOnly.map(m => `${m.name},${m.phone || ''},${m.messageCount},${m.lastActivity},${m.activityScore}`).join('\n')
    const csv = headers + rows
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `active_members_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const addActiveToContacts = () => {
    const activeOnly = activeMembers.filter(m => m.isActive)
    const newContacts = activeOnly.map((m, i) => ({
      id: Date.now() + i,
      name: m.name,
      phone: m.phone || `+9660000000${i}`,
      group: 'أعضاء نشطين - مستخرج',
      status: 'نشط'
    }))
    
    setContacts(prev => [...prev, ...newContacts])
    alert(`تم إضافة ${newContacts.length} عضو نشط إلى جهات الاتصال`)
  }

  // Number filter functions
  interface FilteredNumber {
    id: number
    original: string
    cleaned: string
    normalized: string
    country: string
    isValid: boolean
    status: 'valid' | 'invalid' | 'duplicate' | 'cleaned'
    reason?: string
  }

  const parsePhoneNumber = (input: string): { country: string, number: string, isValid: boolean } => {
    let cleaned = input.replace(/[^\d+]/g, '').trim()
    if (cleaned.startsWith('00')) cleaned = '+' + cleaned.substring(2)
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) cleaned = '+' + filterOptions.targetCountry + cleaned.substring(1)
      else cleaned = '+' + filterOptions.targetCountry + cleaned
    }
    const match = cleaned.match(/^\+(\d{1,3})(\d+)$/)
    if (!match) return { country: '', number: cleaned, isValid: false }
    const country = match[1]
    const number = match[2]
    const isValid = number.length >= filterOptions.minLength - 3 && number.length <= filterOptions.maxLength - 3
    return { country, number: cleaned, isValid }
  }

  const getCountryName = (code: string): string => {
    const countries: Record<string, string> = {
      '966': '🇸🇦 السعودية', '971': '🇦🇪 الإمارات', '974': '🇶🇦 قطر',
      '965': '🇰🇼 الكويت', '973': '🇧🇭 البحرين', '968': '🇴🇲 عمان',
      '962': '🇯🇴 الأردن', '963': '🇸🇾 سوريا', '961': '🇱🇧 لبنان',
      '20': '🇪🇬 مصر', '212': '🇲🇦 المغرب', '216': '🇹🇳 تونس',
      '1': '🇺🇸 أمريكا', '44': '🇬🇧 بريطانيا', '49': '🇩🇪 ألمانيا',
    }
    return countries[code] || `🌐 +${code}`
  }

  const filterNumbers = () => {
    if (!numbersToFilter.trim()) return
    const lines = numbersToFilter.split(/[\n,]+/).map(l => l.trim()).filter(l => l)
    const seen = new Set<string>()
    const results: FilteredNumber[] = []
    let id = 1
    let stats = { total: lines.length, valid: 0, invalid: 0, duplicates: 0, cleaned: 0 }

    lines.forEach(line => {
      const original = line
      const parsed = parsePhoneNumber(line)
      let status: FilteredNumber['status'] = 'valid'
      let reason = ''

      if (filterOptions.removeDuplicates && seen.has(parsed.number)) {
        status = 'duplicate'
        reason = 'رقم مكرر'
        stats.duplicates++
      } else if (filterOptions.removeInvalid && !parsed.isValid) {
        status = 'invalid'
        reason = 'رقم غير صالح'
        stats.invalid++
      } else if (parsed.number !== original && filterOptions.normalizeFormat) {
        status = 'cleaned'
        stats.cleaned++
        seen.add(parsed.number)
      } else {
        stats.valid++
        seen.add(parsed.number)
      }

      results.push({ id: id++, original, cleaned: parsed.number, normalized: parsed.number, country: parsed.country, isValid: parsed.isValid, status, reason })
    })

    setFilterStats(stats)
    setFilteredNumbers(results)
  }

  const exportFilteredNumbers = () => {
    const validNumbers = filteredNumbers.filter(n => n.status === 'valid' || n.status === 'cleaned')
    const text = validNumbers.map(n => n.normalized).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `filtered_numbers_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
  }

  const addFilteredToContacts = () => {
    const validNumbers = filteredNumbers.filter(n => n.status === 'valid' || n.status === 'cleaned')
    const newContacts = validNumbers.map((n, i) => ({
      id: Date.now() + i, name: `جهة ${i + 1}`, phone: n.normalized, group: 'أرقام مفلترة', status: 'نشط' as const,
    }))
    setContacts(prev => [...prev, ...newContacts])
    alert(`تم إضافة ${newContacts.length} رقم إلى جهات الاتصال`)
  }

  // Number generator functions
  const generateRandomNumbers = () => {
    const countryCodes: Record<string, { code: string, prefix: string, length: number }> = {
      '966': { code: '+966', prefix: '5', length: 8 },
      '971': { code: '+971', prefix: '5', length: 8 },
      '974': { code: '+974', prefix: '', length: 8 },
      '965': { code: '+965', prefix: '', length: 8 },
      '20': { code: '+20', prefix: '1', length: 10 },
      '962': { code: '+962', prefix: '7', length: 8 },
    }

    const config = countryCodes[generatorCountry] || countryCodes['966']
    const numbers: string[] = []

    for (let i = 0; i < generatorCount; i++) {
      let number = config.prefix
      for (let j = 0; j < config.length - config.prefix.length; j++) {
        number += Math.floor(Math.random() * 10)
      }
      numbers.push(`${config.code}${number}`)
    }

    setGeneratedNumbers(numbers)
  }

  const formatNumbersList = (input: string) => {
    const lines = input.split(/[\n,]+/).map(l => l.trim()).filter(l => l)
    const country = generatorCountry

    const formatted = lines.map(line => {
      let cleaned = line.replace(/[^\d+]/g, '').trim()
      
      // Convert 00 to +
      if (cleaned.startsWith('00')) {
        cleaned = '+' + cleaned.substring(2)
      }
      
      // If no +, add country code
      if (!cleaned.startsWith('+')) {
        if (cleaned.startsWith('0')) {
          cleaned = '+' + country + cleaned.substring(1)
        } else {
          cleaned = '+' + country + cleaned
        }
      }

      // Validate
      const valid = /^\+\d{10,15}$/.test(cleaned)

      return { original: line, formatted: cleaned, valid }
    })

    setFormattedNumbers(formatted)
  }

  const exportGeneratedNumbers = () => {
    const text = generatedNumbers.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `generated_numbers_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
  }

  const exportFormattedNumbers = () => {
    const valid = formattedNumbers.filter(n => n.valid)
    const text = valid.map(n => n.formatted).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `formatted_numbers_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
  }

  // Commercial search functions
  const searchCommercialNumbers = () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    
    const query = searchQuery.toLowerCase()
    const results = contacts.filter(contact => 
      contact.name.toLowerCase().includes(query) ||
      contact.phone.includes(query) ||
      (contact.group && contact.group.toLowerCase().includes(query))
    )
    
    setSearchResults(results)
    setIsSearching(false)
  }

  const detectCommercialInList = (text: string) => {
    const lines = text.split(/[\n,]+/).map(l => l.trim()).filter(l => l)
    const detected: Contact[] = []
    
    lines.forEach((line, index) => {
      // Check if line contains commercial keywords
      const isCommercial = commercialKeywords.some(keyword => 
        line.toLowerCase().includes(keyword.toLowerCase())
      )
      
      // Try to extract phone number
      const phoneMatch = line.match(/\+?\d{10,15}/)
      const nameMatch = line.replace(/\+?\d{10,15}/, '').trim()
      
      if (phoneMatch || isCommercial) {
        detected.push({
          id: Date.now() + index,
          name: nameMatch || `جهة تجارية ${index + 1}`,
          phone: phoneMatch ? phoneMatch[0] : line,
          group: isCommercial ? 'تجاري - مكتشف' : 'غير مصنف',
          status: 'نشط'
        })
      }
    })
    
    setDetectedCommercial(detected)
  }

  const exportCommercialNumbers = () => {
    const commercial = detectedCommercial.length > 0 ? detectedCommercial : searchResults
    const headers = 'Name,Phone,Group,Type\n'
    const rows = commercial.map(c => `${c.name},${c.phone},${c.group},Commercial`).join('\n')
    const csv = headers + rows
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `commercial_numbers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Social media extraction functions
  interface SocialProfile {
    id: number
    platform: string
    username: string
    url: string
    displayName?: string
    bio?: string
    followers?: string
    isVerified?: boolean
  }

  const extractSocialMedia = (text: string) => {
    const profiles: SocialProfile[] = []
    const seen = new Set<string>()
    let id = 1

    // Instagram patterns
    const instagramPatterns = [
      /instagram\.com\/([a-zA-Z0-9._]+)/gi,
      /@[a-zA-Z0-9._]+\s*\(?(?:IG|Insta|انستا|انستجرام)?\)?/gi,
      /IG:\s*@?([a-zA-Z0-9._]+)/gi,
      /Insta:\s*@?([a-zA-Z0-9._]+)/gi,
    ]

    // Twitter/X patterns
    const twitterPatterns = [
      /twitter\.com\/([a-zA-Z0-9_]+)/gi,
      /x\.com\/([a-zA-Z0-9_]+)/gi,
      /@([a-zA-Z0-9_]+)\s*\(?(?:X|Twitter|تويتر)?\)?/gi,
    ]

    // Facebook patterns
    const facebookPatterns = [
      /facebook\.com\/([a-zA-Z0-9.]+)/gi,
      /fb\.com\/([a-zA-Z0-9.]+)/gi,
      /fb:\s*@?([a-zA-Z0-9.]+)/gi,
    ]

    // LinkedIn patterns
    const linkedinPatterns = [
      /linkedin\.com\/in\/([a-zA-Z0-9-]+)/gi,
      /linkedin:\s*@?([a-zA-Z0-9-]+)/gi,
    ]

    // TikTok patterns
    const tiktokPatterns = [
      /tiktok\.com\/(@[a-zA-Z0-9._]+)/gi,
      /@[a-zA-Z0-9._]+\s*\(?(?:TT|TikTok|تيك توك)?\)?/gi,
    ]

    // Snapchat patterns
    const snapchatPatterns = [
      /snapchat\.com\/add\/([a-zA-Z0-9._]+)/gi,
      /SC:\s*@?([a-zA-Z0-9._]+)/gi,
      /Snap:\s*@?([a-zA-Z0-9._]+)/gi,
    ]

    // Telegram patterns
    const telegramPatterns = [
      /t\.me\/([a-zA-Z0-9._]+)/gi,
      /telegram:\s*@?([a-zA-Z0-9._]+)/gi,
      /TG:\s*@?([a-zA-Z0-9._]+)/gi,
    ]

    const platforms = [
      { name: 'Instagram', patterns: instagramPatterns, icon: '📸', color: 'bg-pink-500' },
      { name: 'Twitter/X', patterns: twitterPatterns, icon: '🐦', color: 'bg-blue-500' },
      { name: 'Facebook', patterns: facebookPatterns, icon: '📘', color: 'bg-blue-600' },
      { name: 'LinkedIn', patterns: linkedinPatterns, icon: '💼', color: 'bg-blue-700' },
      { name: 'TikTok', patterns: tiktokPatterns, icon: '🎵', color: 'bg-black' },
      { name: 'Snapchat', patterns: snapchatPatterns, icon: '👻', color: 'bg-yellow-400' },
      { name: 'Telegram', patterns: telegramPatterns, icon: '✈️', color: 'bg-blue-400' },
    ]

    platforms.forEach(platform => {
      platform.patterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(text)) !== null) {
          let username = match[1] || match[0]
          // Clean up username
          username = username.replace(/^@/, '').trim()
          const key = `${platform.name}:${username}`
          
          if (!seen.has(key)) {
            seen.add(key)
            profiles.push({
              id: id++,
              platform: platform.name,
              username,
              url: getSocialUrl(platform.name, username),
              displayName: username,
            })
          }
        }
      })
    })

    setExtractedSocial(profiles)
  }

  const getSocialUrl = (platform: string, username: string): string => {
    const urls: Record<string, string> = {
      'Instagram': `https://instagram.com/${username}`,
      'Twitter/X': `https://x.com/${username}`,
      'Facebook': `https://facebook.com/${username}`,
      'LinkedIn': `https://linkedin.com/in/${username}`,
      'TikTok': `https://tiktok.com/@${username}`,
      'Snapchat': `https://snapchat.com/add/${username}`,
      'Telegram': `https://t.me/${username}`,
    }
    return urls[platform] || '#'
  }

  const getPlatformIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      'Instagram': '📸',
      'Twitter/X': '🐦',
      'Facebook': '📘',
      'LinkedIn': '💼',
      'TikTok': '🎵',
      'Snapchat': '👻',
      'Telegram': '✈️',
    }
    return icons[platform] || '🔗'
  }

  const getPlatformColor = (platform: string): string => {
    const colors: Record<string, string> = {
      'Instagram': 'bg-pink-500',
      'Twitter/X': 'bg-blue-500',
      'Facebook': 'bg-blue-600',
      'LinkedIn': 'bg-blue-700',
      'TikTok': 'bg-gray-900',
      'Snapchat': 'bg-yellow-400',
      'Telegram': 'bg-blue-400',
    }
    return colors[platform] || 'bg-gray-500'
  }

  const exportSocialProfiles = () => {
    const filtered = selectedPlatform === 'all' 
      ? extractedSocial 
      : extractedSocial.filter(p => p.platform === selectedPlatform)
    
    const headers = 'Platform,Username,URL\n'
    const rows = filtered.map(p => `${p.platform},${p.username},${p.url}`).join('\n')
    const csv = headers + rows
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `social_profiles_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const openAllProfiles = () => {
    const filtered = selectedPlatform === 'all' 
      ? extractedSocial 
      : extractedSocial.filter(p => p.platform === selectedPlatform)
    
    filtered.forEach((profile, index) => {
      setTimeout(() => {
        window.open(profile.url, '_blank')
      }, index * 500)
    })
  }

  // Group joiner functions
  interface GroupJoinItem {
    id: number
    name: string
    url: string
    status: 'pending' | 'joined' | 'failed' | 'skipped'
    addedAt: string
    joinedAt?: string
  }

  const addGroupLink = () => {
    if (!newGroupLink.trim()) return
    
    // Validate WhatsApp group link
    const isValidLink = /chat\.whatsapp\.com\/[a-zA-Z0-9]+/i.test(newGroupLink)
    if (!isValidLink) {
      alert('الرجاء إدخال رابط مجموعة واتساب صحيح')
      return
    }
    
    const newItem: GroupJoinItem = {
      id: Date.now(),
      name: newGroupName.trim() || `مجموعة ${groupLinksToJoin.length + 1}`,
      url: newGroupLink.trim(),
      status: 'pending',
      addedAt: new Date().toISOString(),
    }
    
    setGroupLinksToJoin(prev => [...prev, newItem])
    setNewGroupLink('')
    setNewGroupName('')
  }

  const startJoiningProcess = async () => {
    const pending = groupLinksToJoin.filter(g => g.status === 'pending')
    if (pending.length === 0) {
      alert('لا توجد مجموعات في قائمة الانتظار')
      return
    }
    
    setIsJoining(true)
    setCurrentJoinIndex(0)
    
    for (let i = 0; i < pending.length; i++) {
      const group = pending[i]
      setCurrentJoinIndex(i + 1)
      
      // Open the group link
      window.open(group.url, '_blank')
      
      // Mark as processing
      setGroupLinksToJoin(prev => prev.map(g => 
        g.id === group.id ? { ...g, status: 'joined', joinedAt: new Date().toISOString() } : g
      ))
      
      // Wait before opening next (to avoid browser popup blocking)
      if (i < pending.length - 1) {
        await new Promise(resolve => setTimeout(resolve, joinDelay * 1000))
      }
    }
    
    setIsJoining(false)
    setCurrentJoinIndex(0)
    alert('تم فتح جميع روابط المجموعات! الرجاء الانضمام يدوياً في كل تبويب')
  }

  const markAsJoined = (id: number) => {
    setGroupLinksToJoin(prev => prev.map(g => 
      g.id === id ? { ...g, status: 'joined', joinedAt: new Date().toISOString() } : g
    ))
  }

  const markAsFailed = (id: number) => {
    setGroupLinksToJoin(prev => prev.map(g => 
      g.id === id ? { ...g, status: 'failed' } : g
    ))
  }

  const removeGroupItem = (id: number) => {
    setGroupLinksToJoin(prev => prev.filter(g => g.id !== id))
  }

  const importGroupLinks = (text: string) => {
    const links = text.match(/https?:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]+/gi) || []
    const newItems = links.map((url, index) => ({
      id: Date.now() + index,
      name: `مجموعة ${groupLinksToJoin.length + index + 1}`,
      url,
      status: 'pending' as const,
      addedAt: new Date().toISOString(),
    }))
    
    setGroupLinksToJoin(prev => [...prev, ...newItems])
    alert(`تم استيراد ${newItems.length} رابط مجموعة`)
  }

  const exportGroupLinksList = () => {
    const headers = 'Name,URL,Status,AddedAt\n'
    const rows = groupLinksToJoin.map(g => `${g.name},${g.url},${g.status},${g.addedAt}`).join('\n')
    const csv = headers + rows
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `whatsapp_groups_join_list_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Google Maps functions
  interface MapsBusiness {
    id: number
    name: string
    address: string
    phone?: string
    rating?: number
    reviews?: number
    category: string
    website?: string
    placeId?: string
  }

  const searchGoogleMaps = async () => {
    if (!mapsSearchQuery.trim()) {
      alert('الرجاء إدخال نوع النشاط التجاري للبحث')
      return
    }
    setIsSearchingMaps(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    const mockResults: MapsBusiness[] = [
      { id: 1, name: `${mapsSearchQuery} الأحساء`, address: `${mapsLocation} - شارع الملك فهد`, phone: '+966501234567', rating: 4.5, reviews: 128, category: mapsSearchQuery },
      { id: 2, name: `${mapsSearchQuery} الصفوة`, address: `${mapsLocation} - حي العليا`, phone: '+966509876543', rating: 4.2, reviews: 89, category: mapsSearchQuery },
      { id: 3, name: `${mapsSearchQuery} النجمة`, address: `${mapsLocation} - شارع التحلية`, phone: '+966505555555', rating: 4.8, reviews: 256, category: mapsSearchQuery },
      { id: 4, name: `${mapsSearchQuery} الفاخرة`, address: `${mapsLocation} - حي الورود`, phone: '+966501112222', rating: 3.9, reviews: 45, category: mapsSearchQuery },
      { id: 5, name: `${mapsSearchQuery} المميزة`, address: `${mapsLocation} - طريق المطار`, phone: '+966502223333', rating: 4.6, reviews: 167, category: mapsSearchQuery },
      { id: 6, name: `${mapsSearchQuery} الذهبية`, address: `${mapsLocation} - شارع العليا العام`, phone: '+966503334444', rating: 4.1, reviews: 98, category: mapsSearchQuery },
    ]
    setMapsResults(mockResults)
    setIsSearchingMaps(false)
    if (!mapsApiKey) {
      alert('⚠️ ملاحظة: هذه نتائج تجريبية. للحصول على نتائج حقيقية، يجب إضافة Google Maps API Key.')
    }
  }

  const exportMapsResults = () => {
    const headers = 'Name,Phone,Address,Rating,Reviews,Category\n'
    const rows = mapsResults.map(b => `${b.name},${b.phone || ''},${b.address},${b.rating || ''},${b.reviews || ''},${b.category}`).join('\n')
    const csv = headers + rows
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `google_maps_results_${mapsSearchQuery}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const addMapsResultsToContacts = () => {
    const withPhone = mapsResults.filter(b => b.phone)
    const newContacts = withPhone.map((b, i) => ({
      id: Date.now() + i,
      name: b.name,
      phone: b.phone!,
      group: `خرائط جوجل - ${b.category}`,
      status: 'نشط' as const,
    }))
    setContacts(prev => [...prev, ...newContacts])
    alert(`تم إضافة ${newContacts.length} رقم من خرائط جوجل للجهات`)
  }

  const openInGoogleMaps = (query: string) => {
    const encodedQuery = encodeURIComponent(`${query} in ${mapsLocation}`)
    window.open(`https://www.google.com/maps/search/${encodedQuery}`, '_blank')
  }

  // Chatbot functions
  interface ChatbotRule {
    id: number
    keywords: string[]
    response: string
    isActive: boolean
    matchType: 'exact' | 'contains' | 'startsWith'
  }

  const addChatbotRule = () => {
    if (!newRuleKeyword.trim() || !newRuleResponse.trim()) {
      alert('الرجاء إدخال الكلمة المفتاحية والرد')
      return
    }
    const newRule: ChatbotRule = {
      id: Date.now(),
      keywords: newRuleKeyword.split(',').map(k => k.trim()).filter(k => k),
      response: newRuleResponse.trim(),
      isActive: true,
      matchType: 'contains'
    }
    setChatbotRules(prev => [...prev, newRule])
    setNewRuleKeyword('')
    setNewRuleResponse('')
  }

  const deleteRule = (id: number) => {
    setChatbotRules(prev => prev.filter(r => r.id !== id))
  }

  const testChatbot = () => {
    if (!chatbotTestMessage.trim()) return
    let response = ''
    for (const rule of chatbotRules.filter(r => r.isActive)) {
      const messageLower = chatbotTestMessage.toLowerCase()
      const hasMatch = rule.keywords.some(keyword => messageLower.includes(keyword.toLowerCase()))
      if (hasMatch) {
        response = rule.response
        break
      }
    }
    if (!response) response = chatbotDefaultResponse
    setChatbotTestResponse(response)
  }

  const loadSuggestedRules = () => {
    const suggestions = [
      { keywords: 'السعر, كم السعر, السعر كم', response: '💰 الأسعار تبدأ من 100 ريال. للتفاصيل: https://wa.me/966500000000' },
      { keywords: 'العنوان, وين الموقع, المكان', response: '📍 موقعنا: الرياض - حي العليا. خرائط: https://maps.app.goo.gl/xxx' },
      { keywords: 'مواعيد, متى تفتح, ساعات العمل', response: '🕐 نفتح يومياً من 9 صباحاً حتى 11 مساءً' },
      { keywords: 'ترحيب, هلا, مرحبا', response: '👋 أهلاً وسهلاً! كيف يمكنني مساعدتك؟' },
    ]
    const newRules = suggestions.map((s, i) => ({
      id: Date.now() + i,
      keywords: s.keywords.split(',').map(k => k.trim()),
      response: s.response,
      isActive: true,
      matchType: 'contains' as const
    }))
    setChatbotRules(newRules)
  }

  // WhatsApp group search functions
  interface WhatsAppGroup {
    id: number
    name: string
    category: string
    description: string
    memberCount: number
    link: string
    country: string
    language: string
    isNew: boolean
    addedAt: string
  }

  const searchWhatsAppGroups = async () => {
    if (!groupSearchQuery.trim() && groupSearchCategory === 'all') {
      alert('الرجاء إدخال كلمة بحث أو اختيار تصنيف')
      return
    }
    setIsSearchingGroups(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const mockGroups: WhatsAppGroup[] = [
      { id: 1, name: '💼 تجار الرياض', category: 'تجاري', description: 'مجموعة للتجار وأصحاب الأعمال في الرياض', memberCount: 1250, link: 'https://chat.whatsapp.com/ABC123DEF', country: 'السعودية', language: 'العربية', isNew: true, addedAt: '2024-01-20' },
      { id: 2, name: '📱 تسويق إلكتروني', category: 'تسويق', description: 'نصائح وتبادل خبرات في التسويق الرقمي', memberCount: 890, link: 'https://chat.whatsapp.com/GHI456JKL', country: 'السعودية', language: 'العربية', isNew: true, addedAt: '2024-01-19' },
      { id: 3, name: '🏠 عقارات جدة', category: 'عقارات', description: 'عروض وطلبات العقار في جدة', memberCount: 2100, link: 'https://chat.whatsapp.com/MNO789PQR', country: 'السعودية', language: 'العربية', isNew: false, addedAt: '2024-01-15' },
      { id: 4, name: '🍽️ مطاعم ومقاهي', category: 'مطاعم', description: 'تجار المطاعم والمقاهي', memberCount: 650, link: 'https://chat.whatsapp.com/STU012VWX', country: 'الإمارات', language: 'العربية', isNew: true, addedAt: '2024-01-21' },
      { id: 5, name: '💊 صيادلة السعودية', category: 'صحي', description: 'مجموعة للصيادلة ومندوبي المستحضرات', memberCount: 1800, link: 'https://chat.whatsapp.com/YZA345BCD', country: 'السعودية', language: 'العربية', isNew: true, addedAt: '2024-01-18' },
      { id: 6, name: '📚 تعلم الإنجليزية', category: 'تعليم', description: 'تعلم اللغة الإنجليزية مع ناطقين', memberCount: 3200, link: 'https://chat.whatsapp.com/EFG678HIJ', country: 'عالمي', language: 'إنجليزي', isNew: true, addedAt: '2024-01-22' },
      { id: 7, name: '💻 مبرمجين العرب', category: 'تقني', description: 'مبرمجين ومطورين عرب', memberCount: 4500, link: 'https://chat.whatsapp.com/KLM901NOP', country: 'عالمي', language: 'العربية', isNew: false, addedAt: '2024-01-10' },
      { id: 8, name: '🌙 إسلاميات يومية', category: 'ديني', description: 'أذكار واحاديث يومية', memberCount: 5600, link: 'https://chat.whatsapp.com/QRS234TUV', country: 'عالمي', language: 'العربية', isNew: true, addedAt: '2024-01-21' },
      { id: 9, name: '📢 وظائف الرياض', category: 'وظائف', description: 'وظائف شاغرة في الرياض', memberCount: 12000, link: 'https://chat.whatsapp.com/WXY567ZAB', country: 'السعودية', language: 'العربية', isNew: true, addedAt: '2024-01-22' },
      { id: 10, name: '🛍️ تسوق أونلاين', category: 'تسوق', description: 'عروض وتخفيضات التسوق', memberCount: 3400, link: 'https://chat.whatsapp.com/CDE890FGH', country: 'الإمارات', language: 'العربية', isNew: false, addedAt: '2024-01-12' },
    ]
    const filtered = mockGroups.filter(g => {
      const matchesQuery = !groupSearchQuery || g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) || g.description.toLowerCase().includes(groupSearchQuery.toLowerCase())
      const matchesCategory = groupSearchCategory === 'all' || g.category === groupSearchCategory
      return matchesQuery && matchesCategory
    })
    const sorted = filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    setFoundGroups(sorted)
    setIsSearchingGroups(false)
  }

  const addGroupToJoiner = (group: WhatsAppGroup) => {
    const newItem = {
      id: Date.now(),
      name: group.name,
      url: group.link,
      status: 'pending' as const,
      addedAt: new Date().toISOString(),
    }
    setGroupLinksToJoin(prev => [...prev, newItem])
    alert(`تم إضافة "${group.name}" لقائمة الانضمام`)
  }

  const exportFoundGroups = () => {
    const headers = 'Name,Category,Members,Link,Country,IsNew\n'
    const rows = foundGroups.map(g => `${g.name},${g.category},${g.memberCount},${g.link},${g.country},${g.isNew}`).join('\n')
    const csv = headers + rows
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `whatsapp_groups_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">🟢 أدوات واتساب</h1>
            <p className="text-gray-500 mt-2">إدارة جهات الاتصال، استيراد/تصدير CSV، والرسائل الجماعية</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/chat/whatsapp_tools')}>
              <MessageCircle className="w-4 h-4 ml-2" />
              الدردشة مع الوكيل
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">إجمالي جهات الاتصال</p>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">نشطين</p>
                  <p className="text-2xl font-bold">{contacts.filter(c => c.status === 'نشط').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">المجموعات</p>
                  <p className="text-2xl font-bold">{new Set(contacts.map(c => c.group)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">جاهز للإرسال</p>
                  <p className="text-2xl font-bold text-green-600">نعم</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tools Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap justify-center gap-1 w-full h-auto">
            <TabsTrigger value="import">📥 استيراد</TabsTrigger>
            <TabsTrigger value="export">📤 تصدير</TabsTrigger>
            <TabsTrigger value="extract">📱 أرقام</TabsTrigger>
            <TabsTrigger value="groups">🔗 مجموعات</TabsTrigger>
            <TabsTrigger value="groupSearch">🔍 بحث</TabsTrigger>
            <TabsTrigger value="active">⭐ نشطين</TabsTrigger>
            <TabsTrigger value="bot">🤖 بوت</TabsTrigger>
            <TabsTrigger value="filter">🔧 مرشح</TabsTrigger>
            <TabsTrigger value="generator">🎲 توليد</TabsTrigger>
            <TabsTrigger value="commercial">🏢 تجاري</TabsTrigger>
            <TabsTrigger value="social">🌐 سوشيال</TabsTrigger>
            <TabsTrigger value="maps">🗺️ خرائط</TabsTrigger>
            <TabsTrigger value="joiner">🚪 انضمام</TabsTrigger>
            <TabsTrigger value="contacts">👥 جهات</TabsTrigger>
            <TabsTrigger value="campaigns">📢 حملات</TabsTrigger>
            <TabsTrigger value="messages">✉️ قوالب</TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>استيراد جهات اتصال من CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">اسحب ملف CSV هنا أو اضغط للاختيار</p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    اختيار ملف
                  </Button>
                  {uploadedFile && (
                    <p className="mt-4 text-sm text-green-600">
                      ✅ {uploadedFile.name} - تم رفعه بنجاح
                    </p>
                  )}
                </div>

                <div>
                  <Label>أو أدخل البيانات يدوياً (CSV)</Label>
                  <Textarea
                    placeholder="Name,Phone,Group&#10;أحمد,+966501234567,عملاء&#10;سارة,+966509876543,موردين"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    className="h-32 mt-2 font-mono text-left"
                    dir="ltr"
                  />
                  <Button 
                    onClick={() => parseCSV(csvText)} 
                    className="mt-2"
                    disabled={!csvText.trim()}
                  >
                    معالجة البيانات
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>تنسيق CSV المطلوب:</strong><br />
                    Name,Phone,Group<br />
                    أحمد,+966501234567,عملاء<br />
                    سارة,+966509876543,موردين
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>تصدير جهات الاتصال إلى CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <FileSpreadsheet className="w-12 h-12 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">whatsapp_contacts_{new Date().toISOString().split('T')[0]}.csv</p>
                    <p className="text-sm text-gray-500">{contacts.length} جهة اتصال</p>
                  </div>
                  <Button onClick={exportToCSV} className="gap-2">
                    <Download className="w-4 h-4" />
                    تحميل
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>معاينة البيانات</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contacts.slice(0, 5).map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>{contact.name}</TableCell>
                            <TableCell dir="ltr">{contact.phone}</TableCell>
                            <TableCell>{contact.group}</TableCell>
                            <TableCell>{contact.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {contacts.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      ... و {contacts.length - 5} جهات اتصال أخرى
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>إدارة جهات الاتصال</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>الهاتف</TableHead>
                        <TableHead>المجموعة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell dir="ltr">{contact.phone}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {contact.group}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              contact.status === 'نشط' ? 'bg-green-100 text-green-700' :
                              contact.status === 'جديد' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {contact.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(contact.phone)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(`https://wa.me/${contact.phone.replace(/\D/g, '')}`, '_blank')}
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extract Tab */}
          <TabsContent value="extract">
            <Card>
              <CardHeader>
                <CardTitle>📱 استخراج أرقام من محادثات واتساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>كيفية الاستخدام:</strong><br />
                    1. افتح محادثة واتساب → النقاط الثلاث → المزيد → تصدير الدردشة<br />
                    2. انسخ النص والصقه هنا أو ارفع ملف .txt<br />
                    3. سيتم استخراج جميع الأرقام تلقائياً
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">ارفع ملف محادثة (.txt) أو الصق النص مباشرة</p>
                  <Input
                    type="file"
                    accept=".txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          const text = ev.target?.result as string
                          handleChatTextChange(text)
                        }
                        reader.readAsText(file)
                      }
                    }}
                    className="hidden"
                    id="chat-file"
                  />
                  <label htmlFor="chat-file">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>📁 اختيار ملف محادثة</span>
                    </Button>
                  </label>
                </div>

                <div>
                  <Label>أو الصق نص المحادثة هنا</Label>
                  <Textarea
                    placeholder="[4/27/26, 10:30 AM] +966501234567: مرحباً كيف حالك؟&#10;[4/27/26, 10:35 AM] أحمد: تمام شكراً&#10;+966509876543: أريد الاستفسار عن..."
                    value={chatText}
                    onChange={(e) => handleChatTextChange(e.target.value)}
                    className="h-48 mt-2 font-mono text-sm"
                    dir="ltr"
                  />
                </div>

                {extractedNumbers.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-bold text-green-800">{extractedNumbers.length} رقم مستخرج</p>
                          <p className="text-sm text-green-600">جاهز للتصدير</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={exportExtractedNumbers}
                          className="gap-2"
                        >
                          <FileDown className="w-4 h-4" />
                          تصدير CSV
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setContacts(prev => [...prev, ...extractedNumbers])
                            alert(`تم إضافة ${extractedNumbers.length} رقم إلى جهات الاتصال`)
                          }}
                        >
                          ➕ أضف للقائمة
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>الرقم</TableHead>
                            <TableHead>المصدر</TableHead>
                            <TableHead>إجراء</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {extractedNumbers.map((num, index) => (
                            <TableRow key={num.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell dir="ltr" className="font-mono">{num.phone}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  مستخرج
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(num.phone)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.open(`https://wa.me/${num.phone.replace(/\D/g, '')}`, '_blank')}
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>قوالب الرسائل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" onClick={() => generateMessage('welcome')}>
                    👋 ترحيب
                  </Button>
                  <Button variant="outline" onClick={() => generateMessage('followup')}>
                    🌟 متابعة
                  </Button>
                  <Button variant="outline" onClick={() => generateMessage('promotion')}>
                    🎉 عرض
                  </Button>
                  <Button variant="outline" onClick={() => generateMessage('reminder')}>
                    📅 تذكير
                  </Button>
                </div>

                <div>
                  <Label>نص الرسالة</Label>
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="h-40 mt-2"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyToClipboard(messageText)}
                    disabled={!messageText}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    نسخ الرسالة
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setMessageText('')}
                  >
                    مسح
                  </Button>
                </div>

                {messageText && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 mb-2">معاينة:</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{messageText}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Group Search Tab */}
          <TabsContent value="groupSearch">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-green-600" />
                    البحث عن مجموعات واتساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>🔍 ابحث عن مجموعات واتساب جديدة</strong><br />
                      ابحث عن مجموعات في مختلف التصنيفات وانضم إليها.<br />
                      ⚠️ هذه نتائج تجريبية - في الإنتاج ستكون مرتبطة بقاعدة بيانات حقيقية.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>كلمة البحث</Label>
                      <Input
                        placeholder="ابحث عن مجموعة..."
                        value={groupSearchQuery}
                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>التصنيف</Label>
                      <select
                        value={groupSearchCategory}
                        onChange={(e) => setGroupSearchCategory(e.target.value)}
                        className="w-full mt-1 p-2 border rounded"
                      >
                        <option value="all">🌟 جميع التصنيفات</option>
                        <option value="تجاري">💼 تجاري</option>
                        <option value="تسويق">📱 تسويق</option>
                        <option value="عقارات">🏠 عقارات</option>
                        <option value="مطاعم">🍽️ مطاعم</option>
                        <option value="صحي">💊 صحي</option>
                        <option value="تعليم">📚 تعليم</option>
                        <option value="تقني">💻 تقني</option>
                        <option value="ديني">🌙 ديني</option>
                        <option value="وظائف">📢 وظائف</option>
                        <option value="تسوق">🛍️ تسوق</option>
                      </select>
                    </div>

                    <Button 
                      onClick={searchWhatsAppGroups}
                      disabled={isSearchingGroups}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isSearchingGroups ? (
                        <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري البحث...</>
                      ) : (
                        <><Search className="w-4 h-4 ml-2" /> بحث عن المجموعات</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      المجموعات الموجودة
                    </span>
                    {foundGroups.length > 0 && (
                      <Button size="sm" variant="outline" onClick={exportFoundGroups}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {foundGroups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>لا توجد مجموعات</p>
                      <p className="text-sm mt-1">ابحث عن مجموعات للبدء</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{foundGroups.length} مجموعة</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{foundGroups.filter(g => g.isNew).length} جديدة</span>
                      </div>

                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {foundGroups.map((group) => (
                          <div key={group.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0 text-lg">👥</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{group.name} {group.isNew && <span className="text-xs bg-red-500 text-white px-1 rounded">NEW</span>}</p>
                              <p className="text-xs text-gray-500">{group.description}</p>
                              <p className="text-xs text-gray-600">📍 {group.country} | 👤 {group.memberCount.toLocaleString()} عضو</p>
                              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{group.category}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button variant="ghost" size="sm" onClick={() => window.open(group.link, '_blank')}><ExternalLink className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(group.link)}><Copy className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => addGroupToJoiner(group)} title="إضافة لقائمة الانضمام"><Plus className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Chatbot Tab */}
          <TabsContent value="bot">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bot Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    إعدادات البوت - الرد الآلي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                      <strong>🤖 بوت الرد الآلي الذكي</strong><br />
                      أنشئ قواعد رد تلقائي بناءً على كلمات مفتاحية.<br />
                      ⚠️ للاستخدام مع WhatsApp Business API
                    </p>
                  </div>

                  {/* Enable/Disable */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">تفعيل البوت</span>
                    </div>
                    <Button 
                      variant={chatbotEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChatbotEnabled(!chatbotEnabled)}
                    >
                      {chatbotEnabled ? 'مفعل ✓' : 'معطل'}
                    </Button>
                  </div>

                  {/* Welcome Message */}
                  <div>
                    <Label>رسالة الترحيب</Label>
                    <Textarea
                      value={chatbotWelcomeMessage}
                      onChange={(e) => setChatbotWelcomeMessage(e.target.value)}
                      className="mt-1 text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Default Response */}
                  <div>
                    <Label>الرد الافتراضي</Label>
                    <Textarea
                      value={chatbotDefaultResponse}
                      onChange={(e) => setChatbotDefaultResponse(e.target.value)}
                      className="mt-1 text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Quick Templates */}
                  <div className="pt-4 border-t">
                    <Label className="text-xs text-gray-500">قواعد جاهزة:</Label>
                    <Button size="sm" variant="outline" onClick={loadSuggestedRules} className="mt-2 w-full">
                      تحميل قواعد مُقترحة
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Rules Management */}
              <Card>
                <CardHeader>
                  <CardTitle>قواعد الرد الآلي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add New Rule */}
                  <div className="space-y-3">
                    <Input
                      placeholder="الكلمات المفتاحية (افصل بفاصلة)"
                      value={newRuleKeyword}
                      onChange={(e) => setNewRuleKeyword(e.target.value)}
                    />
                    <Textarea
                      placeholder="الرد التلقائي..."
                      value={newRuleResponse}
                      onChange={(e) => setNewRuleResponse(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={addChatbotRule} className="w-full bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة قاعدة
                    </Button>
                  </div>

                  {/* Rules List */}
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {chatbotRules.map((rule) => (
                      <div key={rule.id} className={`p-3 rounded-lg border ${rule.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">كلمات مفتاحية:</p>
                            <p className="text-sm font-medium">{rule.keywords.join(', ')}</p>
                            <p className="text-xs text-gray-500 mt-1">الرد:</p>
                            <p className="text-sm">{rule.response}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Test Bot */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>اختبار البوت</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="اكتب رسالة للاختبار..."
                      value={chatbotTestMessage}
                      onChange={(e) => setChatbotTestMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={testChatbot} variant="outline">
                      اختبار
                    </Button>
                  </div>
                  {chatbotTestResponse && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 mb-2">رد البوت:</p>
                      <p className="text-gray-800">{chatbotTestResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Active Members Tab */}
          <TabsContent value="active">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    استخراج الأعضاء النشطين من مجموعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>📋 كيفية الاستخدام:</strong><br />
                      1. افتح مجموعة واتساب ← النقاط الثلاث ← المزيد ← تصدير الدردشة<br />
                      2. اختر "بدون ملفات وسائط" للحصول على نص فقط<br />
                      3. انسخ النص والصقه في المربع أدناه<br />
                      4. سيقوم النظام بتحليل النشاط تلقائياً
                    </p>
                  </div>

                  <div>
                    <Label>نص محادثة المجموعة</Label>
                    <Textarea
                      value={groupChatText}
                      onChange={(e) => setGroupChatText(e.target.value)}
                      placeholder="[4/27/26, 10:30 AM] أحمد: مرحباً جميعاً&#10;[4/27/26, 10:31 AM] محمد: مرحبا أحمد&#10;[4/27/26, 10:35 AM] أحمد: كيف الحال؟"
                      className="h-56 mt-1 font-mono text-xs"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-sm">حد النشاط (عدد الرسائل)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={activityThreshold}
                        onChange={(e) => setActivityThreshold(parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        يعتبر العضو "نشط" إذا أرسل {activityThreshold} رسائل أو أكثر
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={analyzeGroupChat}
                    disabled={!groupChatText.trim() || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري التحليل...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 ml-2" />
                        تحليل النشاط
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      نتائج التحليل
                    </span>
                    {activeMembers.length > 0 && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={exportActiveMembers}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>لا توجد بيانات محللة بعد</p>
                      <p className="text-sm mt-1">الصق نص محادثة المجموعة أولاً</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Summary */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {activeMembers.filter(m => m.isActive).length}
                          </p>
                          <p className="text-xs text-gray-600">أعضاء نشطين</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-gray-600">
                            {activeMembers.length}
                          </p>
                          <p className="text-xs text-gray-600">إجمالي الأعضاء</p>
                        </div>
                      </div>

                      {/* Members List */}
                      <div className="border rounded-lg overflow-hidden max-h-[350px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">#</TableHead>
                              <TableHead>العضو</TableHead>
                              <TableHead className="text-center">الرسائل</TableHead>
                              <TableHead className="text-center">النشاط</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activeMembers.map((member, index) => (
                              <TableRow 
                                key={member.id}
                                className={member.isActive ? 'bg-green-50/50' : ''}
                              >
                                <TableCell className="text-gray-500">{index + 1}</TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{member.name}</p>
                                    {member.phone && (
                                      <p className="text-xs text-gray-500 font-mono" dir="ltr">
                                        {member.phone}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    member.messageCount >= activityThreshold * 2 
                                      ? 'bg-green-100 text-green-700' 
                                      : member.messageCount >= activityThreshold 
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {member.messageCount}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  {member.isActive ? (
                                    <span className="text-green-600 text-xs">✓ نشط</span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">غير نشط</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={addActiveToContacts}
                          disabled={activeMembers.filter(m => m.isActive).length === 0}
                        >
                          <Users className="w-4 h-4 ml-2" />
                          إضافة النشطين للجهات
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setActiveMembers([])
                            setGroupChatText('')
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Google Maps Tab */}
          <TabsContent value="maps">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    البحث في خرائط جوجل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>🗺️ البحث عن أرقام الشركات في Google Maps</strong><br />
                      ابحث عن أي نوع نشاط تجاري واحصل على أرقام الهواتف والعناوين.<br />
                      ⚠️ <strong>ملاحظة:</strong> للحصول على نتائج حقيقية، يجب إضافة Google Maps API Key.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>نوع النشاط التجاري</Label>
                      <Input
                        placeholder="مثال: مطاعم، صيدليات، محلات ملابس..."
                        value={mapsSearchQuery}
                        onChange={(e) => setMapsSearchQuery(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>الموقع / المدينة</Label>
                      <select
                        value={mapsLocation}
                        onChange={(e) => setMapsLocation(e.target.value)}
                        className="w-full mt-1 p-2 border rounded"
                      >
                        <option value="الرياض">🇸🇦 الرياض</option>
                        <option value="جدة">🇸🇦 جدة</option>
                        <option value="مكة">🇸🇦 مكة المكرمة</option>
                        <option value="الدمام">🇸🇦 الدمام</option>
                        <option value="الخبر">🇸🇦 الخبر</option>
                        <option value="الطائف">🇸🇦 الطائف</option>
                        <option value="المدينة المنورة">🇸🇦 المدينة المنورة</option>
                        <option value="أبها">🇸🇦 أبها</option>
                        <option value="خميس مشيط">🇸🇦 خميس مشيط</option>
                        <option value="الإمارات">🇦🇪 الإمارات</option>
                        <option value="الكويت">🇰🇼 الكويت</option>
                        <option value="البحرين">🇧🇭 البحرين</option>
                        <option value="قطر">🇶🇦 قطر</option>
                        <option value="عمان">🇴🇲 سلطنة عمان</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={searchGoogleMaps}
                        disabled={isSearchingMaps || !mapsSearchQuery.trim()}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        {isSearchingMaps ? (
                          <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري البحث...</>
                        ) : (
                          <><Search className="w-4 h-4 ml-2" /> بحث في خرائط جوجل</>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => openInGoogleMaps(mapsSearchQuery)}>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      النتائج
                    </span>
                    {mapsResults.length > 0 && (
                      <Button size="sm" variant="outline" onClick={exportMapsResults}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mapsResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>لا توجد نتائج</p>
                      <p className="text-sm mt-1">ابحث عن نشاط تجاري للبدء</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">{mapsResults.length} نتيجة</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{mapsResults.filter(b => b.phone).length} بها رقم</span>
                      </div>

                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {mapsResults.map((business) => (
                          <div key={business.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white flex-shrink-0">🗺️</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{business.name}</p>
                              <p className="text-xs text-gray-500">⭐ {business.rating} ({business.reviews} تقييم)</p>
                              <p className="text-xs text-gray-600 truncate">📍 {business.address}</p>
                              {business.phone ? (
                                <p className="text-sm font-mono text-green-600" dir="ltr">📞 {business.phone}</p>
                              ) : (
                                <p className="text-xs text-gray-400">❌ لا يوجد رقم</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              {business.phone && (
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(business.phone!)}><Copy className="w-4 h-4" /></Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => window.open(`https://wa.me/${business.phone?.replace(/\D/g, '')}`, '_blank')} disabled={!business.phone}><MessageCircle className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button variant="outline" className="w-full mt-4" onClick={addMapsResultsToContacts}>
                        <Users className="w-4 h-4 ml-2" />
                        إضافة للجهات ({mapsResults.filter(b => b.phone).length})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Group Joiner Tab */}
          <TabsContent value="joiner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Groups */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-orange-500" />
                    إدارة الانضمام للمجموعات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                      <strong>📋 كيفية الاستخدام:</strong><br />
                      1. أضف روابط المجموعات التي تريد الانضمام لها<br />
                      2. اضغط "بدء الانضمام" لفتح الروابط بالتتابع<br />
                      3. انضم يدوياً في كل تبويب، ثم عد وحدد الحالة<br />
                      ⚠️ <strong>ملاحظة:</strong> الانضمام يدوي - نحن نساعدك فقط في تنظيم الروابط
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Input
                      placeholder="اسم المجموعة (اختياري)"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <Input
                      placeholder="رابط المجموعة (مثال: https://chat.whatsapp.com/ABC123)"
                      value={newGroupLink}
                      onChange={(e) => setNewGroupLink(e.target.value)}
                      dir="ltr"
                    />
                    <Button 
                      onClick={addGroupLink}
                      disabled={!newGroupLink.trim()}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة للقائمة
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">أو استيراد متعدد</span>
                    </div>
                  </div>

                  <div>
                    <Textarea
                      placeholder="الصق قائمة بروابط المجموعات هنا...&#10;سيتم استخراج الروابط تلقائياً"
                      className="h-24 text-sm"
                      dir="ltr"
                      onChange={(e) => {
                        if (e.target.value.includes('chat.whatsapp.com')) {
                          importGroupLinks(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs">الفاصل بين كل رابط (ثواني)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={joinDelay}
                        onChange={(e) => setJoinDelay(parseInt(e.target.value) || 3)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">في الانتظار</Label>
                      <p className="text-2xl font-bold text-orange-600">
                        {groupLinksToJoin.filter(g => g.status === 'pending').length}
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={startJoiningProcess}
                    disabled={isJoining || groupLinksToJoin.filter(g => g.status === 'pending').length === 0}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الفتح... ({currentJoinIndex}/{groupLinksToJoin.filter(g => g.status === 'pending').length})
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 ml-2" />
                        بدء الانضمام (فتح الروابط)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Groups List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      قائمة المجموعات
                    </span>
                    {groupLinksToJoin.length > 0 && (
                      <Button size="sm" variant="outline" onClick={exportGroupLinksList}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {groupLinksToJoin.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Link2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>لا توجد مجموعات في القائمة</p>
                      <p className="text-sm mt-1">أضف روابط المجموعات للبدء</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[450px] overflow-y-auto">
                      {groupLinksToJoin.map((group, index) => (
                        <div 
                          key={group.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            group.status === 'joined' ? 'bg-green-50 border-green-200' :
                            group.status === 'failed' ? 'bg-red-50 border-red-200' :
                            group.status === 'skipped' ? 'bg-gray-50 border-gray-200' :
                            'bg-orange-50 border-orange-200'
                          }`}
                        >
                          <span className="text-xs text-gray-400 w-6">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{group.name}</p>
                            <p className="text-xs text-gray-500 font-mono truncate" dir="ltr">{group.url}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              group.status === 'joined' ? 'bg-green-200 text-green-800' :
                              group.status === 'failed' ? 'bg-red-200 text-red-800' :
                              group.status === 'skipped' ? 'bg-gray-200 text-gray-800' :
                              'bg-orange-200 text-orange-800'
                            }`}>
                              {group.status === 'pending' && '⏳ في الانتظار'}
                              {group.status === 'joined' && '✓ تم الانضمام'}
                              {group.status === 'failed' && '✗ فشل'}
                              {group.status === 'skipped' && '⏭️ تخطي'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {group.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-green-600"
                                  onClick={() => markAsJoined(group.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => markAsFailed(group.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeGroupItem(group.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-500" />
                    استخراج حسابات التواصل الاجتماعي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                      <strong>🌐 المنصات المدعومة:</strong><br />
                      📸 Instagram | 🐦 Twitter/X | 📘 Facebook<br />
                      💼 LinkedIn | 🎵 TikTok | 👻 Snapchat | ✈️ Telegram
                    </p>
                  </div>

                  <div>
                    <Label>الصق النص (بايو، رابط، أو قائمة)</Label>
                    <Textarea
                      value={socialText}
                      onChange={(e) => {
                        setSocialText(e.target.value)
                        extractSocialMedia(e.target.value)
                      }}
                      placeholder="الصق هنا أي نص يحتوي على روابط أو اسماء حسابات...&#10;&#10;مثال:&#10;تابعني على انستا @username&#10;تويتر: https://twitter.com/user&#10;IG: mybrand&#10;LinkedIn: linkedin.com/in/name"
                      className="h-48 mt-1 font-mono text-sm"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">أنماط الاستخراج:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {['instagram.com/', 'twitter.com/', 'x.com/', 'facebook.com/', 'linkedin.com/in/', 'tiktok.com/@', 't.me/', '@username'].map((pattern, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      الحسابات المستخرجة
                    </span>
                    {extractedSocial.length > 0 && (
                      <div className="flex gap-2">
                        <select 
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          className="text-sm border rounded px-2"
                        >
                          <option value="all">الكل</option>
                          <option value="Instagram">📸 Instagram</option>
                          <option value="Twitter/X">🐦 Twitter/X</option>
                          <option value="Facebook">📘 Facebook</option>
                          <option value="LinkedIn">💼 LinkedIn</option>
                          <option value="TikTok">🎵 TikTok</option>
                          <option value="Snapchat">👻 Snapchat</option>
                          <option value="Telegram">✈️ Telegram</option>
                        </select>
                        <Button size="sm" variant="outline" onClick={exportSocialProfiles}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {extractedSocial.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>لا توجد حسابات مستخرجة</p>
                      <p className="text-sm mt-1">الصق نص يحتوي على روابط أو أسماء مستخدمين</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Stats */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.from(new Set(extractedSocial.map(p => p.platform))).map(platform => {
                          const count = extractedSocial.filter(p => p.platform === platform).length
                          return (
                            <span key={platform} className={`px-3 py-1 ${getPlatformColor(platform)} text-white rounded-full text-xs`}>
                              {getPlatformIcon(platform)} {platform}: {count}
                            </span>
                          )
                        })}
                      </div>

                      {/* List */}
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {(selectedPlatform === 'all' ? extractedSocial : extractedSocial.filter(p => p.platform === selectedPlatform)).map((profile) => (
                          <div 
                            key={profile.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className={`w-10 h-10 ${getPlatformColor(profile.platform)} rounded-full flex items-center justify-center text-white text-lg`}>
                              {getPlatformIcon(profile.platform)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">@{profile.username}</p>
                              <p className="text-xs text-gray-500">{profile.platform}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(profile.url)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(profile.url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={openAllProfiles}
                          disabled={extractedSocial.length === 0}
                        >
                          <ExternalLink className="w-4 h-4 ml-2" />
                          فتح الكل
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setExtractedSocial([])
                            setSocialText('')
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Commercial Search Tab */}
          <TabsContent value="commercial">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    البحث عن أرقام تجارية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>ابحث في جهات الاتصال</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="اسم الشركة، المتجر، المؤسسة..."
                        className="flex-1"
                      />
                      <Button 
                        onClick={searchCommercialNumbers}
                        disabled={isSearching || !searchQuery.trim()}
                      >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">أو</span>
                    </div>
                  </div>

                  <div>
                    <Label>تحليل قائمة (اكتشاف تلقائي)</Label>
                    <Textarea
                      placeholder="الصق قائمة بأسماء وأرقام، وسيتم اكتشاف الأرقام التجارية تلقائياً...&#10;&#10;مثال:&#10;شركة التقنية 966501234567&#10;مطعم الشام 0509876543&#10;محل البسة 966555555555"
                      className="h-40 mt-1 font-mono text-sm"
                      dir="rtl"
                      onChange={(e) => detectCommercialInList(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">الكلمات المفتاحية للكشف:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {commercialKeywords.slice(0, 12).map((word, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {word}
                        </span>
                      ))}
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">+{commercialKeywords.length - 12}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      النتائج التجارية
                    </span>
                    {(searchResults.length > 0 || detectedCommercial.length > 0) && (
                      <Button size="sm" variant="outline" onClick={exportCommercialNumbers}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.length === 0 && detectedCommercial.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>لا توجد نتائج</p>
                      <p className="text-sm mt-1">ابحث أو الصق قائمة للتحليل</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(detectedCommercial.length > 0 ? detectedCommercial : searchResults).map((contact, index) => (
                        <div 
                          key={contact.id}
                          className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100"
                        >
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            🏢
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-gray-500 font-mono" dir="ltr">{contact.phone}</p>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                              {contact.group}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(contact.phone)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(`https://wa.me/${contact.phone.replace(/\D/g, '')}`, '_blank')}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-2 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            const list = detectedCommercial.length > 0 ? detectedCommercial : searchResults
                            const newContacts = list.map((c, i) => ({
                              ...c,
                              id: Date.now() + i,
                              group: 'أرقام تجارية'
                            }))
                            setContacts(prev => [...prev, ...newContacts])
                            alert(`تم إضافة ${newContacts.length} رقم تجاري للجهات`)
                          }}
                        >
                          <Users className="w-4 h-4 ml-2" />
                          إضافة للجهات
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSearchResults([])
                            setDetectedCommercial([])
                            setSearchQuery('')
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Generator Tab */}
          <TabsContent value="generator">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Number Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-500" />
                    مولد أرقام واتساب (عشوائي)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ للاختبار والتجربة فقط:</strong><br />
                      هذه الأرقام عشوائية ولا تمثل أرقام حقيقية. استخدمها لاختبار الأدوات والحملات.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الدولة</Label>
                      <select
                        value={generatorCountry}
                        onChange={(e) => setGeneratorCountry(e.target.value)}
                        className="w-full mt-1 p-2 border rounded"
                      >
                        <option value="966">🇸🇦 السعودية (+966)</option>
                        <option value="971">🇦🇪 الإمارات (+971)</option>
                        <option value="974">🇶🇦 قطر (+974)</option>
                        <option value="965">🇰🇼 الكويت (+965)</option>
                        <option value="20">🇪🇬 مصر (+20)</option>
                        <option value="962">🇯🇴 الأردن (+962)</option>
                      </select>
                    </div>
                    <div>
                      <Label>عدد الأرقام</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={generatorCount}
                        onChange={(e) => setGeneratorCount(parseInt(e.target.value) || 10)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={generateRandomNumbers}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="w-4 h-4 ml-2" />
                    توليد الأرقام
                  </Button>

                  {generatedNumbers.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{generatedNumbers.length} رقم مولد</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={exportGeneratedNumbers}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const newContacts = generatedNumbers.map((num, i) => ({
                                id: Date.now() + i,
                                name: `رقم مولد ${i + 1}`,
                                phone: num,
                                group: 'أرقام مولدة',
                                status: 'نشط' as const
                              }))
                              setContacts(prev => [...prev, ...newContacts])
                              alert(`تم إضافة ${newContacts.length} رقم للجهات`)
                            }}
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg max-h-[200px] overflow-y-auto">
                        {generatedNumbers.map((num, i) => (
                          <p key={i} className="font-mono text-sm py-1" dir="ltr">{num}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Number Formatter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    محول تنسيق الأرقام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>أرقام بتنسيقات مختلفة</Label>
                    <Textarea
                      placeholder="0501234567&#10;966501234567&#10;+966501234567&#10;00966501234567"
                      className="h-32 mt-1 font-mono text-sm"
                      dir="ltr"
                      onChange={(e) => formatNumbersList(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>الدولة الافتراضية للتحويل</Label>
                    <select
                      value={generatorCountry}
                      onChange={(e) => setGeneratorCountry(e.target.value)}
                      className="w-full mt-1 p-2 border rounded"
                    >
                      <option value="966">🇸🇦 السعودية (+966)</option>
                      <option value="971">🇦🇪 الإمارات (+971)</option>
                      <option value="974">🇶🇦 قطر (+974)</option>
                      <option value="20">🇪🇬 مصر (+20)</option>
                    </select>
                  </div>

                  {formattedNumbers.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">
                          {formattedNumbers.filter(n => n.valid).length} / {formattedNumbers.length} صالح
                        </p>
                        <Button size="sm" variant="outline" onClick={exportFormattedNumbers}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg max-h-[200px] overflow-y-auto">
                        {formattedNumbers.map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-1 border-b last:border-0">
                            <div>
                              <p className="font-mono text-sm" dir="ltr">{item.formatted}</p>
                              <p className="text-xs text-gray-400 line-through" dir="ltr">{item.original}</p>
                            </div>
                            <span className={`text-xs ${item.valid ? 'text-green-600' : 'text-red-600'}`}>
                              {item.valid ? '✓' : '✗'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Filter Tab */}
          <TabsContent value="filter">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    مرشح الأرقام (فلترة وتنظيف)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>الأرقام للفلترة (أرقام، CSV، أو سطر لكل رقم)</Label>
                    <Textarea
                      value={numbersToFilter}
                      onChange={(e) => setNumbersToFilter(e.target.value)}
                      placeholder="+966501234567&#10;966509876543&#10;0505555555&#10;+971501234567"
                      className="h-40 mt-1 font-mono text-sm"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={filterOptions.removeDuplicates} onChange={(e) => setFilterOptions(prev => ({ ...prev, removeDuplicates: e.target.checked }))} />
                      <span className="text-sm">إزالة المكرر</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={filterOptions.removeInvalid} onChange={(e) => setFilterOptions(prev => ({ ...prev, removeInvalid: e.target.checked }))} />
                      <span className="text-sm">إزالة غير الصالح</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={filterOptions.normalizeFormat} onChange={(e) => setFilterOptions(prev => ({ ...prev, normalizeFormat: e.target.checked }))} />
                      <span className="text-sm">تطبيع التنسيق</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">الدولة الافتراضية</Label>
                      <select value={filterOptions.targetCountry} onChange={(e) => setFilterOptions(prev => ({ ...prev, targetCountry: e.target.value }))} className="w-full mt-1 p-2 border rounded text-sm">
                        <option value="966">🇸🇦 السعودية (+966)</option>
                        <option value="971">🇦🇪 الإمارات (+971)</option>
                        <option value="974">🇶🇦 قطر (+974)</option>
                        <option value="965">🇰🇼 الكويت (+965)</option>
                        <option value="973">🇧🇭 البحرين (+973)</option>
                        <option value="968">🇴🇲 عمان (+968)</option>
                        <option value="962">🇯🇴 الأردن (+962)</option>
                        <option value="20">🇪🇬 مصر (+20)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">الحد الأدنى</Label>
                        <Input type="number" value={filterOptions.minLength} onChange={(e) => setFilterOptions(prev => ({ ...prev, minLength: parseInt(e.target.value) || 10 }))} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">الحد الأقصى</Label>
                        <Input type="number" value={filterOptions.maxLength} onChange={(e) => setFilterOptions(prev => ({ ...prev, maxLength: parseInt(e.target.value) || 15 }))} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <Button onClick={filterNumbers} disabled={!numbersToFilter.trim()} className="w-full">
                    <Filter className="w-4 h-4 ml-2" />
                    تطبيق الفلتر
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      النتائج
                    </span>
                    {filteredNumbers.length > 0 && <Button size="sm" variant="outline" onClick={exportFilteredNumbers}><Download className="w-4 h-4" /></Button>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredNumbers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Filter className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>لا توجد نتائج بعد</p>
                      <p className="text-sm mt-1">أدخل الأرقام واضغط "تطبيق الفلتر"</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-2 text-center text-xs">
                        <div className="bg-blue-50 p-2 rounded"><p className="text-lg font-bold">{filterStats.total}</p><p className="text-gray-600">الإجمالي</p></div>
                        <div className="bg-green-50 p-2 rounded"><p className="text-lg font-bold text-green-600">{filterStats.valid}</p><p className="text-gray-600">صالح</p></div>
                        <div className="bg-yellow-50 p-2 rounded"><p className="text-lg font-bold text-yellow-600">{filterStats.cleaned}</p><p className="text-gray-600">تم تنظيفه</p></div>
                        <div className="bg-red-50 p-2 rounded"><p className="text-lg font-bold text-red-600">{filterStats.invalid}</p><p className="text-gray-600">غير صالح</p></div>
                        <div className="bg-gray-50 p-2 rounded"><p className="text-lg font-bold text-gray-600">{filterStats.duplicates}</p><p className="text-gray-600">مكرر</p></div>
                      </div>

                      <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow><TableHead className="w-8">#</TableHead><TableHead>الرقم</TableHead><TableHead>الدولة</TableHead><TableHead className="text-center">الحالة</TableHead></TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredNumbers.map((num, index) => (
                              <TableRow key={num.id} className={num.status === 'valid' ? '' : num.status === 'cleaned' ? 'bg-yellow-50/50' : num.status === 'invalid' ? 'bg-red-50/50' : 'bg-gray-50/50'}>
                                <TableCell className="text-xs text-gray-500">{index + 1}</TableCell>
                                <TableCell>
                                  <p className="font-mono text-sm" dir="ltr">{num.normalized}</p>
                                  {num.original !== num.normalized && <p className="text-xs text-gray-400 line-through" dir="ltr">{num.original}</p>}
                                </TableCell>
                                <TableCell className="text-xs">{getCountryName(num.country)}</TableCell>
                                <TableCell className="text-center text-xs">
                                  {num.status === 'valid' && <span className="text-green-600">✓ صالح</span>}
                                  {num.status === 'cleaned' && <span className="text-yellow-600">🧹 تم التنظيف</span>}
                                  {num.status === 'invalid' && <span className="text-red-600">✗ {num.reason}</span>}
                                  {num.status === 'duplicate' && <span className="text-gray-500">🔄 مكرر</span>}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button variant="outline" className="flex-1" onClick={addFilteredToContacts} disabled={filteredNumbers.filter(n => n.status === 'valid' || n.status === 'cleaned').length === 0}>
                          <Users className="w-4 h-4 ml-2" /> إضافة للجهات
                        </Button>
                        <Button variant="outline" onClick={() => { setFilteredNumbers([]); setNumbersToFilter(''); }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Group Links Tab */}
          <TabsContent value="groups">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    استخراج روابط المجموعات من موقع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>رابط الموقع</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com/groups-page"
                        className="flex-1"
                        dir="ltr"
                      />
                      <Button 
                        onClick={fetchWebsite}
                        disabled={isExtracting || !websiteUrl.trim()}
                      >
                        {isExtracting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      * قد لا تعمل مع بعض المواقع بسبب حماية CORS
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">أو</span>
                    </div>
                  </div>

                  <div>
                    <Label>لصق HTML الصفحة يدوياً</Label>
                    <Textarea
                      value={websiteHtml}
                      onChange={(e) => setWebsiteHtml(e.target.value)}
                      placeholder="انسخ كود HTML من الصفحة والصقه هنا..."
                      className="h-40 mt-1 font-mono text-xs"
                      dir="ltr"
                    />
                    <Button 
                      onClick={extractFromPastedHtml}
                      disabled={!websiteHtml.trim()}
                      className="mt-2 w-full"
                      variant="outline"
                    >
                      <Link2 className="w-4 h-4 ml-2" />
                      استخراج من النص
                    </Button>
                  </div>

                  {extractionError && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">⚠️ {extractionError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      الروابط المستخرجة
                    </span>
                    {extractedLinks.length > 0 && (
                      <Button size="sm" variant="outline" onClick={exportGroupLinks}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {extractedLinks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>لا توجد روابط مستخرجة بعد</p>
                      <p className="text-sm mt-1">أدخل رابط موقع أو الصق HTML</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {extractedLinks.map((link, index) => (
                        <div 
                          key={link.id}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-xs text-gray-400 w-6">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-blue-600 truncate" dir="ltr">
                              {link.url}
                            </p>
                            <p className="text-xs text-gray-500">{link.source}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(link.url)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(link.url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {extractedLinks.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          {extractedLinks.length} رابط مجموعة
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setExtractedLinks([])
                            setExtractionError('')
                          }}
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          مسح الكل
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Campaign */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    إنشاء حملة جديدة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>اسم الحملة</Label>
                    <Input
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder="مثال: عرض رمضان 2025"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>رسالة الحملة</Label>
                    <Textarea
                      value={newCampaignMessage}
                      onChange={(e) => setNewCampaignMessage(e.target.value)}
                      placeholder="اكتب رسالتك هنا..."
                      className="mt-1 h-32"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {newCampaignMessage.length} حرف | 
                      {Math.ceil(newCampaignMessage.length / 160)} رسالة
                    </p>
                  </div>

                  <div>
                    <Label>المجموعات المستهدفة</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.from(new Set(contacts.map(c => c.group))).map(group => (
                        <Button
                          key={group}
                          variant={selectedGroups.includes(group || '') ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedGroups(prev => 
                              prev.includes(group || '')
                                ? prev.filter(g => g !== group)
                                : [...prev, group || '']
                            )
                          }}
                        >
                          {selectedGroups.includes(group || '') && <CheckCircle className="w-3 h-3 ml-1" />}
                          {group}
                          <span className="mr-1 text-xs opacity-70">
                            ({contacts.filter(c => c.group === group).length})
                          </span>
                        </Button>
                      ))}
                    </div>
                    {selectedGroups.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        سيتم الإرسال لجميع جهات الاتصال ({contacts.length})
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      جدولة الإرسال (اختياري)
                    </Label>
                    <Input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={createCampaign}
                    disabled={!newCampaignName.trim() || !newCampaignMessage.trim()}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 ml-2" />
                    إنشاء الحملة
                  </Button>
                </CardContent>
              </Card>

              {/* Campaigns List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      الحملات ({campaigns.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {campaigns.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        لا توجد حملات بعد. أنشئ حملتك الأولى!
                      </p>
                    ) : (
                      campaigns.map(campaign => (
                        <div 
                          key={campaign.id} 
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            activeCampaign?.id === campaign.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveCampaign(campaign)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold">{campaign.name}</h4>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                {campaign.message}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {campaign.recipients} مستلم
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(campaign.createdAt).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                              
                              {/* Progress Bar */}
                              {campaign.status !== 'draft' && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-green-600">
                                      ✓ {campaign.delivered} وصل
                                    </span>
                                    <span className="text-red-600">
                                      ✗ {campaign.failed} فشل
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full transition-all"
                                      style={{ width: `${(campaign.sent / campaign.recipients) * 100}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {campaign.sent}/{campaign.recipients} ({Math.round((campaign.sent/campaign.recipients)*100)}%)
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-1 mr-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                campaign.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                                campaign.status === 'sending' ? 'bg-yellow-100 text-yellow-600' :
                                campaign.status === 'completed' ? 'bg-green-100 text-green-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {campaign.status === 'draft' ? 'مسودة' :
                                 campaign.status === 'sending' ? 'جاري الإرسال' :
                                 campaign.status === 'completed' ? 'مكتملة' : 'مجدولة'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            {campaign.status === 'draft' && (
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  sendCampaign(campaign.id)
                                }}
                                disabled={isSending}
                              >
                                <Play className="w-3 h-3 ml-1" />
                                إرسال الآن
                              </Button>
                            )}
                            {campaign.status === 'completed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  duplicateCampaign(campaign)
                                }}
                              >
                                <RotateCcw className="w-3 h-3 ml-1" />
                                تكرار
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteCampaign(campaign.id)
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Details */}
            {activeCampaign && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>تفاصيل الحملة: {activeCampaign.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{activeCampaign.recipients}</p>
                      <p className="text-sm text-gray-600">المستلمين</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{activeCampaign.delivered}</p>
                      <p className="text-sm text-gray-600">تم التوصيل</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-600">{activeCampaign.sent}</p>
                      <p className="text-sm text-gray-600">تم الإرسال</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">{activeCampaign.failed}</p>
                      <p className="text-sm text-gray-600">فشل</p>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-2">نص الرسالة:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{activeCampaign.message}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
