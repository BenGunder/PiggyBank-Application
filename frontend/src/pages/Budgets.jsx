import React, { useState, useEffect } from 'react';
import { budgetAPI, expenseAPI } from '../services/api';
import { Plus, Edit2, Trash2, DollarSign, Filter } from 'lucide-react';
import CategoryPieChart from '../components/CategoryPieChart';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetAnalytics, setBudgetAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    period: 'monthly',
    category: '',
  });
  const [categoryFilters, setCategoryFilters] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, analyticsRes] = await Promise.all([
        budgetAPI.getAll(),
        expenseAPI.getAnalytics(),
      ]);
      setBudgets(budgetsRes.data);
      setBudgetAnalytics(analyticsRes.data.budget_breakdown || {});
    } catch (err) {
      setError('Failed to load budgets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await budgetAPI.update(editingBudget.id, formData);
      } else {
        await budgetAPI.create(formData);
      }
      setShowModal(false);
      setEditingBudget(null);
      setFormData({ name: '', amount: '', period: 'monthly', category: '' });
      fetchData();
    } catch (err) {
      setError(editingBudget ? 'Failed to update budget' : 'Failed to create budget');
      console.error(err);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      amount: budget.amount,
      period: budget.period,
      category: budget.category || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await budgetAPI.delete(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete budget');
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBudget(null);
    setFormData({ name: '', amount: '', period: 'monthly', category: '' });
    setError('');
  };

  const setCategoryFilter = (budgetId, category) => {
    setCategoryFilters(prev => ({
      ...prev,
      [budgetId]: prev[budgetId] === category ? null : category
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-1">Manage your budget plans</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="card text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-600 mb-4">Create your first budget to start tracking your finances</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const analytics = budgetAnalytics[budget.id];
            const spent = analytics?.spent || 0;
            const remaining = budget.amount - spent;
            const usagePercentage = analytics?.usage_percentage || 0;
            const categoryBreakdown = analytics?.category_breakdown || {};
            const isOverBudget = remaining < 0;
            const currentFilter = categoryFilters[budget.id];
            
            // Get all expenses for this budget
            const allExpenses = Object.values(categoryBreakdown).flat();
            const filteredExpenses = currentFilter 
              ? (categoryBreakdown[currentFilter] || [])
              : allExpenses;
            
            return (
              <div key={budget.id} className="card">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{budget.name}</h3>
                      <p className="text-xs text-gray-600 capitalize">{budget.period}</p>
                    </div>
                    <span className={`text-sm font-bold px-2 py-1 rounded ${isOverBudget ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {isOverBudget ? 'OVER BUDGET' : 'ON TRACK'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-1 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Left - Stats */}
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Budget</p>
                      <p className="text-base font-bold text-gray-900">{formatCurrency(budget.amount)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Spent</p>
                      <p className="text-base font-bold text-gray-900">{formatCurrency(spent)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Remaining</p>
                      <p className={`text-base font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Percent Used</p>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-gray-900">{usagePercentage.toFixed(1)}%</p>
                        <div className="flex-grow h-2 bg-gray-200 rounded">
                          <div
                            className={`${getUsageColor(usagePercentage)} h-2 rounded transition-all`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right - Pie Chart */}
                  <div>
                    <CategoryPieChart categoryBreakdown={categoryBreakdown} totalBudget={budget.amount} />
                  </div>
                </div>

                {/* Expense List */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-900">Expenses</h4>
                    {Object.keys(categoryBreakdown).length > 0 && (
                      <div className="flex items-center gap-1">
                        <Filter className="w-3 h-3 text-gray-500" />
                        <select
                          value={currentFilter || 'all'}
                          onChange={(e) => setCategoryFilter(budget.id, e.target.value === 'all' ? null : e.target.value)}
                          className="text-xs border border-gray-300 rounded px-1 py-1"
                        >
                          <option value="all">All</option>
                          {Object.keys(categoryBreakdown).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="max-h-32 overflow-auto">
                    {filteredExpenses.length > 0 ? (
                      <div className="space-y-1">
                        {filteredExpenses.map((expense) => (
                          <div key={expense.id} className="flex justify-between items-center text-xs p-1 bg-gray-50 rounded">
                            <div className="flex-1 truncate">
                              <p className="font-medium text-gray-900 truncate">{expense.description || 'No description'}</p>
                              <p className="text-gray-600 truncate">{expense.category}</p>
                            </div>
                            <span className="font-medium text-gray-900 ml-2">{formatCurrency(expense.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-2">No expenses</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingBudget ? 'Edit Budget' : 'Create Budget'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="e.g., Monthly Groceries"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  id="period"
                  name="period"
                  className="input"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category (Optional)
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  className="input"
                  placeholder="e.g., Food, Transportation"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingBudget ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
