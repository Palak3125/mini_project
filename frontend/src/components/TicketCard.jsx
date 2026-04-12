import React from 'react';
import { Clock, MessageSquare, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TicketCard({ ticket, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="glass-card hover:bg-white/10 p-5 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] border-l-4 group"
      style={{ borderLeftColor: ticket.priority === 'High' ? '#ef4444' : ticket.priority === 'Medium' ? '#eab308' : '#22c55e' }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-mono text-sm font-semibold text-slate-300">{ticket.id}</h4>
          <p className="text-white font-medium mt-1 line-clamp-1">{ticket.complaint}</p>
        </div>
        <StatusBadge status={ticket.priority} type="priority" />
      </div>
      
      <div className="flex items-center gap-4 text-xs text-slate-400 mt-4">
        <span className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-md">
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          {ticket.department}
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <Clock className="w-3.5 h-3.5" />
          {ticket.time}
        </span>
      </div>
    </div>
  );
}
