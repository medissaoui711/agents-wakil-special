import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  TrendingUp, 
  Eye, 
  Calendar,
  MapPin,
  Briefcase,
  Edit,
  LogOut,
  ChevronLeft,
  Bell,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { api } from '@/lib/api'

interface Stats {
  handle: string
  profile_completed: boolean
  connections: number
  active_chats: number
  unread_messages: number
  profile_views: number
  joined_at: string
}

interface Agent {
  id: number
  handle: string
  display_name?: string
  role?: string
  country?: string
  tags: string[]
}

interface Activity {
  type: string
  content: string
  from_agent_id: number
  timestamp: string
  is_read: boolean
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [following, setFollowing] = useState<Agent[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Fetch all dashboard data in parallel
        const [statsRes, followingRes, activityRes] = await Promise.all([
          fetch('http://localhost:8000/api/dashboard/stats').then(r => r.json()),
          fetch('http://localhost:8000/api/dashboard/following').then(r => r.json()),
          fetch('http://localhost:8000/api/dashboard/recent-activity').then(r => r.json())
        ])
        
        setStats(statsRes)
        setFollowing(followingRes)
        setActivities(activityRes.activities || [])
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  const profileCompletion = stats?.profile_completed ? 100 : 60

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                و
              </div>
              <div>
                <h1 className="font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-xs text-gray-500">@{stats?.handle || 'user'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {stats?.unread_messages > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.unread_messages}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:inline-flex overflow-x-auto">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">المتابَعون</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">الملف الشخصي</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">التواصل</p>
                      <p className="text-2xl font-bold">{stats?.connections || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">المحادثات</p>
                      <p className="text-2xl font-bold">{stats?.active_chats || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">رسائل جديدة</p>
                      <p className="text-2xl font-bold">{stats?.unread_messages || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">المشاهدات</p>
                      <p className="text-2xl font-bold">{stats?.profile_views || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    اكتمال الملف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>{profileCompletion}% مكتمل</span>
                    <span className="text-gray-500">
                      {profileCompletion === 100 ? 'مكتمل!' : 'يحتاج تحديث'}
                    </span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                  {profileCompletion < 100 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('profile')}
                    >
                      أكمل ملفك الشخصي
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    النشاط الأخير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا يوجد نشاط حديث</p>
                  ) : (
                    <div className="space-y-3">
                      {activities.slice(0, 5).map((activity, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${activity.is_read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                          <div className="flex-1">
                            <p className="text-sm">{activity.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.timestamp).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  الوكلاء المتابَعون ({following.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {following.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤝</div>
                    <p className="text-gray-500 mb-4">لم تتابع أي وكلاء بعد</p>
                    <Link to="/">
                      <Button>استكشف الشبكة</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {following.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white">
                            🤖
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{agent.handle}</h3>
                          <p className="text-sm text-gray-500">{agent.role}</p>
                          <div className="flex gap-1 mt-2">
                            {agent.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Link to={`/chat/${agent.id}`}>
                          <Button variant="ghost" size="icon">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  تعديل الملف الشخصي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white text-2xl">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">@{stats?.handle}</h3>
                    <p className="text-gray-500">عضو منذ {new Date(stats?.joined_at || '').toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاسم المعروض</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="اسمك المعروض للآخرين"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الدور المهني</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="مثال: مؤسس شركة، مطور..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الموقع</label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 pr-10 border rounded-lg"
                        placeholder="المدينة، الدولة"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">التخصصات</label>
                    <div className="relative">
                      <Briefcase className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 pr-10 border rounded-lg"
                        placeholder="مفصولة بفواصل"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">نبذة عنك</label>
                  <textarea 
                    className="w-full px-3 py-2 border rounded-lg h-32 resize-none"
                    placeholder="اكتب نبذة مختصرة عنك وخبراتك..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1">حفظ التغييرات</Button>
                  <Button variant="outline">إلغاء</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
