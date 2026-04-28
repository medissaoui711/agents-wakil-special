"""
AI Service - Matching and response generation for agents
Uses OpenAI API or local models for intelligent matching and responses
"""

import json
import random
from typing import List, Dict, Any, Optional
from datetime import datetime

class AIService:
    """AI-powered service for agent matching and responses"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.mock_mode = api_key is None  # Use mock responses if no API key
    
    def calculate_compatibility_score(
        self,
        agent1: Dict[str, Any],
        agent2: Dict[str, Any]
    ) -> float:
        """Calculate compatibility score between two agents (0-100)"""
        score = 0.0
        
        # Tag overlap (40%)
        tags1 = set(agent1.get('tags', []))
        tags2 = set(agent2.get('tags', []))
        if tags1 and tags2:
            overlap = len(tags1 & tags2)
            total = len(tags1 | tags2)
            tag_score = (overlap / total) * 40 if total > 0 else 0
            score += tag_score
        
        # Role complementarity (30%)
        role1 = agent1.get('role', '').lower()
        role2 = agent2.get('role', '').lower()
        
        # Define complementary roles
        complementary = {
            'vc': ['startup', 'founder', 'ceo', 'entrepreneur'],
            'startup': ['vc', 'angel', 'investor', 'legal'],
            'founder': ['vc', 'mentor', 'advisor', 'legal'],
            'developer': ['product', 'designer', 'pm'],
            'designer': ['developer', 'product'],
            'mentor': ['founder', 'startup', 'junior'],
            'ai/ml': ['data', 'engineer', 'researcher'],
            'legal': ['startup', 'founder', 'ceo', 'enterprise', 'contract'],
            'lawyer': ['startup', 'founder', 'company', 'business'],
        }
        
        role_score = 0
        for key, values in complementary.items():
            if key in role1 and any(v in role2 for v in values):
                role_score = 30
                break
            if key in role2 and any(v in role1 for v in values):
                role_score = 30
                break
        
        score += role_score
        
        # Geographic compatibility (20%)
        country1 = agent1.get('country', '').lower()
        country2 = agent2.get('country', '').lower()
        
        if country1 and country2:
            if country1 == country2:
                score += 20  # Same country
            elif any(x in country1 for x in ['us', 'uk', 'ca']) and any(x in country2 for x in ['us', 'uk', 'ca']):
                score += 15  # English-speaking countries
            elif any(x in country1 for x in ['ae', 'sa', 'eg']) and any(x in country2 for x in ['ae', 'sa', 'eg']):
                score += 15  # Arab countries
        else:
            score += 10  # Neutral if no location
        
        # Activity/engagement (10%) - random for now
        score += random.uniform(5, 10)
        
        return min(100, max(0, score))
    
    def find_matches(
        self,
        agent: Dict[str, Any],
        candidates: List[Dict[str, Any]],
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Find best matching agents for a given agent"""
        
        scored_matches = []
        for candidate in candidates:
            if candidate['id'] == agent['id']:
                continue
                
            score = self.calculate_compatibility_score(agent, candidate)
            scored_matches.append({
                **candidate,
                'compatibility_score': round(score, 1),
                'match_reason': self._generate_match_reason(agent, candidate, score)
            })
        
        # Sort by score and return top matches
        scored_matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
        return scored_matches[:limit]
    
    def _generate_match_reason(
        self,
        agent1: Dict[str, Any],
        agent2: Dict[str, Any],
        score: float
    ) -> str:
        """Generate human-readable reason for the match"""
        
        tags1 = set(agent1.get('tags', []))
        tags2 = set(agent2.get('tags', []))
        overlap = tags1 & tags2
        
        role1 = agent1.get('role', '')
        role2 = agent2.get('role', '')
        
        country1 = agent1.get('country', '')
        country2 = agent2.get('country', '')
        
        reasons = []
        
        if overlap:
            reasons.append(f"تخصصات مشتركة: {', '.join(list(overlap)[:3])}")
        
        if 'vc' in role1.lower() and ('startup' in role2.lower() or 'founder' in role2.lower()):
            reasons.append("فرصة استثمارية محتملة")
        elif 'vc' in role2.lower() and ('startup' in role1.lower() or 'founder' in role1.lower()):
            reasons.append("فرصة استثمارية محتملة")
        
        if country1 == country2:
            reasons.append(f"موقع جغرافي مشترك: {country1}")
        
        if score > 80:
            reasons.append("تطابق عالي جداً")
        elif score > 60:
            reasons.append("توافق جيد")
        
        return " • ".join(reasons) if reasons else "توصية نظام"
    
    async def generate_agent_response(
        self,
        agent_profile: Dict[str, Any],
        message: str,
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """Generate AI response for an agent based on their profile"""
        
        if self.mock_mode:
            return self._generate_mock_response(agent_profile, message)
        
        # TODO: Integrate with OpenAI/Anthropic API
        # For now, return mock responses
        return self._generate_mock_response(agent_profile, message)
    
    def _generate_mock_response(
        self,
        agent_profile: Dict[str, Any],
        message: str
    ) -> str:
        """Generate contextual mock responses based on agent profile"""
        
        handle = agent_profile.get('handle', 'Agent')
        role = agent_profile.get('role', '').lower()
        tags = [t.lower() for t in agent_profile.get('tags', [])]
        
        message_lower = message.lower()
        
        # Greeting patterns
        if any(word in message_lower for word in ['مرحبا', 'hello', 'hi', 'سلام']):
            greetings = [
                f"مرحباً! أنا {handle}، كيف يمكنني مساعدتك اليوم؟",
                f"أهلاً بك! سعيد بالتواصل معك.",
                f"مرحباً! أنا هنا للمساعدة في مجال {role if role else 'عملي'}."
            ]
            return random.choice(greetings)
        
        # Investment/VC patterns
        if 'vc' in role or any(t in tags for t in ['vc', 'investment', 'funding']):
            if any(word in message_lower for word in ['استثمار', 'invest', 'funding', ' fundraise']):
                vc_responses = [
                    "أنا مهتم بسماع المزيد عن مشروعك. هل يمكنك مشاركة pitch deck؟",
                    "نحن نستثمر في مرحلة Series A/B. ما مرحلة شركتك الحالية؟",
                    "ما حجم التمويل الذي تبحث عنه وما استخداماته المخططة؟",
                    "أرى إمكانية جيدة هنا. هل يمكننا جدولة مكالمة لمناقشة التفاصيل؟"
                ]
                return random.choice(vc_responses)
        
        # Startup/Founder patterns
        if any(r in role for r in ['startup', 'founder', 'ceo']) or any(t in tags for t in ['startup', 'founder']):
            if any(word in message_lower for word in ['collaborate', 'partner', 'cooperate', 'تعاون']):
                startup_responses = [
                    "أبحث دائماً عن شراكات استراتيجية. ما مجال اهتمامك؟",
                    "مشروعي ينمو بسرعة وقد نكمل بعضنا البعض.",
                    "يمكننا مناقشة فرص التعاون. ما رؤيتك للشراكة؟"
                ]
                return random.choice(startup_responses)
        
        # Developer/Technical patterns
        if any(r in role for r in ['developer', 'engineer']) or any(t in tags for t in ['ai', 'ml', 'tech', 'software']):
            if any(word in message_lower for word in ['tech', 'code', 'development', 'ai', 'build']):
                tech_responses = [
                    "أعمل على مشاريع مثيرة في هذا المجال. ما التقنية المفضلة لديك؟",
                    "يمكنني المساعدة في التطوير التقني. ما المتطلبات التقنية لمشروعك؟",
                    "أستخدم أحدث التقنيات في تطوير الحلول."
                ]
                return random.choice(tech_responses)
        
        # Mentor/Advisor patterns
        if 'mentor' in role or any(t in tags for t in ['mentor', 'advisor']):
            mentor_responses = [
                "أحب مشاركة الخبرات والتوجيه. ما التحديات التي تواجهك؟",
                "بناء الشركات الناشئة يحتاج إلى صبر واستراتيجية.",
                "يمكنني مساعدتك في تجنب الأخطاء الشائعة في هذا المجال."
            ]
            return random.choice(mentor_responses)
        
        # Legal Advisor patterns - المستشار القانوني
        if any(r in role for r in ['legal', 'lawyer', 'attorney', 'مستشار قانوني', 'محامي']) or \
           any(t in tags for t in ['legal', 'law', 'قانون', 'عقود', 'contracts']):
            
            # Legal consultation patterns
            if any(word in message_lower for word in ['عقد', 'contract', 'اتفاقية', 'agreement']):
                contract_responses = [
                    "صياغة العقود تحتاج إلى دقة. هل يمكنك مشاركة نوع العقد المطلوب؟",
                    "أنصح بمراجعة بنود المسؤولية والتعويض في أي عقد.",
                    "هل تحتاج إلى عقد قياسي أم تخصيص لحالة محددة؟",
                    "يمكنني مراجعة العقد وإضافة شروط حماية لمصالحك."
                ]
                return random.choice(contract_responses)
            
            if any(word in message_lower for word in ['company', 'شركة', 'تأسيس', 'incorporation']):
                company_responses = [
                    "تأسيس الشركة يختلف حسب نوعها (LLC, Ltd, etc). ما نوع الشركة المقترح؟",
                    "أنصح بالتفكير في هيكل الملكية واتفاقية المساهمين من البداية.",
                    "ما الدولة التي تخطط للتأسيس فيها؟ التشريعات تختلف.",
                    "هل تحتاج إلى مساعدة في إعداد مستندات التأسيس؟"
                ]
                return random.choice(company_responses)
            
            if any(word in message_lower for word in ['ip', 'property', 'ملكية فكرية', 'براءة']):
                ip_responses = [
                    "حماية الملكية الفكرية ضرورية للشركات التقنية. هل سجّلت براءات الاختراع؟",
                    "أنصح بتسجيل العلامة التجارية في الأسواق المستهدفة مبكراً.",
                    "هل لديك NDA مع الفريق والشركاء قبل مشاركة الأفكار؟",
                    "يمكنني مراجعة اتفاقيات نقل الملكية الفكرية للموظفين."
                ]
                return random.choice(ip_responses)
            
            if any(word in message_lower for word in ['dispute', 'نزاع', 'قضية', 'litigation']):
                dispute_responses = [
                    "حل النزاعات ودياً أسرع وأقل تكلفة من التقاضي. هل جربت الوساطة؟",
                    "أحتاج إلى فهم تفاصيل القضية لإعطاء رأي قانوني دقيق.",
                    "ما المرحلة التي وصلت إليها القضية حالياً؟",
                    "أنصح بالاحتفاظ بجميع المستندات والمراسلات المتعلقة بالنزاع."
                ]
                return random.choice(dispute_responses)
            
            # General legal responses
            legal_responses = [
                "كـمستشار قانوني، أنصح دائماً بتوثيق جميع الاتفاقيات خطياً.",
                "التزام القانون المحلي والدولي مهم لنجاح أي مشروع.",
                "هل يمكنك إعطائي المزيد من التفاصيل حول الموقف القانوني؟",
                "أنصح بالاستشارة القانونية المبكرة لتجنب المشاكل المستقبلية.",
                "الامتثال الضريبي والتنظيمي أساسي لاستمرارية الشركات.",
                "يمكنني مساعدتك في مراجعة الوثائق القانونية وإعداد المستندات."
            ]
            return random.choice(legal_responses)
        
        # Default contextual responses
        default_responses = [
            f"هذا موضوع مثير للاهتمام! أنا {role if role else 'متخصص في مجالي'} ويمكنني المساعدة.",
            "أقدر تواصلك. دعنا نناقش هذا بشكل أعمق.",
            "فكرة جيدة! هل جربت التفكير في الزوايا التالية؟",
            "أرى فرصة للتعاون هنا. ما الخطوات التالية برأيك؟",
            "مشروعك يبدو واعداً. كيف يمكنني المساعدة في تسريعه؟",
            "أنا مهتم بمعرفة المزيد. هل يمكنك إعطائي تفاصيل إضافية؟"
        ]
        
        return random.choice(default_responses)
    
    def generate_conversation_summary(
        self,
        messages: List[Dict[str, str]]
    ) -> str:
        """Generate a summary of conversation for quick insights"""
        
        if not messages:
            return "لا توجد رسائل للتلخيص"
        
        # Count messages
        msg_count = len(messages)
        
        # Simple extraction of key topics (mock)
        key_topics = []
        all_text = ' '.join([m.get('content', '') for m in messages]).lower()
        
        topic_keywords = {
            'استثمار': ['investment', 'funding', 'round', 'vc'],
            'تعاون': ['collaborate', 'partner', 'cooperate', 'join'],
            'تقنية': ['tech', 'ai', 'ml', 'code', 'develop'],
            'تسويق': ['marketing', 'growth', 'sales'],
            'استشارة': ['advice', 'mentor', 'help', 'guide'],
            'قانونية': ['legal', 'law', 'contract', 'agreement', 'company'],
            'ملكية فكرية': ['ip', 'intellectual', 'patent', 'trademark']
        }
        
        for topic, keywords in topic_keywords.items():
            if any(kw in all_text for kw in keywords):
                key_topics.append(topic)
        
        summary = f"محادثة تضم {msg_count} رسائل"
        if key_topics:
            summary += f" • المواضيع: {', '.join(key_topics)}"
        
        return summary


# Export singleton
ai_service = AIService()

# Factory function for custom instances
def create_ai_service(api_key: Optional[str] = None) -> AIService:
    return AIService(api_key)
