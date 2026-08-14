from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class ExpenseBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    budget_id: Optional[int] = None

    @field_validator('amount')
    @classmethod
    def amount_must_be_positive(cls, v):
        if v < 0:
            raise ValueError('Amount must be positive')
        return v


class ExpenseCreate(ExpenseBase):
    date: Optional[datetime] = None


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    budget_id: Optional[int] = None


class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int
    date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
