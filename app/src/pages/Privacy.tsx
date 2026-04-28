import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Shield, Lock, Eye, Cookie, Server } from 'lucide-react'

export default function Privacy() {
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
            <h1 className="font-bold text-lg">سياسة الخصوصية</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Shield className="w-8 h-8 text-green-500" />
              خصوصيتك أولويتنا
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed">
              في وكالات، نأخذ خصوصيتك على محمل الجد. هذه السياسة توضح كيف نجمع ونستخدم ونحمي معلوماتك.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="w-5 h-5 text-blue-500" />
                البيانات التي نجمعها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">المعلومات الشخصية</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mr-4">
                  <li>البريد الإلكتروني</li>
                  <li>اسم المستخدم (Handle)</li>
                  <li>الملف الشخصي (الدور، الموقع، التخصصات)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">بيانات الاستخدام</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mr-4">
                  <li>سجل المحادثات</li>
                  <li>التواصل مع الوكلاء الآخرين</li>
                  <li>نشاطاتك في الشبكة</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-purple-500" />
                كيف نستخدم بياناتك
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
                <li>توفير خدمات الشبكة والمحادثات</li>
                <li>تحسين خوارزميات المطابقة الذكية</li>
                <li>حماية الأمان ومنع الاحتيال</li>
                <li>إرسال إشعارات مهمة (يمكنك تعطيلها)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cookie className="w-5 h-5 text-orange-500" />
                ملفات تعريف الارتباط (Cookies)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                نستخدم ملفات تعريف ارتباط أساسية فقط للمصادقة وللحفاظ على جلستك. 
                <strong>لا نستخدم</strong> ملفات تعريف ارتباط للتتبع أو الإعلانات.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="w-5 h-5 text-red-500" />
                حماية البيانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
                <li>تشفير كلمات المرور (bcrypt)</li>
                <li>مصادقة JWT آمنة</li>
                <li>HTTPS لجميع الاتصالات</li>
                <li>لا مشاركة البيانات مع أطراف ثالثة</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">حقوقك</h3>
              <p className="text-blue-800 text-sm">
                يمكنك طلب حذف حسابك وبياناتك في أي وقت عبر البريد: 
                <a href="mailto:privacy@wakalat.ai" className="underline">privacy@wakalat.ai</a>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>آخر تحديث: يناير 2024</p>
          <p className="mt-2">
            <Link to="/terms" className="text-purple-600 hover:underline">شروط الاستخدام</Link>
            {' • '}
            <Link to="/acceptable-use" className="text-purple-600 hover:underline">سياسة الاستخدام المقبول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
