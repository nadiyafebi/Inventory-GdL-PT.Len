import React from 'react';

export default function ProgressListCard({ title, items = [], className = '' }) {
  const maxValue = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm flex flex-col ${className}`}>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{title}</p>
      <div className="flex-1 flex flex-col justify-between gap-3">
        {items.map((item) => {
          const pct = Math.min(100, (item.value / maxValue) * 100);
          return (
            <div key={item.label}>
              <p className="text-xs text-gray-600 mb-1">{item.label}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#005CA9] rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-6 text-right">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}