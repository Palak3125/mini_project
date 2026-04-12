import React from 'react';

export default function StatusBadge({ status, type = "status" }) {
  if (type === 'priority') {
    const priorityColors = {
      High: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
      Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Low: "bg-green-500/10 text-green-500 border-green-500/20"
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${priorityColors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
        {status}
      </span>
    );
  }

  const statusColors = {
    Submitted: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
    "In Review": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Resolved: "bg-green-500/10 text-green-400 border-green-500/20 border-green-500/20"
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
      {status}
    </span>
  );
}
