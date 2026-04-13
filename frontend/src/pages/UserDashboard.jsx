import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, FileText } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { useTickets } from '../context/TicketContext';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, tickets } = useTickets();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // In a real app we'd filter tickets associated with the logged in user's ID
  // For demo, we just show all tickets created (simulating the user owning them all)
  const userTickets = useMemo(() => {
    return tickets;
  }, [tickets]);

  if (!user) return null;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] px-4 py-16 animate-in fade-in duration-500">
      <div className="max-w-5xl w-full">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Complaints</h1>
            <p className="text-slate-400 mt-1">Track the status of all your submitted issues.</p>
          </div>
        </div>

        <Card className="!p-0 border border-white/10 bg-slate-900/60 shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            {userTickets.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <th className="p-5 font-semibold">Ticket ID</th>
                    <th className="p-5 font-semibold w-1/2">Complaint Summary</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {userTickets.map(ticket => (
                    <tr 
                      key={ticket.id} 
                      className="hover:bg-slate-800/50 transition-colors group cursor-default"
                    >
                      <td className="p-5 font-mono font-bold text-slate-300 group-hover:text-blue-400 transition-colors">{ticket.id}</td>
                      <td className="p-5 text-slate-200 truncate max-w-[300px]" title={ticket.text}>{ticket.text}</td>
                      <td className="p-5"><StatusBadge status={ticket.status} /></td>
                      <td className="p-5 text-slate-400">{ticket.date || 'Today'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700/50">
                   <Inbox className="w-8 h-8 text-slate-500" />
                </div>
                <h4 className="text-lg font-semibold text-slate-300 mb-1">No complaints yet</h4>
                <p className="text-slate-500 max-w-sm">When you submit a new complaint, you'll be able to track its entire lifecycle here.</p>
              </div>
            )}
          </div>
        </Card>
        
      </div>
    </div>
  );
}
