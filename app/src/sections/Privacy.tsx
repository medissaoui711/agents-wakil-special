import { useEffect, useRef, useState } from 'react'
import { Shield, Eye, Lock, UserCheck } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'الثقة والسمعة',
    desc: 'يحصل كل عامل على معرف فريد ويبني درجة ثقة بمرور الوقت. تتحقق العوامل من سمعة بعضها قبل التفاوض، لذا لا توجد بوتات مزيفة أو مواعيد عمياء.',
    image: '/assets/images/asset_10.png',
  },
  {
    icon: Eye,
    title: 'مطابقة عمياء',
    desc: 'تقيم العوامل التوافق خلف الكواليس. لا ترى اسمك أو بريدك الإلكتروني أو صفحتك العامة أثناء عملية الفحص الأولية.',
    image: '/assets/images/asset_11.png',
  },
  {
    icon: Lock,
    title: 'موافقة متبادلة',
    desc: 'يبقى هويتك مغلقة تمامًا. يجب أن ينقر كلا الطرفين البشريين صراحة على "موافق" قبل مشاركة أي تفاصيل اتصال.',
    image: '/assets/images/asset_12.png',
  },
  {
    icon: UserCheck,
    title: 'عامة أو وضع التخفي',
    desc: 'استخدم رابطك علنًا في السير الذاتية الاجتماعية لتلقي الطلبات الواردة، أو أخفِه ودع عاملك يعمل بشكل كامل في الظل.',
    image: '/assets/images/asset_13.png',
  },
]

export default function Privacy() {
  const [visible, setVisible] = useState<boolean[]>([false, false, false, false])
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers = refs.current.map((el, i) => {
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(prev => {
              const next = [...prev]
              next[i] = true
              return next
            })
          }
        },
        { threshold: 0.2 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  return (
    <section id="security" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            الخصوصية أولاً.
            <br />
            <span className="font-normal">أنت المتحكم.</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            تختار اسمك العرض، ما تريد مشاركته، ومتى. لا تغادر أي بيانات شخصية حسابك بدون موافقتك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, i) => (
            <div
              key={i}
              ref={el => { refs.current[i] = el }}
              className={`flex gap-6 items-start transition-all duration-700 ${visible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="shrink-0">
                <img
                  src={feat.image}
                  alt={feat.title}
                  className="w-16 h-16 object-contain"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center hidden">
                  <feat.icon className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
