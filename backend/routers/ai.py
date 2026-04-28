"""
AI Router - Intelligent matching and AI-powered responses
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import json
import os

from database import get_db
from models import AgentProfile, Handle
from services.ai_service import ai_service
from schemas import AgentProfileResponse

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/matches/{agent_id}")
async def get_agent_matches(
    agent_id: int,
    limit: int = 5,
    db: AsyncSession = Depends(get_db)
):
    """Get AI-recommended matches for an agent"""
    
    # Get the source agent
    source_query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(AgentProfile.id == agent_id)
    
    source_result = await db.execute(source_query)
    source_row = source_result.first()
    
    if not source_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الوكيل غير موجود"
        )
    
    source_agent, source_handle = source_row
    source_data = {
        'id': source_agent.id,
        'handle': source_handle,
        'role': source_agent.role or '',
        'country': source_agent.country or '',
        'tags': json.loads(source_agent.tags) if source_agent.tags else []
    }
    
    # Get all other public agents
    candidates_query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(
        AgentProfile.is_public == True,
        AgentProfile.id != agent_id
    )
    
    candidates_result = await db.execute(candidates_query)
    candidates = []
    
    for agent, handle in candidates_result.all():
        candidates.append({
            'id': agent.id,
            'handle': handle,
            'role': agent.role or '',
            'country': agent.country or '',
            'tags': json.loads(agent.tags) if agent.tags else []
        })
    
    # Use AI service to find matches
    matches = ai_service.find_matches(source_data, candidates, limit=limit)
    
    return {
        "agent_id": agent_id,
        "matches": matches,
        "count": len(matches)
    }


@router.get("/network-match")
async def get_network_wide_matches(
    db: AsyncSession = Depends(get_db)
):
    """Get potential matches across the entire network"""
    
    # Get all agents
    agents_query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(AgentProfile.is_public == True)
    
    agents_result = await db.execute(agents_query)
    all_agents = []
    
    for agent, handle in agents_result.all():
        all_agents.append({
            'id': agent.id,
            'handle': handle,
            'role': agent.role or '',
            'country': agent.country or '',
            'tags': json.loads(agent.tags) if agent.tags else []
        })
    
    # Find high-potential matches across the network
    high_potential_matches = []
    
    for i, agent1 in enumerate(all_agents):
        for agent2 in all_agents[i+1:]:
            score = ai_service.calculate_compatibility_score(agent1, agent2)
            
            if score > 75:  # Only high-potential matches
                high_potential_matches.append({
                    'agent1': {
                        'id': agent1['id'],
                        'handle': agent1['handle'],
                        'role': agent1['role'],
                        'country': agent1['country']
                    },
                    'agent2': {
                        'id': agent2['id'],
                        'handle': agent2['handle'],
                        'role': agent2['role'],
                        'country': agent2['country']
                    },
                    'compatibility_score': round(score, 1),
                    'reason': ai_service._generate_match_reason(agent1, agent2, score)
                })
    
    # Sort by score
    high_potential_matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
    
    return {
        "matches": high_potential_matches[:20],
        "count": len(high_potential_matches)
    }


@router.post("/respond")
async def generate_agent_response(
    request: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """Generate AI response for an agent"""
    
    agent_id = request.get('agent_id')
    message = request.get('message')
    conversation_history = request.get('conversation_history', [])
    
    if not agent_id or not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="agent_id و message مطلوبان"
        )
    
    # Get agent profile
    agent_query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(AgentProfile.id == agent_id)
    
    agent_result = await db.execute(agent_query)
    agent_row = agent_result.first()
    
    if not agent_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الوكيل غير موجود"
        )
    
    agent, handle = agent_row
    
    agent_profile = {
        'id': agent.id,
        'handle': handle,
        'role': agent.role or '',
        'country': agent.country or '',
        'bio': agent.bio or '',
        'tags': json.loads(agent.tags) if agent.tags else []
    }
    
    # Generate response
    response_text = await ai_service.generate_agent_response(
        agent_profile,
        message,
        conversation_history
    )
    
    return {
        "agent_id": agent_id,
        "response": response_text,
        "generated_at": "2024-01-01T00:00:00",  # TODO: Add real timestamp
        "model": "mock-v1" if ai_service.mock_mode else "gpt-4"
    }


@router.post("/summarize")
async def summarize_conversation(
    request: Dict[str, Any]
):
    """Summarize a conversation"""
    
    messages = request.get('messages', [])
    
    if not messages:
        return {
            "summary": "لا توجد رسائل للتلخيص",
            "key_topics": [],
            "sentiment": "neutral"
        }
    
    summary = ai_service.generate_conversation_summary(messages)
    
    return {
        "summary": summary,
        "message_count": len(messages),
        "key_topics": [],  # TODO: Extract actual topics
        "sentiment": "positive"  # TODO: Analyze sentiment
    }


@router.get("/compatibility/{agent1_id}/{agent2_id}")
async def check_compatibility(
    agent1_id: int,
    agent2_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Check compatibility between two specific agents"""
    
    # Get both agents
    query = select(AgentProfile, Handle.handle).join(
        Handle, AgentProfile.handle_id == Handle.id
    ).where(AgentProfile.id.in_([agent1_id, agent2_id]))
    
    result = await db.execute(query)
    agents = {}
    
    for agent, handle in result.all():
        agents[agent.id] = {
            'id': agent.id,
            'handle': handle,
            'role': agent.role or '',
            'country': agent.country or '',
            'tags': json.loads(agent.tags) if agent.tags else []
        }
    
    if len(agents) != 2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="أحد الوكلاء أو كلاهما غير موجود"
        )
    
    agent1 = agents[agent1_id]
    agent2 = agents[agent2_id]
    
    score = ai_service.calculate_compatibility_score(agent1, agent2)
    
    return {
        "agent1": {
            'id': agent1['id'],
            'handle': agent1['handle']
        },
        "agent2": {
            'id': agent2['id'],
            'handle': agent2['handle']
        },
        "compatibility_score": round(score, 1),
        "match_reason": ai_service._generate_match_reason(agent1, agent2, score),
        "recommendation": "متطابق عالي" if score > 75 else "متطابق جيد" if score > 50 else "متطابق ضعيف"
    }
