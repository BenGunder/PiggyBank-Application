import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORY_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

const CategoryPieChart = ({ categoryBreakdown, totalBudget }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const chartData = Object.entries(categoryBreakdown).map(([category, expenses], index) => ({
    name: category,
    value: expenses.reduce((sum, e) => sum + e.amount, 0),
    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    expenses: expenses
  }));

  // Add "Unused" category if there's remaining budget
  const totalSpent = chartData.reduce((sum, d) => sum + d.value, 0);
  const unused = totalBudget - totalSpent;
  if (unused > 0) {
    chartData.push({
      name: 'Unused',
      value: unused,
      fill: '#E5E7EB',
      expenses: []
    });
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No category data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const expenses = data.expenses;
      const displayExpenses = expenses.slice(0, 5); // Show max 5 expenses
      const hasMore = expenses.length > 5;
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <p className="font-medium text-gray-900 mb-2">{data.name}</p>
          <p className="text-gray-600 mb-2">Total: ${data.value.toFixed(2)}</p>
          {data.name !== 'Unused' && expenses.length > 0 && (
            <div className="space-y-1">
              {displayExpenses.map((expense) => (
                <div key={expense.id} className="text-xs text-gray-600">
                  {expense.description || 'No description'} - ${expense.amount.toFixed(2)}
                </div>
              ))}
              {hasMore && (
                <div className="text-xs text-gray-400 italic">
                  ... and {expenses.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => {
          const data = chartData.find(d => d.name === entry.value);
          if (!data) return null;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex flex-col">
                <span className="text-xs text-gray-700 font-medium">{data.name}</span>
                <span className="text-xs text-gray-500">
                  ${data.value.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-4">
      <CustomLegend payload={chartData.map(d => ({ value: d.name, color: d.fill }))} />
      <div style={{ height: '200px', width: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryPieChart;
