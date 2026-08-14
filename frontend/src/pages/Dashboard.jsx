import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import { DollarSign, TrendingUp, Wallet, AlertCircle, Target, PiggyBank } from 'lucide-react';
import BudgetPieChart from '../components/BudgetPieChart';
import CategoryPieChart from '../components/CategoryPieChart';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const analyticsRes = await expenseAPI.getAnalytics();
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const budgetBreakdown = analytics?.budget_breakdown || {};
  const budgetless = analytics?.budgetless || { total: 0, category_breakdown: {} };
  const spendingLimit = analytics?.spending_limit || 0;
  const totalExpenses = analytics?.total_expenses || 0;
  const overallUsage = spendingLimit > 0 ? (totalExpenses / spendingLimit * 100) : 0;
  const mostExpensiveBudget = analytics?.most_expensive_budget;
  const recentExpenses = analytics?.recent_expenses || [];

  // Get top 3 budgets by amount spent
  const topBudgets = Object.entries(budgetBreakdown)
    .sort(([, a], [, b]) => b.spent - a.spent)
    .slice(0, 3)
    .map(([id, budget]) => ({ id, ...budget }));

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your financial activity</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        {/* Left Column - 1/3 width */}
        <div className="col-span-4 flex flex-col gap-3">
          {/* Stats */}
          <div className="card flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-primary-600" />
                  <span className="text-base text-gray-600">Spending Limit</span>
                </div>
                <span className="text-xl font-bold text-primary-600">{formatCurrency(spendingLimit)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary-600" />
                  <span className="text-xs text-gray-600">Total Spent</span>
                </div>
                <span className="text-base font-bold text-gray-900">{formatCurrency(totalExpenses)}</span>
              </div>
              {mostExpensiveBudget && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary-600" />
                    <span className="text-xs text-gray-600">Most Expensive Budget</span>
                  </div>
                  <span className="text-base font-bold text-gray-900">{mostExpensiveBudget.name}</span>
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary-600" />
                    <span className="text-xs text-gray-600">Overall Usage</span>
                  </div>
                  <span className="text-base font-bold text-gray-900">{overallUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded">
                  <div
                    className={`${getUsageColor(overallUsage)} h-3 rounded transition-all`}
                    style={{ width: `${Math.min(overallUsage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Spending Limit Breakdown */}
          <div className="card flex-grow">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Spending Limit Breakdown</h2>
            <BudgetPieChart budgetBreakdown={budgetBreakdown} budgetless={budgetless} />
          </div>
        </div>

        {/* Right Column - 2/3 width */}
        <div className="col-span-8 flex flex-col gap-3">
          {/* Top 3 Budgets */}
          <div className="card flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Top Budgets</h2>
            {topBudgets.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {topBudgets.map((budget) => {
                  const remaining = budget.amount - budget.spent;
                  const isOverBudget = remaining < 0;
                  return (
                    <div key={budget.id} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-gray-900">{budget.name}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${isOverBudget ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {isOverBudget ? 'OVER BUDGET' : 'ON TRACK'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{budget.usage_percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded">
                        <div
                          className={`${getUsageColor(budget.usage_percentage)} h-1.5 rounded`}
                          style={{ width: `${Math.min(budget.usage_percentage, 100)}%` }}
                        />
                      </div>
                      {Object.keys(budget.category_breakdown).length > 0 && (
                        <div className="mt-2">
                          <CategoryPieChart categoryBreakdown={budget.category_breakdown} totalBudget={budget.amount} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No budgets yet</p>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="card flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Expenses</h2>
            <div className="overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              {recentExpenses.length > 0 ? (
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Description</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Category</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Budget</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-gray-100">
                        <td className="px-3 py-2 text-gray-600">
                          {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-3 py-2 text-gray-900">
                          {expense.description || 'No description'}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{expense.category}</td>
                        <td className="px-3 py-2 text-gray-600">{expense.budget_name || 'None'}</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-gray-500">No recent expenses</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
