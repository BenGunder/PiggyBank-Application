import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const BUDGET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

const BudgetPieChart = ({ budgetBreakdown, budgetless }) => {
  const chartData = [];
  const budgetInfo = {}; // Store budget info for tooltip lookup
  let colorIndex = 0;

  Object.entries(budgetBreakdown).forEach(([budgetId, budget]) => {
    const color = BUDGET_COLORS[colorIndex % BUDGET_COLORS.length];
    
    // Store budget info for tooltip
    budgetInfo[budgetId] = {
      name: budget.name,
      spent: budget.spent,
      remaining: budget.remaining,
      total: budget.amount,
      usagePercentage: budget.usage_percentage
    };
    
    // Add single slice for the entire budget
    chartData.push({
      name: budget.name,
      value: budget.amount,
      fill: color,
      budgetId: budgetId,
      type: 'budget'
    });
    
    // Add a small spacer slice between budgets
    if (colorIndex < Object.keys(budgetBreakdown).length - 1) {
      chartData.push({
        name: 'spacer',
        value: 0.01, // Very small value
        fill: 'transparent',
        budgetId: 'spacer',
        type: 'spacer'
      });
    }
    
    colorIndex++;
  });

  // Add budgetless expenses if any
  if (budgetless && budgetless.total > 0) {
    chartData.push({
      name: 'Other Expenses',
      value: budgetless.total,
      fill: '#9CA3AF', // Gray for budgetless
      budgetId: 'budgetless',
      type: 'budgetless'
    });
    budgetInfo['budgetless'] = {
      name: 'Other Expenses',
      spent: budgetless.total,
      remaining: 0,
      total: budgetless.total,
      usagePercentage: 100
    };
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No budget data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const info = budgetInfo[data.budgetId];
      
      if (data.budgetId === 'spacer') return null;
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{info.name}</p>
          <p className="text-gray-600">Spent: ${info.spent.toFixed(2)}</p>
          <p className="text-gray-600">Remaining: ${info.remaining.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-col gap-2">
        {payload.map((entry, index) => {
          if (entry.value === 'spacer') return null;
          const info = budgetInfo[chartData.find(d => d.name === entry.value)?.budgetId];
          if (!info) return null;
          
          const isOtherExpenses = info.name === 'Other Expenses';
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex flex-col">
                <span className="text-sm text-gray-700 font-medium">{info.name}</span>
                <span className="text-xs text-gray-500">
                  ${info.total.toFixed(2)} {isOtherExpenses ? '' : `• ${info.usagePercentage.toFixed(1)}% used`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-6">
      <div className="flex-shrink-0">
        <CustomLegend payload={chartData.filter(d => d.type !== 'spacer').map(d => ({ value: d.name, color: d.fill }))} />
      </div>
      <div className="flex-grow" style={{ height: '350px', width: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  stroke={entry.type === 'spacer' ? 'transparent' : 'white'}
                  strokeWidth={entry.type === 'spacer' ? 0 : 2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BudgetPieChart;
