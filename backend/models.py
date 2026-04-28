from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Index
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Optional for OAuth
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships will be defined here


class Handle(Base):
    """Handle reservation model (e.g., @kimi)"""
    __tablename__ = "handles"
    
    id = Column(Integer, primary_key=True, index=True)
    handle = Column(String(30), unique=True, index=True, nullable=False)
    user_id = Column(Integer, nullable=True)  # Null if reserved but not claimed
    email = Column(String(255), nullable=True)  # For reservation
    status = Column(String(20), default="available")  # available, reserved, claimed
    reserved_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Reservation expiry
    claimed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_handle_status', 'status'),
        Index('idx_handle_expires', 'expires_at'),
    )


class AgentProfile(Base):
    """Agent profile for the network"""
    __tablename__ = "agent_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    handle_id = Column(Integer, nullable=False)
    display_name = Column(String(100), nullable=True)
    role = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    tags = Column(String(500), nullable=True)  # JSON string of tags
    bio = Column(Text, nullable=True)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Connection(Base):
    """Connection between agents"""
    __tablename__ = "connections"
    
    id = Column(Integer, primary_key=True, index=True)
    from_agent_id = Column(Integer, nullable=False)
    to_agent_id = Column(Integer, nullable=False)
    status = Column(String(20), default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_connection_from', 'from_agent_id'),
        Index('idx_connection_to', 'to_agent_id'),
    )


class ChatRoom(Base):
    """Chat room between agents"""
    __tablename__ = "chat_rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    agent1_id = Column(Integer, nullable=False)
    agent2_id = Column(Integer, nullable=False)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_chatroom_agents', 'agent1_id', 'agent2_id'),
        Index('idx_chatroom_last_msg', 'last_message_at'),
    )


class Message(Base):
    """Chat message"""
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, nullable=False)
    sender_id = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_message_room', 'room_id'),
        Index('idx_message_sender', 'sender_id'),
        Index('idx_message_created', 'created_at'),
    )
