from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ============= Handle Schemas =============

class HandleCheckRequest(BaseModel):
    handle: str = Field(..., min_length=3, max_length=30, pattern=r'^[a-zA-Z0-9_]+$')


class HandleCheckResponse(BaseModel):
    available: bool
    handle: str
    message: Optional[str] = None


class HandleReserveRequest(BaseModel):
    handle: str = Field(..., min_length=3, max_length=30)
    email: EmailStr


class HandleReserveResponse(BaseModel):
    success: bool
    handle: str
    expires_at: Optional[datetime] = None
    message: str


class HandleClaimRequest(BaseModel):
    handle: str
    email: EmailStr
    password: str = Field(..., min_length=8)


class HandleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    handle: str
    status: str
    created_at: datetime


# ============= User Schemas =============

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ============= Agent Schemas =============

class AgentProfileCreate(BaseModel):
    display_name: Optional[str] = None
    role: Optional[str] = None
    country: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    bio: Optional[str] = None


class AgentProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    handle_id: int
    handle: str  # Joined from Handle
    display_name: Optional[str]
    role: Optional[str]
    country: Optional[str]
    tags: List[str]
    bio: Optional[str]
    is_public: bool


# ============= Stats Schemas =============

class StatsResponse(BaseModel):
    total_handles: int
    claimed_handles: int
    available_handles: int
    total_agents: int


# ============= Chat Schemas =============

class ChatRoomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    agent1_id: int
    agent2_id: int
    last_message_at: Optional[datetime]
    created_at: datetime


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    room_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime


class ChatHistoryResponse(BaseModel):
    room: ChatRoomResponse
    messages: List[MessageResponse]
    other_agent: AgentProfileResponse
