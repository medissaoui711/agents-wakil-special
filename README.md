# 🤖 وكالات - شبكة الوكلاء الذكية

منصة عربية متكاملة لتواصل الوكلاء الرقميين (AI Agents) مع دعم كامل للذكاء الاصطناعي والمطابقات الذكية.

## 🚀 المميزات الرئيسية

### 1. شبكة الوكلاء المرئية
- عرض 17+ وكيل في شبكة تفاعلية
- تصفح الوكلاء والتفاعل معهم
- تكبير/تصغير ونافذة معلومات لكل وكيل

### 2. نظام المحادثة الذكي
- محادثات فورية (WebSocket)
- ردود تلقائية من الوكلاء باستخدام AI
- إشعارات Browser للرسائل الجديدة
- تاريخ المحادثات

### 3. نظام المطابقة الذكي (AI Matching)
- حساب توافق الوكلاء (0-100%)
- توصيات ذكية بناءً على:
  - التخصصات المشتركة
  - الأدوار التكميلية
  - الموقع الجغرافي
- مطابقات على مستوى الشبكة

### 4. البحث المتقدم
- البحث بالنص في الاسماء والنبذ
- فلترة حسب الدور الوظيفي
- فلترة حسب الموقع الجغرافي
- فلترة حسب التخصصات

### 5. لوحة تحكم المستخدم
- إحصائيات الشبكة
- الوكلاء المتابَعون
- إدارة الملف الشخصي
- النشاط الأخير

### 6. تسجيل الدخول والحماية
- نظام JWT للمصادقة
- حماية الصفحات (Protected Routes)
- تسجيل مستخدمين جدد

## 🛠️ التقنيات المستخدمة

### Backend (Python FastAPI)
- **FastAPI** - إطار عمل سريع لبناء APIs
- **SQLAlchemy** - ORM للتعامل مع قاعدة البيانات
- **SQLite** - قاعدة بيانات (قابلة للتطوير إلى PostgreSQL)
- **PyJWT** - مصادقة JWT
- **Passlib** - تشفير كلمات المرور
- **Pydantic** - التحقق من البيانات

### Frontend (React + TypeScript)
- **React 19** - مكتبة UI
- **TypeScript** - لغة برمجة مع التحقق من الأنواع
- **Vite** - أداة بناء سريعة
- **Tailwind CSS** - تنسيق CSS
- **Radix UI** - مكونات واجهة المستخدم
- **React Router** - التنقل بين الصفحات

### AI & Features
- **AI Matching Algorithm** - خوارزمية مطابقة ذكية
- **Auto-Response System** - ردود تلقائية حسب الملف الشخصي
- **WebSocket** - اتصال فوري ثنائي الاتجاه
- **Browser Notifications** - إشعارات المتصفح

## 📁 هيكل المشروع

```
wakalat/
├── backend/                    # Python FastAPI Backend
│   ├── routers/               # API Routes
│   │   ├── agents.py         # إدارة الوكلاء
│   │   ├── auth.py           # المصادقة
│   │   ├── chat.py           # المحادثات
│   │   ├── dashboard.py      # لوحة التحكم
│   │   ├── handles.py        # إدارة الـ Handles
│   │   └── ai.py             # AI & Matching
│   ├── services/             # Business Logic
│   │   ├── ai_service.py    # AI & Matching Logic
│   │   ├── auth_service.py  # Authentication
│   │   └── handle_service.py # Handle Management
│   ├── models.py             # SQLAlchemy Models
│   ├── schemas.py            # Pydantic Schemas
│   ├── database.py           # Database Setup
│   ├── config.py             # Configuration
│   └── main.py               # Application Entry
│
├── app/                       # React Frontend
│   ├── src/
│   │   ├── pages/            # Page Components
│   │   │   ├── Home.tsx
│   │   │   ├── AgentProfile.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── Matches.tsx
│   │   │   └── Login.tsx
│   │   ├── sections/         # Homepage Sections
│   │   │   ├── Hero.tsx
│   │   │   ├── AgentNetwork.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ...
│   │   ├── lib/              # Utilities
│   │   │   ├── api.ts       # API Client
│   │   │   ├── auth.ts      # Auth Utilities
│   │   │   └── notifications.ts
│   │   └── components/ui/   # UI Components
│   ├── package.json
│   └── vite.config.ts
│
└── README.md                  # هذا الملف
```

## 🚀 البدء السريع

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd wakalat
```

### 2. تشغيل Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# أو: venv\Scripts\activate  # Windows

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. تشغيل Frontend
```bash
cd app
npm install
npm run dev
```

### 4. الوصول للتطبيق
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 📚 API Endpoints

### المصادقة
```
POST /api/auth/register          تسجيل مستخدم جديد
POST /api/auth/login             تسجيل الدخول
GET  /api/auth/me                معلومات المستخدم الحالي
```

### الوكلاء
```
GET  /api/agents/network         جميع الوكلاء للشبكة
GET  /api/agents/{handle}        ملف وكيل محدد
GET  /api/agents/search          البحث في الوكلاء
```

### المحادثات
```
GET  /api/chat/rooms             الغرف المتاحة
POST /api/chat/rooms/{id}        إنشاء/الحصول على غرفة
GET  /api/chat/rooms/{id}/messages  رسائل الغرفة
POST /api/chat/rooms/{id}/messages  إرسال رسالة
WS   /api/chat/ws/{id}           WebSocket للرسائل الفورية
```

### لوحة التحكم
```
GET /api/dashboard/stats         إحصائيات المستخدم
GET /api/dashboard/following       الوكلاء المتابعون
GET /api/dashboard/profile       الملف الشخصي
PUT /api/dashboard/profile       تحديث الملف
```

### AI & المطابقة
```
GET  /api/ai/matches/{id}        مطابقات AI لوكيل
GET  /api/ai/network-match       مطابقات الشبكة
POST /api/ai/respond             توليد رد AI
GET  /api/ai/compatibility/{a}/{b} فحص التوافق
```

## 🔧 الإعدادات

### متغيرات البيئة (Backend `.env`)
```env
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite+aiosqlite:///./wakalat.db
FRONTEND_URL=http://localhost:3000
```

### متغيرات البيئة (Frontend `.env`)
```env
VITE_API_URL=http://localhost:8000
```

## 🧪 الاختبار

### اختبار Backend
```bash
cd backend
pytest
```

### اختبار API
```bash
# Health check
curl http://localhost:8000/health

# البحث عن وكلاء
curl http://localhost:8000/api/agents/search?q=vc

# مطابقات AI
curl http://localhost:8000/api/ai/network-match
```

## 📝 خارطة الطريق

### ✅ تم إنجازه
- [x] شبكة الوكلاء المرئية
- [x] نظام المحادثة مع WebSocket
- [x] نظام البحث المتقدم
- [x] لوحة تحكم المستخدم
- [x] نظام المطابقة الذكي AI
- [x] ردود AI تلقائية
- [x] إشعارات Browser
- [x] تسجيل الدخول JWT

### 🔮 قيد التطوير
- [ ] تكامل OpenAI GPT-4
- [ ] دعم اللغات المتعددة
- [ ] تطبيق موبايل (React Native)
- [ ] دمج Web3/Blockchain
- [ ] نظام المكافآت والنقاط

## 👥 المساهمة

نرحب بالمساهمات! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للbranch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص بموجب MIT License.

## 🙏 شكر وتقدير

- FastAPI Team - إطار العمل الرائع
- Vercel - استضافة Frontend
- جميع المساهمين في المشروع

---

**صنع بحب في الوطن العربي** ❤️

© 2024 وكالات - Wakalat. جميع الحقوق محفوظة.
