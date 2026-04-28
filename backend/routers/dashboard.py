"""
Dashboard Router - User dashboard with stats, following, and profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from database import get_db
from models import User, Handle, AgentProfile, Connection, Message, ChatRoom
from schemas import AgentProfileResponse, StatsResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    current_user_id: int = 1,  # TODO: Get from auth
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard statistics for current user"""
    
    # Get user's handle
    handle_query = select(Handle).where(Handle.user_id == current_user_id)
    handle_result = await db.execute(handle_query)
    handle = handle_result.scalar_one_or_none()
    
    if not handle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="لم يتم العثور على حساب"
        )
    
    # Get agent profile
    profile_query = select(AgentProfile).where(AgentProfile.handle_id == handle.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    
    # Count connections
    connections_query = select(func.count(Connection.id)).where(
        (Connection.from_agent_id == profile.id) | (Connection.to_agent_id == profile.id),
        Connection.status == "accepted"
    ) if profile else select(func.count(Connection.id)).where(False)
    
    connections_result = await db.execute(connections_query)
    connections_count = connections_result.scalar()
    
    # Count chat rooms
    rooms_query = select(func.count(ChatRoom.id)).where(
        (ChatRoom.agent1_id == profile.id) | (ChatRoom.agent2_id == profile.id)
    ) if profile else select(func.count(ChatRoom.id)).where(False)
    
    rooms_result = await db.execute(rooms_query)
    rooms_count = rooms_result.scalar()
    
    # Count unread messages
    unread_query = select(func.count(Message.id)).where(
        Message.sender_id != profile.id,
        Message.is_read == False
    ) if profile else select(func.count(Message.id)).where(False)
    
    unread_result = await db.execute(unread_query)
    unread_count = unread_result.scalar()
    
    return {
        "handle": handle.handle,
        "profile_completed": profile is not None,
        "connections": connections_count,
        "active_chats": rooms_count,
        "unread_messages": unread_count,
        "profile_views": 0,  # TODO: Implement view tracking
        "joined_at": handle.claimed_at or handle.created_at
    }


@router.get("/following", response_model=List[AgentProfileResponse])
async def get_following(
    current_user_id: int = 1,  # TODO: Get from auth
    db: AsyncSession = Depends(get_db)
):
    """Get list of agents the user is following/connected to"""
    
    # Get user's agent profile
    handle_query = select(Handle).where(Handle.user_id == current_user_id)
    handle_result = await db.execute(handle_query)
    handle = handle_result.scalar_one_or_none()
    
    if not handle:
        return []
    
    profile_query = select(AgentProfile).where(AgentProfile.handle_id == handle.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    
    if not profile:
        return []
    
    # Get accepted connections
    connections_query = select(Connection).where(
        (Connection.from_agent_id == profile.id) | (Connection.to_agent_id == profile.id),
        Connection.status == "accepted"
    )
    
    connections_result = await db.execute(connections_query)
    connections = connections_result.scalars().all()
    
    # Get other agent IDs
    other_agent_ids = []
    for conn in connections:
        other_id = conn.to_agent_id if conn.from_agent_id == profile.id else conn.from_agent_id
        other_agent_ids.append(other_id)
    
    if not other_agent_ids:
        return []
    
    # Get agent profiles
    agents_query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(AgentProfile.id.in_(other_agent_ids))
    
    agents_result = await db.execute(agents_query)
    agents = []
    
    for agent, handle_name in agents_result.all():
        import json
        tags = []
        if agent.tags:
            try:
                tags = json.loads(agent.tags)
            except:
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


@router.get("/profile")
async def get_my_profile(
    current_user_id: int = 1,  # TODO: Get from auth
    db: AsyncSession = Depends(get_db)
):
    """Get current user's profile"""
    
    handle_query = select(Handle, User).join(
        User, Handle.user_id == User.id
    ).where(Handle.user_id == current_user_id)
    
    result = await db.execute(handle_query)
    row = result.first()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الملف غير موجود"
        )
    
    handle, user = row
    
    # Get agent profile
    profile_query = select(AgentProfile).where(AgentProfile.handle_id == handle.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    
    import json
    
    return {
        "email": user.email,
        "handle": handle.handle,
        "joined_at": user.created_at,
        "profile": {
            "display_name": profile.display_name if profile else None,
            "role": profile.role if profile else None,
            "country": profile.country if profile else None,
            "tags": json.loads(profile.tags) if profile and profile.tags else [],
            "bio": profile.bio if profile else None,
            "is_public": profile.is_public if profile else True
        } if profile else None
    }


@router.put("/profile")
async def update_profile(
    profile_data: dict,
    current_user_id: int = 1,  # TODO: Get from auth
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    
    # Get user's handle
    handle_query = select(Handle).where(Handle.user_id == current_user_id)
    handle_result = await db.execute(handle_query)
    handle = handle_result.scalar_one_or_none()
    
    if not handle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="لم يتم العثور على حساب"
        )
    
    # Get or create agent profile
    profile_query = select(AgentProfile).where(AgentProfile.handle_id == handle.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    
    import json
    
    if not profile:
        # Create new profile
        profile = AgentProfile(
            handle_id=handle.id,
            display_name=profile_data.get("display_name"),
            role=profile_data.get("role"),
            country=profile_data.get("country"),
            tags=json.dumps(profile_data.get("tags", [])),
            bio=profile_data.get("bio"),
            is_public=profile_data.get("is_public", True)
        )
        db.add(profile)
    else:
        # Update existing
        if "display_name" in profile_data:
            profile.display_name = profile_data["display_name"]
        if "role" in profile_data:
            profile.role = profile_data["role"]
        if "country" in profile_data:
            profile.country = profile_data["country"]
        if "tags" in profile_data:
            profile.tags = json.dumps(profile_data["tags"])
        if "bio" in profile_data:
            profile.bio = profile_data["bio"]
        if "is_public" in profile_data:
            profile.is_public = profile_data["is_public"]
        
        profile.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(profile)
    
    return {
        "success": True,
        "message": "تم تحديث الملف بنجاح"
    }


@router.get("/recent-activity")
async def get_recent_activity(
    current_user_id: int = 1,  # TODO: Get from auth
    db: AsyncSession = Depends(get_db)
):
    """Get recent activity (messages, connections)"""
    
    # Get user's agent profile
    handle_query = select(Handle).where(Handle.user_id == current_user_id)
    handle_result = await db.execute(handle_query)
    handle = handle_result.scalar_one_or_none()
    
    if not handle:
        return {"activities": []}
    
    profile_query = select(AgentProfile).where(AgentProfile.handle_id == handle.id)
    profile_result = await db.execute(profile_query)
    profile = profile_result.scalar_one_or_none()
    
    if not profile:
        return {"activities": []}
    
    # Get recent messages
    messages_query = select(Message, ChatRoom).join(
        ChatRoom, Message.room_id == ChatRoom.id
    ).where(
        Message.sender_id != profile.id,
        (ChatRoom.agent1_id == profile.id) | (ChatRoom.agent2_id == profile.id)
    ).order_by(desc(Message.created_at)).limit(10)
    
    messages_result = await db.execute(messages_query)
    
    activities = []
    for msg, room in messages_result.all():
        other_id = room.agent2_id if room.agent1_id == profile.id else room.agent1_id
        
        activities.append({
            "type": "message",
            "content": msg.content[:50] + "..." if len(msg.content) > 50 else msg.content,
            "from_agent_id": other_id,
            "timestamp": msg.created_at,
            "is_read": msg.is_read
        })
    
    return {"activities": activities}
