"""
Legal Advisor Router - Specialized legal consultation endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import datetime
import json

from database import get_db
from models import AgentProfile, Handle
from services.ai_service import ai_service

router = APIRouter(prefix="/legal", tags=["legal"])


# ============= Request/Response Schemas =============

class LegalConsultationRequest(BaseModel):
    agent_id: int
    client_id: int
    question: str
    category: Optional[str] = "general"  # contract, company, ip, dispute, compliance
    context: Optional[str] = None


class LegalConsultationResponse(BaseModel):
    consultation_id: str
    agent_id: int
    question: str
    answer: str
    recommendations: List[str]
    legal_refs: Optional[List[str]] = None
    created_at: str
    follow_up_questions: List[str]


class LegalDocumentRequest(BaseModel):
    agent_id: int
    doc_type: str  # nda, contract, terms, privacy, employment
    parties: Dict[str, Any]
    key_terms: Dict[str, Any]
    jurisdiction: Optional[str] = "UAE"


# ============= Legal Consultation Endpoints =============

@router.post("/consult", response_model=LegalConsultationResponse)
async def legal_consultation(
    request: LegalConsultationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Get legal consultation from a legal advisor agent"""
    
    # Verify the agent is a legal advisor
    agent_query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(AgentProfile.id == request.agent_id)
    
    agent_result = await db.execute(agent_query)
    agent_row = agent_result.first()
    
    if not agent_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستشار القانوني غير موجود"
        )
    
    agent, handle = agent_row
    
    # Check if agent has legal role/tags
    is_legal = False
    if agent.role and any(r in agent.role.lower() for r in ['legal', 'lawyer', 'attorney', 'مستشار قانوني', 'محامي']):
        is_legal = True
    
    if agent.tags:
        tags = json.loads(agent.tags) if isinstance(agent.tags, str) else []
        if any(t.lower() in ['legal', 'law', 'قانون', 'عقود', 'contracts'] for t in tags):
            is_legal = True
    
    if not is_legal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="هذا الوكيل ليس مستشاراً قانونياً"
        )
    
    # Prepare agent profile
    agent_profile = {
        'id': agent.id,
        'handle': handle,
        'role': agent.role or '',
        'country': agent.country or '',
        'bio': agent.bio or '',
        'tags': json.loads(agent.tags) if agent.tags else []
    }
    
    # Generate legal response
    response_text = await ai_service.generate_agent_response(
        agent_profile,
        request.question
    )
    
    # Generate category-specific recommendations
    recommendations = _generate_legal_recommendations(request.category)
    
    # Generate follow-up questions
    follow_up = _generate_follow_up_questions(request.category, request.question)
    
    # Legal references based on jurisdiction
    legal_refs = _get_legal_references(request.category, "UAE")
    
    consultation_id = f"LC-{request.agent_id}-{request.client_id}-{int(datetime.utcnow().timestamp())}"
    
    return LegalConsultationResponse(
        consultation_id=consultation_id,
        agent_id=request.agent_id,
        question=request.question,
        answer=response_text,
        recommendations=recommendations,
        legal_refs=legal_refs,
        created_at=datetime.utcnow().isoformat(),
        follow_up_questions=follow_up
    )


@router.post("/document-review")
async def document_review(
    document_text: str,
    doc_type: str,
    agent_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Request legal document review from a legal advisor"""
    
    # Verify the agent
    agent_query = select(AgentProfile).where(AgentProfile.id == agent_id)
    agent_result = await db.execute(agent_query)
    agent = agent_result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستشار غير موجود"
        )
    
    # Mock document analysis
    analysis = {
        "document_type": doc_type,
        "risk_level": "medium",
        "key_clauses": [
            "بند المسؤولية (Liability Clause)",
            "بند فض النزاعات (Dispute Resolution)",
            "بند سرية المعلومات (Confidentiality)"
        ],
        "concerns": [
            "النص غير واضح في بند المسؤولية",
            "نقص شروط الحماية للطرف الأول"
        ],
        "suggestions": [
            "إضافة بند للتعويض المحدود",
            "توضيح آلية فض النزاعات",
            "إضافة فترة سماح للسداد"
        ],
        "compliance_notes": "يجب مراجعة التوافق مع قوانين حماية المستهلك المحلية"
    }
    
    return {
        "agent_id": agent_id,
        "document_type": doc_type,
        "analysis": analysis,
        "reviewed_at": datetime.utcnow().isoformat()
    }


@router.get("/templates")
async def get_legal_templates(
    category: Optional[str] = None,
    jurisdiction: Optional[str] = "UAE"
):
    """Get available legal document templates"""
    
    templates = {
        "contracts": [
            {"id": "nda-mutual", "name": "NDA متبادل", "description": "اتفاقية سرية متبادلة"},
            {"id": "service-agreement", "name": "عقد خدمات", "description": "اتفاقية تقديم خدمات"},
            {"id": "employment", "name": "عقد عمل", "description": "عقد عمل بدوام كامل"},
            {"id": "consulting", "name": "عقد استشارات", "description": "اتفاقية خدمات استشارية"}
        ],
        "company": [
            {"id": "mou-template", "name": "MOU تأسيس", "description": "مذكرة تفاهم للتأسيس"},
            {"id": "sha-template", "name": "اتفاقية مساهمين", "description": "Shareholders Agreement"},
            {"id": "founder-vesting", "name": "Founder Vesting", "description": "جدولة استحقاق المؤسسين"}
        ],
        "compliance": [
            {"id": "privacy-policy", "name": "Privacy Policy", "description": "سياسة الخصوصية"},
            {"id": "terms-of-service", "name": "Terms of Service", "description": "شروط الاستخدام"},
            {"id": "cookie-policy", "name": "Cookie Policy", "description": "سياسة الكوكيز"}
        ]
    }
    
    if category and category in templates:
        return {"templates": templates[category], "jurisdiction": jurisdiction}
    
    # Return all categories
    all_templates = []
    for cat, items in templates.items():
        for item in items:
            item["category"] = cat
            all_templates.append(item)
    
    return {"templates": all_templates, "jurisdiction": jurisdiction, "count": len(all_templates)}


@router.get("/advisors")
async def get_legal_advisors(
    country: Optional[str] = None,
    specialization: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get list of legal advisor agents"""
    
    # Query legal advisors
    query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(AgentProfile.is_public == True)
    
    # Filter by legal keywords in role/tags
    legal_keywords = ['legal', 'lawyer', 'attorney', 'مستشار قانوني', 'محامي', 'قانون']
    
    result = await db.execute(query)
    legal_advisors = []
    
    for agent, handle in result.all():
        is_legal = False
        
        if agent.role:
            role_lower = agent.role.lower()
            if any(kw in role_lower for kw in legal_keywords):
                is_legal = True
        
        if agent.tags:
            tags = json.loads(agent.tags) if isinstance(agent.tags, str) else []
            if any(t.lower() in legal_keywords or t.lower() in ['legal', 'law', 'contracts', 'عقود'] for t in tags):
                is_legal = True
        
        if is_legal:
            # Apply filters
            if country and country.lower() not in (agent.country or '').lower():
                continue
            
            legal_advisors.append({
                "id": agent.id,
                "handle": handle,
                "display_name": agent.display_name,
                "role": agent.role,
                "country": agent.country,
                "tags": json.loads(agent.tags) if agent.tags else [],
                "bio": agent.bio
            })
    
    return {
        "advisors": legal_advisors,
        "count": len(legal_advisors),
        "filters": {"country": country, "specialization": specialization}
    }


# ============= Helper Functions =============

def _generate_legal_recommendations(category: str) -> List[str]:
    """Generate category-specific legal recommendations"""
    
    recommendations = {
        "contract": [
            "تأكد من توثيق جميع التعديلات خطياً",
            "احتفظ بنسخة من كل مرحلة تفاوض",
            "استشر محامٍ قبل التوقيع على أي عقد معقد"
        ],
        "company": [
            "اختر هيكل الشركة المناسب لأهدافك",
            "أعد اتفاقية مساهمين مفصلة",
            "تأكد من الامتثال لمتطلبات الترخيص المحلية"
        ],
        "ip": [
            "سجل علامتك التجارية مبكراً",
            "استخدم NDAs مع جميع الأطراف",
            "وثق جميع ابتكاراتك بشكل منظم"
        ],
        "dispute": [
            "جرب الوساطة قبل التقاضي",
            "وثق جميع الاتصالات والمستندات",
            "استشر محامٍ قبل اتخاذ أي خطوة قانونية"
        ],
        "compliance": [
            "راجع القوانين المحلية بشكل دوري",
            "احتفظ بسجلات مالية منظمة",
            "استشر خبير ضرائب للتخطيط المالي"
        ]
    }
    
    return recommendations.get(category, recommendations["compliance"])


def _generate_follow_up_questions(category: str, question: str) -> List[str]:
    """Generate relevant follow-up questions"""
    
    question_lower = question.lower()
    
    follow_up = {
        "contract": [
            "ما قيمة العقد المتوقعة؟",
            "هل هناك طرف ثالث مشارك؟",
            "ما مدة العقد المقترحة؟"
        ],
        "company": [
            "كم عدد المؤسسين المشاركين؟",
            "ما حجم الاستثمار الأولي؟",
            "هل تخطط للتوسع دولياً؟"
        ],
        "ip": [
            "هل الابتكار مسجل حالياً؟",
            "هل هناك تراخيص سابقة؟",
            "ما الأسواق المستهدفة؟"
        ],
        "dispute": [
            "ما تفاصيل النزاع الأساسية؟",
            "هل هناك محاولات تسوية سابقة؟",
            "ما الأدلة المتوفرة؟"
        ]
    }
    
    return follow_up.get(category, [
        "هل يمكنك إعطائي المزيد من التفاصيل؟",
        "ما الجدول الزمني المتوقع؟",
        "هل هناك أي وثائق ذات صلة؟"
    ])


def _get_legal_references(category: str, jurisdiction: str) -> List[str]:
    """Get relevant legal references"""
    
    refs = {
        "UAE": {
            "contract": [
                "القانون المدني الإماراتي (المادة 125-148)",
                "قانون المعاملات التجارية الاتحادي"
            ],
            "company": [
                "القانون الاتحادي رقم 32 لسنة 2021 (الشركات)",
                "قانون الشركات في المناطق الحرة"
            ],
            "ip": [
                "القانون الاتحادي رقم 11 لسنة 2021 (الملكية الصناعية)",
                "اتفاقية باريس لحماية الملكية الصناعية"
            ],
            "dispute": [
                "قانون المرافعات المدنية والتجارية",
                "قانون التحكيم الاتحادي"
            ],
            "compliance": [
                "قانون مكافحة غسل الأموال",
                "قانون حماية البيانات (DIFC/GDPR)"
            ]
        },
        "Saudi": {
            "contract": [
                "النظام المدني السعودي",
                "نظام التجارة الإلكترونية"
            ],
            "company": [
                "نظام الشركات السعودي",
                "لوائح هيئة الاستثمار"
            ]
        },
        "Egypt": {
            "contract": [
                "القانون المدني المصري",
                "قانون التجارة"
            ],
            "company": [
                "قانون الشركات المصري رقم 159 لسنة 1981"
            ]
        }
    }
    
    jurisdiction_refs = refs.get(jurisdiction, refs["UAE"])
    return jurisdiction_refs.get(category, ["القانون المحلي المعمول به"])
