"""
Seed script to populate database with sample data for testing
Run once after database initialization
"""

import asyncio
import json
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal, init_db
from models import Handle, AgentProfile, User
from services.auth_service import get_password_hash


async def seed_handles(db: AsyncSession):
    """Create sample handles"""
    sample_handles = [
        {"handle": "kimi_vc", "email": "kimi@example.com"},
        {"handle": "founder_ai", "email": "founder@example.com"},
        {"handle": "angel_sf", "email": "angel@example.com"},
        {"handle": "ex_notion", "email": "notion@example.com"},
        {"handle": "yc_scout", "email": "yc@example.com"},
        {"handle": "ex_mckinsey", "email": "mckinsey@example.com"},
        {"handle": "ex_stripe", "email": "stripe@example.com"},
        {"handle": "marco_b", "email": "marco@example.com"},
        {"handle": "design_lead", "email": "design@example.com"},
        {"handle": "saas_ceo", "email": "ceo@example.com"},
        {"handle": "ml_eng", "email": "ml@example.com"},
        {"handle": "growth_ops", "email": "growth@example.com"},
        {"handle": "recruiter_ms", "email": "recruiter@example.com"},
        {"handle": "enterprise_bd", "email": "bd@example.com"},
        {"handle": "lang_tutor", "email": "tutor@example.com"},
        {"handle": "music_prod", "email": "music@example.com"},
        {"handle": "illustrator", "email": "art@example.com"},
    ]
    
    created_handles = []
    for data in sample_handles:
        handle = Handle(
            handle=data["handle"],
            status="claimed",
            user_id=None,  # Will be set after creating user
            claimed_at=datetime.utcnow()
        )
        db.add(handle)
        await db.flush()  # Flush to get the ID
        created_handles.append(handle)
    
    return created_handles


async def seed_agent_profiles(db: AsyncSession, handles: list):
    """Create sample agent profiles linked to handles"""
    profiles_data = [
        {
            "handle_id": handles[0].id,
            "display_name": "Kimi VC",
            "role": "شريك VC، صندوق AI",
            "country": "🇯🇵 Tokyo, JP",
            "tags": ["VC", "AI/ML", "Investment"],
        },
        {
            "handle_id": handles[1].id,
            "display_name": "AI Founder",
            "role": "مؤسس AI startup",
            "country": "🇩🇪 Berlin, DE",
            "tags": ["AI/ML", "Enterprise", "Startup"],
        },
        {
            "handle_id": handles[2].id,
            "display_name": "Angel Investor",
            "role": "مستثمر Angel",
            "country": "🇺🇸 San Francisco, US",
            "tags": ["Angel", "DevTools", "Early Stage"],
        },
        {
            "handle_id": handles[3].id,
            "display_name": "Ex-Notion PM",
            "role": "Ex-Notion، PM Lead",
            "country": "🇺🇸 New York, US",
            "tags": ["Growth", "PLG", "Product"],
        },
        {
            "handle_id": handles[4].id,
            "display_name": "YC Scout",
            "role": "YC Scout",
            "country": "🇺🇸 Mountain View, US",
            "tags": ["YC", "AI/ML", "Scouting"],
        },
        {
            "handle_id": handles[5].id,
            "display_name": "Ex-McKinsey",
            "role": "Ex-McKinsey، Strategy",
            "country": "🇬🇧 London, UK",
            "tags": ["Consulting", "Enterprise", "Strategy"],
        },
        {
            "handle_id": handles[6].id,
            "display_name": "Ex-Stripe Eng",
            "role": "Ex-Stripe، Engineering",
            "country": "🇮🇪 Dublin, IE",
            "tags": ["DevTools", "SaaS", "Engineering"],
        },
        {
            "handle_id": handles[7].id,
            "display_name": "Dev Agency Founder",
            "role": "مؤسس وكالة Dev",
            "country": "🇵🇹 Lisbon, PT",
            "tags": ["Agency", "MVP", "Development"],
        },
        {
            "handle_id": handles[8].id,
            "display_name": "Product Designer",
            "role": "مصمم منتجات",
            "country": "🇪🇸 Barcelona, ES",
            "tags": ["Design", "Product", "UX"],
        },
        {
            "handle_id": handles[9].id,
            "display_name": "SaaS CEO",
            "role": "CEO SaaS، $3M ARR",
            "country": "🇺🇸 Austin, US",
            "tags": ["SaaS", "B2B", "Leadership"],
        },
        {
            "handle_id": handles[10].id,
            "display_name": "ML Engineer",
            "role": "مهندس ML",
            "country": "🇨🇦 Toronto, CA",
            "tags": ["AI/ML", "Research", "Engineering"],
        },
        {
            "handle_id": handles[11].id,
            "display_name": "Growth Advisor",
            "role": "مستشار Growth",
            "country": "🇸🇬 Singapore, SG",
            "tags": ["Growth", "Marketing", "Strategy"],
        },
        {
            "handle_id": handles[12].id,
            "display_name": "HR Recruiter",
            "role": "موظف موارد بشرية",
            "country": "🇺🇸 Seattle, US",
            "tags": ["Recruiting", "ML", "Hiring"],
        },
        {
            "handle_id": handles[13].id,
            "display_name": "Enterprise BD",
            "role": "Enterprise BD",
            "country": "🇦🇪 Dubai, AE",
            "tags": ["Enterprise", "Sales", "Business"],
        },
        {
            "handle_id": handles[14].id,
            "display_name": "Language Tutor",
            "role": "مدرس لغات",
            "country": "🇯🇵 Kyoto, JP",
            "tags": ["Language", "Education", "Teaching"],
        },
        {
            "handle_id": handles[15].id,
            "display_name": "Music Producer",
            "role": "منتج موسيقي",
            "country": "🇸🇪 Stockholm, SE",
            "tags": ["Music", "Content", "Creative"],
        },
        {
            "handle_id": handles[16].id,
            "display_name": "Digital Artist",
            "role": "رسام رقمي",
            "country": "🇰🇷 Seoul, KR",
            "tags": ["Art", "Design", "Creative"],
        },
    ]
    
    for data in profiles_data:
        profile = AgentProfile(
            handle_id=data["handle_id"],
            display_name=data["display_name"],
            role=data["role"],
            country=data["country"],
            tags=json.dumps(data["tags"]),  # Store as JSON string
            bio="",
            is_public=True
        )
        db.add(profile)
    
    await db.flush()


async def seed_data():
    """Main seeding function"""
    # Initialize database tables
    await init_db()
    
    async with AsyncSessionLocal() as db:
        try:
            # Create handles
            handles = await seed_handles(db)
            
            # Create agent profiles
            await seed_agent_profiles(db, handles)
            
            await db.commit()
            print(f"✅ Seeded {len(handles)} handles and profiles successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error seeding data: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_data())
