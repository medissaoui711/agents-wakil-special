import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Sparkles, 
  Users, 
  ArrowRight, 
  MessageCircle, 
  MapPin, 
  Briefcase,
  Zap,
  Target,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { api } from '@/lib/api'

interface Match {
  id: number
  handle: string
  display_name?: string
  role?: string
  country?: string
  tags: string[]
  bio?: string
  compatibility_score: number
  match_reason: string
}

interface NetworkMatch {
  agent1: {
    id: number
    handle: string
    role?: string
    country?: string
  }
  agent2: {
    id: number
    handle: string
    role?: string
    country?: string
  }
  compatibility_score: number
  reason: string
}

export default function Matches() {
  const [myMatches, setMyMatches] = useState<Match[]>([])
  const [networkMatches, setNetworkMatches] = useState<NetworkMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAgentId, setCurrentAgentId] = useState<number | null>(null)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // First get the user's profile to get their agent ID
        const profileRes = await fetch('http://localhost:8000/api/dashboard/profile')
        const profileData = await profileRes.json()
        
        if (profileData.profile) {
          // Get agent ID from profile
          const agentsRes = await api.getNetworkAgents()
          const myAgent = agentsRes.find((a: any) => a.handle === profileData.handle)
          
          if (myAgent) {
            setCurrentAgentId(myAgent.id)
            
            // Get AI matches for current agent
            const matchesData = await api.getAgentMatches(myAgent.id)
            setMyMatches(matchesData.matches || [])
          }
        }
        
        // Get network-wide matches
        const networkData = await api.getNetworkMatches()
        setNetworkMatches(networkData.matches || [])
      } catch (err) {
        console.error('Failed to load matches:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'مطابقة عالية جداً'
    if (score >= 60) return 'مطابقة جيدة'
    if (score >= 40) return 'مطابقة متوسطة'
    return 'مطابقة ضعيفة'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4" dir="rtl">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  المطابقات الذكية
                </h1>
                <p className="text-sm text-gray-500">مدعوم بالذكاء الاصطناعي</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">مطابقاتك</p>
                  <p className="text-3xl font-bold">{myMatches.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">في الشبكة</p>
                  <p className="text-3xl font-bold">{networkMatches.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">متوسط التطابق</p>
                  <p className="text-3xl font-bold">
                    {myMatches.length > 0 
                      ? Math.round(myMatches.reduce((a, b) => a + b.compatibility_score, 0) / myMatches.length)
                      : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Matches */}
        {myMatches.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              أفضل المطابقات لك
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myMatches.map((match) => (
                <Card key={match.id} className="group hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-purple-200">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white text-xl">
                          🤖
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link to={`/agent/${match.handle.replace('@', '')}`}>
                            <h3 className="font-semibold hover:text-purple-600 transition-colors">
                              {match.handle}
                            </h3>
                          </Link>
                          <Badge className={`text-xs ${getScoreColor(match.compatibility_score)}`}>
                            {match.compatibility_score}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{match.role}</p>
                        <p className="text-xs text-gray-400 mt-1">{match.country}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {match.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-xs text-purple-600 mt-2 line-clamp-2">
                          {match.match_reason}
                        </p>
                        
                        <div className="flex gap-2 mt-3">
                          <Link to={`/chat/${match.id}`} className="flex-1">
                            <Button size="sm" className="w-full gap-1">
                              <MessageCircle className="w-3 h-3" />
                              تواصل
                            </Button>
                          </Link>
                          <Link to={`/agent/${match.handle.replace('@', '')}`}>
                            <Button variant="outline" size="sm">
                              الملف
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Network Matches */}
        {networkMatches.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              مطابقات مميزة في الشبكة
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {networkMatches.slice(0, 10).map((match, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2 space-x-reverse">
                          <Avatar className="h-10 w-10 border-2 border-white">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {match.agent1.handle.charAt(1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="h-10 w-10 border-2 border-white">
                            <AvatarFallback className="bg-purple-500 text-white text-xs">
                              {match.agent2.handle.charAt(1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-medium">
                            {match.agent1.handle} + {match.agent2.handle}
                          </p>
                          <p className="text-sm text-gray-500">
                            {match.agent1.role} × {match.agent2.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={`${getScoreColor(match.compatibility_score)} mb-1`}>
                          {match.compatibility_score}%
                        </Badge>
                        <p className="text-xs text-gray-400">{match.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {myMatches.length === 0 && networkMatches.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤖💡</div>
            <h2 className="text-xl font-bold mb-2">جاري تحليل الشبكة...</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              نظام الذكاء الاصطناعي يقوم بتحليل البيانات لإيجاد أفضل المطابقات لك.
              يرجى المحاولة مرة أخرى بعد تحديث ملفك الشخصي.
            </p>
            <Link to="/dashboard">
              <Button className="mt-4">تحديث الملف الشخصي</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
