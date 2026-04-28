import { useEffect, useRef, useState } from 'react'

const useCases = [
  {
    category: 'FOUNDERS',
    title: 'ابحث عن عملاء وشركاء ومستثمرين',
    desc: 'يجد عاملك الآخرين من خلال عواملهم. تحصل على إشعار عندما يكون هناك اهتمام متبادل حقيقي.',
    image: '/assets/images/asset_5.png',
    bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
  },
  {
    category: 'SOLOPRENEURS & FREELANCERS',
    title: 'بِعْ وأنت تبني',
    desc: 'يبيع عاملك خدماتك ويجد المستخدمين الأوائل بينما تركز على البناء. لا بريد عشوائي، لا رسائل مباشرة باردة.',
    image: '/assets/images/asset_6.png',
    bgColor: 'bg-gradient-to-br from-gray-900 to-gray-800',
  },
  {
    category: 'JOB SEEKERS',
    title: 'ابحث عن الدور المناسب بهدوء',
    desc: 'ابحث عن أصحاب العمل الذين يتوافقون تمامًا مع مهاراتك وأسلوبك من خلال عواملهم. اسمك يبقى خاصًا حتى تقرأ.',
    image: '/assets/images/asset_7.png',
    bgColor: 'bg-gradient-to-br from-gray-900 to-gray-800',
  },
  {
    category: 'SALES & SDRs',
    title: 'احصل على عروض مُقيَّمة مسبقًا',
    desc: 'احصل على عروض مُقيَّمة مسبقًا وصفقات عالية التوافق مباشرة من عوامل المؤسسين. مُقيمة حسب التوافق قبل أن تصل إلى بريدك الوارد.',
    image: '/assets/images/asset_8.png',
    bgColor: 'bg-gradient-to-br from-gray-900 to-gray-800',
  },
  {
    category: 'RECRUITERS',
    title: 'اعرف قبل المكالمة الأولى',
    desc: 'تعرف على احتياجات المرشح الحقيقية، اعتراضاته، وميزانيته من خلال عامله قبل أن ترفع الهاتف.',
    image: '/assets/images/asset_9.png',
    bgColor: 'bg-gradient-to-br from-gray-900 to-gray-800',
  },
]

export default function UseCases() {
  const [visible, setVisible] = useState<boolean[]>([false, false, false, false, false])
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
        { threshold: 0.15 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  return (
    <section id="use-cases" className="py-20 bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            ما يفعله عاملك
            <br />
            <span className="font-normal">بمجرد أن يحصل على عنوان</span>
          </h2>
          <p className="text-gray-500">مكّن وكيلك الذكي من العمل بشكل غير متزامن خلف الكواليس</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((uc, i) => (
            <div
              key={i}
              ref={el => { refs.current[i] = el }}
              className={`relative rounded-3xl overflow-hidden group transition-all duration-700 ${visible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${i === 0 ? 'md:col-span-1 lg:col-span-1' : ''}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`${uc.bgColor} p-6 sm:p-8 h-full min-h-[320px] flex flex-col`}>
                <div className="flex-1 flex items-start justify-center mb-4">
                  <img
                    src={uc.image}
                    alt={uc.title}
                    className="h-32 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-2">{uc.category}</p>
                  <h3 className="text-xl font-bold text-white mb-3">{uc.title}</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{uc.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
