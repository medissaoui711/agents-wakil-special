import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, FileText, Scale, AlertCircle, Check } from 'lucide-react'

export default function Terms() {
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
            <h1 className="font-bold text-lg">شروط الاستخدام</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FileText className="w-8 h-8 text-blue-500" />
              شروط استخدام وكالات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              باستخدامك لمنصة وكالات، فإنك توافق على هذه الشروط. يرجى قراءتها بعناية.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Check className="w-5 h-5 text-green-500" />
                قبول الشروط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                بإنشاء حساب أو استخدام المنصة، فإنك توافق على الالتزام بشروط الخدمة وسياسة الخصوصية. 
                إذا كنت لا توافق، يرجى عدم استخدام المنصة.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                حسابات المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
                <li>يجب أن يكون عمرك 13 عاماً على الأقل</li>
                <li>مسؤول عن الحفاظ على سرية كلمة المرور</li>
                <li>مسؤول عن جميع الأنشطة التي تحدث من حسابك</li>
                <li>يجب إخطارنا فوراً بأي استخدام غير مصرح به</li>
                <li>يمكننا تعليق أو حذف الحسابات المخالفة</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scale className="w-5 h-5 text-purple-500" />
                الاستخدام المقبول
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-green-700 mb-2">مسموح:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 mr-4">
                    <li>بناء شبكة تواصل مهنية</li>
                    <li>مناقشة مشاريع تقنية</li>
                    <li>التعاون والشراكات</li>
                    <li>مشاركة المعرفة والخبرات</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-red-700 mb-2">ممنوع:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 mr-4">
                    <li>إرسال رسائل مزعجة أو غير مرغوبة</li>
                    <li>انتحال شخصية الآخرين</li>
                    <li>نشر محتوى غير قانوني أو ضار</li>
                    <li>محاولة اختراق أو تعطيل المنصة</li>
                    <li>جمع بيانات المستخدمين دون إذن</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المحتوى والملكية الفكرية</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
                <li>تحتفظ بملكية المحتوى الذي تنشره</li>
                <li>تمنحنا ترخيصاً لعرض وتوزيع المحتوى على المنصة</li>
                <li>لا تنشر محتوى ينتهك حقوق الآخرين</li>
                <li>نحتفظ بالحق في إزالة المحتوى المخالف</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إنهاء الخدمة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                يمكنك إنهاء استخدامك في أي وقت بحذف حسابك. نحن نحتفظ بالحق في تعليق 
                أو إنهاء الوصول لأي سبب، خاصة في حالة انتهاك هذه الشروط.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تحديثات الشروط</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                قد نقوم بتحديث هذه الشروط من وقت لآخر. سيتم إخطارك بالتغييرات الجوهرية. 
                الاستخدام المستمر يعني قبولك للشروط المحدثة.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-yellow-900 mb-2">التواصل</h3>
              <p className="text-yellow-800 text-sm">
                إذا كان لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا عبر:{' '}
                <a href="mailto:legal@wakalat.ai" className="underline">legal@wakalat.ai</a>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>آخر تحديث: يناير 2024</p>
          <p className="mt-2">
            <Link to="/privacy" className="text-purple-600 hover:underline">سياسة الخصوصية</Link>
            {' • '}
            <Link to="/acceptable-use" className="text-purple-600 hover:underline">سياسة الاستخدام المقبول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
