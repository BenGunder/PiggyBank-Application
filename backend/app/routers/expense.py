from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.connection import get_db
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.routers.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        expense_data = expense.model_dump()
        if expense_data.get("date") is None:
            expense_data["date"] = datetime.utcnow()
        
        db_expense = Expense(**expense_data, user_id=current_user.id)
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)
        return db_expense
    except Exception as e:
        db.rollback()
        print(f"Error creating expense: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create expense: {str(e)}")


@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    budget_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    try:
        query = db.query(Expense).filter(Expense.user_id == current_user.id)
        
        if category:
            query = query.filter(Expense.category == category)
        if budget_id:
            query = query.filter(Expense.budget_id == budget_id)
        
        expenses = query.offset(skip).limit(limit).all()
        return expenses
    except Exception as e:
        print(f"Error fetching expenses: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch expenses: {str(e)}")


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    update_data = expense_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)
    
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()
    return None


@router.get("/analytics/summary")
def get_expense_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.budget import Budget
    
    # Get all user's budgets
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    
    # Get all user's expenses
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).order_by(Expense.created_at.desc()).all()
    
    # Calculate spending limit (sum of all budget amounts)
    spending_limit = sum(budget.amount for budget in budgets)
    
    # Group expenses by budget
    budget_breakdown = {}
    budgetless_expenses = []
    
    for budget in budgets:
        budget_expenses = [e for e in expenses if e.budget_id == budget.id]
        total_spent = sum(e.amount for e in budget_expenses)
        usage_percentage = (total_spent / budget.amount * 100) if budget.amount > 0 else 0
        
        # Group expenses within budget by category
        category_breakdown = {}
        for expense in budget_expenses:
            if expense.category not in category_breakdown:
                category_breakdown[expense.category] = []
            category_breakdown[expense.category].append({
                "id": expense.id,
                "amount": expense.amount,
                "description": expense.description,
                "date": expense.date.isoformat() if expense.date else None
            })
        
        budget_breakdown[budget.id] = {
            "name": budget.name,
            "amount": budget.amount,
            "spent": total_spent,
            "remaining": budget.amount - total_spent,
            "usage_percentage": usage_percentage,
            "category_breakdown": category_breakdown
        }
    
    # Handle budgetless expenses
    budgetless = [e for e in expenses if e.budget_id is None]
    budgetless_total = sum(e.amount for e in budgetless)
    
    # Group budgetless expenses by category
    budgetless_categories = {}
    for expense in budgetless:
        if expense.category not in budgetless_categories:
            budgetless_categories[expense.category] = []
        budgetless_categories[expense.category].append({
            "id": expense.id,
            "amount": expense.amount,
            "description": expense.description,
            "date": expense.date.isoformat() if expense.date else None
        })
    
    total_expenses = sum(e.amount for e in expenses)
    
    # Find most expensive budget
    most_expensive_budget = None
    max_spent = 0
    for budget_id, budget_data in budget_breakdown.items():
      if budget_data['spent'] > max_spent:
        max_spent = budget_data['spent']
        most_expensive_budget = budget_data
    
    # Get recent expenses (top 10)
    recent_expenses = []
    for expense in expenses[:10]:
        recent_expenses.append({
            "id": expense.id,
            "amount": expense.amount,
            "category": expense.category,
            "description": expense.description,
            "date": expense.date.isoformat() if expense.date else None,
            "budget_id": expense.budget_id,
            "budget_name": next((b.name for b in budgets if b.id == expense.budget_id), None)
        })
    
    return {
        "spending_limit": spending_limit,
        "total_expenses": total_expenses,
        "expense_count": len(expenses),
        "budget_breakdown": budget_breakdown,
        "budgetless": {
            "total": budgetless_total,
            "category_breakdown": budgetless_categories
        },
        "most_expensive_budget": most_expensive_budget,
        "recent_expenses": recent_expenses
    }
