from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import (
    HandleCheckRequest, HandleCheckResponse, 
    HandleReserveRequest, HandleReserveResponse,
    HandleClaimRequest, HandleResponse, StatsResponse
)
from services.handle_service import HandleService
from services.auth_service import AuthService

router = APIRouter(prefix="/handles", tags=["handles"])


@router.get("/check/{handle}", response_model=HandleCheckResponse)
async def check_handle(handle: str, db: AsyncSession = Depends(get_db)):
    """Check if a handle is available"""
    available = await HandleService.check_availability(db, handle)
    
    message = None
    if not available:
        message = "العنوان محجوز. جرب اسمًا آخر."
    
    return HandleCheckResponse(
        available=available,
        handle=handle,
        message=message
    )


@router.post("/reserve", response_model=HandleReserveResponse)
async def reserve_handle(request: HandleReserveRequest, db: AsyncSession = Depends(get_db)):
    """Reserve a handle for 10 minutes"""
    # Check if already reserved by someone else
    if not await HandleService.check_availability(db, request.handle):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="العنوان غير متاح"
        )
    
    handle_record = await HandleService.reserve_handle(db, request.handle, request.email)
    
    if not handle_record:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="حدث خطأ في الحجز"
        )
    
    return HandleReserveResponse(
        success=True,
        handle=handle_record.handle,
        expires_at=handle_record.expires_at,
        message=f"تم حجز العنوان @{handle_record.handle} لمدة 10 دقائق"
    )


@router.post("/claim", response_model=HandleResponse)
async def claim_handle(request: HandleClaimRequest, db: AsyncSession = Depends(get_db)):
    """Claim a handle (creates user account)"""
    # 1. Create user account
    user = await AuthService.create_user(db, request.email, request.password)
    
    # 2. Claim the handle
    handle_record = await HandleService.claim_handle(db, request.handle, user.id)
    
    if not handle_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="لا يمكن المطالبة بالعنوان. قد تكون انتهت صلاحية الحجز."
        )
    
    return HandleResponse(
        id=handle_record.id,
        handle=handle_record.handle,
        status=handle_record.status,
        created_at=handle_record.created_at
    )


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get handle statistics for display"""
    stats = await HandleService.get_stats(db)
    return StatsResponse(
        total_handles=stats["total_handles"],
        claimed_handles=stats["claimed_handles"],
        available_handles=stats["available_handles"],
        total_agents=stats["claimed_handles"]  # Same for now
    )
