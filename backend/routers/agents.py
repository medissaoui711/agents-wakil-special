import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy import select, join
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import AgentProfile, Handle
from schemas import AgentProfileCreate, AgentProfileResponse

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/network", response_model=List[AgentProfileResponse])
async def get_network(db: AsyncSession = Depends(get_db)):
    """Get all public agents in the network (for visualization)"""
    # Query agent profiles joined with handles
    query = select(
        AgentProfile,
        Handle.handle.label("handle_name")
    ).select_from(
        join(AgentProfile, Handle, AgentProfile.handle_id == Handle.id)
    ).where(
        AgentProfile.is_public == True
    ).order_by(
        AgentProfile.created_at.desc()
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    if not rows:
        # Return empty list - frontend will use fallback data
        return []
    
    # Map database results to response schema
    agents = []
    for agent, handle_name in rows:
        # Parse tags from JSON string
        tags = []
        if agent.tags:
            try:
                tags = json.loads(agent.tags)
            except json.JSONDecodeError:
                tags = agent.tags.split(",") if "," in agent.tags else [agent.tags]
        
        agents.append(AgentProfileResponse(
            id=agent.id,
            handle_id=agent.handle_id,
            handle=handle_name,
            display_name=agent.display_name,
            role=agent.role,
            country=agent.country,
            tags=tags,
            bio=agent.bio,
            is_public=agent.is_public
        ))
    
    return agents


@router.get("/{handle}", response_model=AgentProfileResponse)
async def get_agent(handle: str, db: AsyncSession = Depends(get_db)):
    """Get single agent profile by handle"""
    # Find handle first
    handle_query = select(Handle).where(Handle.handle == handle)
    handle_result = await db.execute(handle_query)
    handle_record = handle_result.scalar_one_or_none()
    
    if not handle_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="العنوان غير موجود"
        )
    
    # Get agent profile
    query = select(AgentProfile).where(
        AgentProfile.handle_id == handle_record.id,
        AgentProfile.is_public == True
    )
    result = await db.execute(query)
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الملف الشخصي غير موجود أو خاص"
        )
    
    # Parse tags
    tags = []
    if agent.tags:
        try:
            tags = json.loads(agent.tags)
        except json.JSONDecodeError:
            tags = agent.tags.split(",") if "," in agent.tags else [agent.tags]
    
    return AgentProfileResponse(
        id=agent.id,
        handle_id=agent.handle_id,
        handle=handle_record.handle,
        display_name=agent.display_name,
        role=agent.role,
        country=agent.country,
        tags=tags,
        bio=agent.bio,
        is_public=agent.is_public
    )


@router.get("/search")
async def search_agents(
    q: str = "",
    role: str = "",
    country: str = "",
    tag: str = "",
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Search agents by query, role, country, or tag"""
    from sqlalchemy import or_, and_
    
    query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(AgentProfile.is_public == True)
    
    # Apply filters
    if q:
        search_filter = or_(
            Handle.handle.ilike(f"%{q}%"),
            AgentProfile.display_name.ilike(f"%{q}%"),
            AgentProfile.bio.ilike(f"%{q}%")
        )
        query = query.where(search_filter)
    
    if role:
        query = query.where(AgentProfile.role.ilike(f"%{role}%"))
    
    if country:
        query = query.where(AgentProfile.country.ilike(f"%{country}%"))
    
    if tag:
        query = query.where(AgentProfile.tags.ilike(f"%{tag}%"))
    
    query = query.limit(limit)
    
    result = await db.execute(query)
    agents = []
    
    for agent, handle in result.all():
        tags = []
        if agent.tags:
            try:
                tags = json.loads(agent.tags)
            except:
                tags = agent.tags.split(",") if "," in agent.tags else [agent.tags]
        
        agents.append({
            "id": agent.id,
            "handle": handle,
            "display_name": agent.display_name,
            "role": agent.role,
            "country": agent.country,
            "tags": tags,
            "bio": agent.bio
        })
    
    return {"results": agents, "count": len(agents)}


@router.post("/", response_model=AgentProfileResponse)
async def create_agent(
    profile: AgentProfileCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create agent profile for a handle"""
    # TODO: Implement with authentication check
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="قريبًا"
    )


@router.post("/{agent_id}/chat")
async def chat_with_agent(
    agent_id: int,
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """Chat with an AI agent and get a response"""
    from services.ai_service import ai_service
    
    message = request.get('message')
    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message is required"
        )
    
    # Get agent profile
    query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(AgentProfile.id == agent_id)
    
    result = await db.execute(query)
    agent_row = result.first()
    
    if not agent_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الوكيل غير موجود"
        )
    
    agent, handle = agent_row
    
    # Prepare agent profile for AI service
    agent_profile = {
        'id': agent.id,
        'handle': handle,
        'role': agent.role or '',
        'country': agent.country or '',
        'bio': agent.bio or '',
        'tags': []
    }
    
    # Parse tags
    if agent.tags:
        try:
            agent_profile['tags'] = json.loads(agent.tags)
        except json.JSONDecodeError:
            agent_profile['tags'] = agent.tags.split(",") if "," in agent.tags else [agent.tags]
    
    # Generate AI response
    response_text = await ai_service.generate_agent_response(
        agent_profile,
        message
    )
    
    return {
        "agent_id": agent_id,
        "handle": handle,
        "message": message,
        "response": response_text,
        "timestamp": datetime.utcnow().isoformat()
    }
