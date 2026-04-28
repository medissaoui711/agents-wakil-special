from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from models import Handle

RESERVATION_MINUTES = 10  # Handle reserved for 10 minutes


class HandleService:
    """Service for handle reservation and management"""
    
    @staticmethod
    async def check_availability(db: AsyncSession, handle: str) -> bool:
        """Check if handle is available"""
        # Normalize handle
        handle = handle.lower().strip()
        
        result = await db.execute(
            select(Handle).where(Handle.handle == handle)
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            return True
            
        # Check if reservation expired
        if existing.status == "reserved" and existing.expires_at:
            if existing.expires_at < datetime.utcnow():
                # Expired - make available again
                existing.status = "available"
                existing.reserved_at = None
                existing.expires_at = None
                existing.email = None
                await db.commit()
                return True
        
        return existing.status in ["available", "expired"]
    
    @staticmethod
    async def reserve_handle(db: AsyncSession, handle: str, email: str) -> Optional[Handle]:
        """Reserve a handle temporarily"""
        handle = handle.lower().strip()
        
        # Check availability first
        if not await HandleService.check_availability(db, handle):
            return None
        
        # Get or create handle record
        result = await db.execute(
            select(Handle).where(Handle.handle == handle)
        )
        handle_record = result.scalar_one_or_none()
        
        if not handle_record:
            handle_record = Handle(handle=handle)
            db.add(handle_record)
        
        # Update reservation
        now = datetime.utcnow()
        handle_record.status = "reserved"
        handle_record.email = email
        handle_record.reserved_at = now
        handle_record.expires_at = now + timedelta(minutes=RESERVATION_MINUTES)
        
        await db.commit()
        await db.refresh(handle_record)
        return handle_record
    
    @staticmethod
    async def claim_handle(db: AsyncSession, handle: str, user_id: int) -> Optional[Handle]:
        """Claim a reserved handle"""
        handle = handle.lower().strip()
        
        result = await db.execute(
            select(Handle).where(
                and_(
                    Handle.handle == handle,
                    Handle.status.in_(["reserved", "available"])
                )
            )
        )
        handle_record = result.scalar_one_or_none()
        
        if not handle_record:
            return None
        
        # Check reservation still valid
        if handle_record.status == "reserved" and handle_record.expires_at:
            if handle_record.expires_at < datetime.utcnow():
                return None  # Expired
        
        # Claim it
        handle_record.status = "claimed"
        handle_record.user_id = user_id
        handle_record.claimed_at = datetime.utcnow()
        handle_record.expires_at = None  # No longer needed
        
        await db.commit()
        await db.refresh(handle_record)
        return handle_record
    
    @staticmethod
    async def get_stats(db: AsyncSession) -> dict:
        """Get handle statistics"""
        total_result = await db.execute(select(Handle))
        total = len(total_result.scalars().all())
        
        claimed_result = await db.execute(
            select(Handle).where(Handle.status == "claimed")
        )
        claimed = len(claimed_result.scalars().all())
        
        reserved_result = await db.execute(
            select(Handle).where(Handle.status == "reserved")
        )
        reserved = len(reserved_result.scalars().all())
        
        return {
            "total_handles": total,
            "claimed_handles": claimed,
            "reserved_handles": reserved,
            "available_handles": total - claimed - reserved
        }
