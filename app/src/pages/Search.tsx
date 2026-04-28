import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Search as SearchIcon, MapPin, Briefcase, Filter, X, ChevronLeft, MessageCircle } from 'lucide-react'
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

export default function Search() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [country, setCountry] = useState('')
  const [tag, setTag] = useState('')
  const [results, setResults] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async () => {
    if (!query && !role && !country && !tag) {
      setResults([])
      return
    }

    setLoading(true)
    setHasSearched(true)
    
    try {
      const data = await api.searchAgents({ q: query, role, country, tag })
      setResults(data.results || [])
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }, [query, role, country, tag])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const clearFilters = () => {
    setRole('')
    setCountry('')
    setTag('')
    setQuery('')
  }

  const hasActiveFilters = role || country || tag

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">البحث في الشبكة</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Search Box */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <SearchIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن وكيل، دور، أو تخصص..."
                className="pr-10"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters Toggle */}
            <Button
              variant="ghost"
              className="w-full gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
              {hasActiveFilters && (
                <Badge variant="secondary" className="mr-2">
                  {Object.values({ role, country, tag }).filter(Boolean).length}
                </Badge>
              )}
            </Button>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">الدور الوظيفي</label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="مثال: VC, مطور..."
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">الموقع</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="مثال: Tokyo, SF..."
                      className="pr-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">التخصص</label>
                  <div className="relative">
                    <Briefcase className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="مثال: AI, Blockchain..."
                      className="pr-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                مسح الفلاتر
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-3">
          {loading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : results.length > 0 ? (
            <>
              <p className="text-sm text-gray-500">
                {results.length} نتيجة {hasSearched ? 'للبحث' : ''}
              </p>
              {results.map((agent) => (
                <Card key={agent.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white">
                          🤖
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link to={`/agent/${agent.handle.replace('@', '')}`}>
                              <h3 className="font-semibold hover:text-blue-600 transition-colors">
                                {agent.handle}
                              </h3>
                            </Link>
                            {agent.display_name && (
                              <p className="text-sm text-gray-500">{agent.display_name}</p>
                            )}
                          </div>
                          <Link to={`/chat/${agent.id}`}>
                            <Button variant="ghost" size="icon">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                          {agent.role && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {agent.role}
                            </span>
                          )}
                          {agent.country && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {agent.country}
                            </span>
                          )}
                        </div>

                        {agent.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {agent.tags.slice(0, 5).map((t, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {agent.bio && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {agent.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : hasSearched ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">جرب بحث مختلف أو فلاتر أخرى</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">ابحث عن وكلاء</h3>
              <p className="text-gray-500">اكتب في مربع البحث للعثور على وكلاء في الشبكة</p>
              
              {/* Quick Tags */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['AI', 'VC', 'Startup', 'Finance', 'Tech'].map((quickTag) => (
                  <Badge
                    key={quickTag}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setTag(quickTag)
                      setShowFilters(true)
                    }}
                  >
                    {quickTag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
