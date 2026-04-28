"""
Chat Router - Real-time messaging between agents
Supports both HTTP REST API and WebSocket for real-time
"""

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from typing import List, Optional
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import json

from database import get_db
from models import ChatRoom, Message, AgentProfile, Handle
from schemas import MessageCreate, MessageResponse, ChatRoomResponse, ChatHistoryResponse, AgentProfileResponse

router = APIRouter(prefix="/chat", tags=["chat"])

# Store active WebSocket connections
active_connections: dict[int, WebSocket] = {}


@router.post("/rooms/{agent_id}", response_model=ChatRoomResponse)
async def create_or_get_room(
    agent_id: int,
    current_agent_id: int = 1,  # TODO: Get from auth token
    db: AsyncSession = Depends(get_db)
):
    """Create or get existing chat room between two agents"""
    
    # Check if room already exists
    query = select(ChatRoom).where(
        or_(
            and_(ChatRoom.agent1_id == current_agent_id, ChatRoom.agent2_id == agent_id),
            and_(ChatRoom.agent1_id == agent_id, ChatRoom.agent2_id == current_agent_id)
        )
    )
    result = await db.execute(query)
    existing_room = result.scalar_one_or_none()
    
    if existing_room:
        return existing_room
    
    # Create new room
    new_room = ChatRoom(
        agent1_id=min(current_agent_id, agent_id),
        agent2_id=max(current_agent_id, agent_id)
    )
    db.add(new_room)
    await db.commit()
    await db.refresh(new_room)
    
    return new_room


@router.get("/rooms", response_model=List[ChatRoomResponse])
async def get_my_rooms(
    current_agent_id: int = 1,  # TODO: Get from auth token
    db: AsyncSession = Depends(get_db)
):
    """Get all chat rooms for current agent"""
    
    query = select(ChatRoom).where(
        or_(
            ChatRoom.agent1_id == current_agent_id,
            ChatRoom.agent2_id == current_agent_id
        )
    ).order_by(desc(ChatRoom.last_message_at))
    
    result = await db.execute(query)
    rooms = result.scalars().all()
    
    return rooms


@router.get("/rooms/{room_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    room_id: int,
    limit: int = 50,
    current_agent_id: int = 1,  # TODO: Get from auth token
    db: AsyncSession = Depends(get_db)
):
    """Get messages in a chat room"""
    
    # Verify room access
    room_query = select(ChatRoom).where(ChatRoom.id == room_id)
    room_result = await db.execute(room_query)
    room = room_result.scalar_one_or_none()
    
    if not room or (room.agent1_id != current_agent_id and room.agent2_id != current_agent_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية الوصول لهذه المحادثة"
        )
    
    # Get messages
    query = select(Message).where(
        Message.room_id == room_id
    ).order_by(desc(Message.created_at)).limit(limit)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    # Mark messages as read
    for msg in messages:
        if msg.sender_id != current_agent_id and not msg.is_read:
            msg.is_read = True
    
    await db.commit()
    
    return list(reversed(messages))


@router.post("/rooms/{room_id}/messages", response_model=MessageResponse)
async def send_message(
    room_id: int,
    message: MessageCreate,
    current_agent_id: int = 1,  # TODO: Get from auth token
    db: AsyncSession = Depends(get_db)
):
    """Send a message in a chat room"""
    
    # Verify room access
    room_query = select(ChatRoom).where(ChatRoom.id == room_id)
    room_result = await db.execute(room_query)
    room = room_result.scalar_one_or_none()
    
    if not room or (room.agent1_id != current_agent_id and room.agent2_id != current_agent_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية الإرسال لهذه المحادثة"
        )
    
    # Create message
    new_message = Message(
        room_id=room_id,
        sender_id=current_agent_id,
        content=message.content
    )
    db.add(new_message)
    
    # Update room last message time
    room.last_message_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(new_message)
    
    # Notify other agent via WebSocket if connected
    other_agent_id = room.agent2_id if room.agent1_id == current_agent_id else room.agent1_id
    if other_agent_id in active_connections:
        await active_connections[other_agent_id].send_text(json.dumps({
            "type": "new_message",
            "room_id": room_id,
            "message": {
                "id": new_message.id,
                "sender_id": current_agent_id,
                "content": message.content,
                "created_at": new_message.created_at.isoformat()
            }
        }))
    
    return new_message


@router.get("/history/{agent_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    agent_id: int,
    current_agent_id: int = 1,  # TODO: Get from auth token
    db: AsyncSession = Depends(get_db)
):
    """Get chat history with a specific agent"""
    
    # Get or create room
    room_query = select(ChatRoom).where(
        or_(
            and_(ChatRoom.agent1_id == current_agent_id, ChatRoom.agent2_id == agent_id),
            and_(ChatRoom.agent1_id == agent_id, ChatRoom.agent2_id == current_agent_id)
        )
    )
    result = await db.execute(room_query)
    room = result.scalar_one_or_none()
    
    if not room:
        # Create room
        room = ChatRoom(
            agent1_id=min(current_agent_id, agent_id),
            agent2_id=max(current_agent_id, agent_id)
        )
        db.add(room)
        await db.commit()
        await db.refresh(room)
    
    # Get messages
    messages_query = select(Message).where(
        Message.room_id == room.id
    ).order_by(desc(Message.created_at)).limit(50)
    
    messages_result = await db.execute(messages_query)
    messages = list(reversed(messages_result.scalars().all()))
    
    # Get other agent profile
    profile_query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(AgentProfile.id == agent_id)
    
    profile_result = await db.execute(profile_query)
    profile_row = profile_result.first()
    
    if not profile_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الوكيل غير موجود"
        )
    
    agent_profile, handle = profile_row
    
    other_agent = AgentProfileResponse(
        id=agent_profile.id,
        handle_id=agent_profile.handle_id,
        handle=handle,
        display_name=agent_profile.display_name,
        role=agent_profile.role,
        country=agent_profile.country,
        tags=agent_profile.tags.split(",") if agent_profile.tags else [],
        bio=agent_profile.bio,
        is_public=agent_profile.is_public
    )
    
    return ChatHistoryResponse(
        room=room,
        messages=messages,
        other_agent=other_agent
    )


# ============= WebSocket for Real-time Chat =============

@router.websocket("/ws/{agent_id}")
async def websocket_endpoint(websocket: WebSocket, agent_id: int):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()
    
    # Register connection
    active_connections[agent_id] = websocket
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Echo back confirmation
            await websocket.send_text(json.dumps({
                "type": "ack",
                "message_id": message_data.get("temp_id")
            }))
            
    except WebSocketDisconnect:
        # Remove connection
        if agent_id in active_connections:
            del active_connections[agent_id]
    except Exception as e:
        print(f"WebSocket error: {e}")
        if agent_id in active_connections:
            del active_connections[agent_id]
