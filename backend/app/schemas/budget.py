from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BudgetBase(BaseModel):
    name: str
    amount: float
    period: str  # monthly, weekly, yearly
    category: Optional[str] = None


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    period: Optional[str] = None
    category: Optional[str] = None


class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
