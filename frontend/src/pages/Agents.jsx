import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Activity, CheckCircle2, Search, X, Inbox, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import { useTickets } from '../context/TicketContext';

export default function Agents() {
  const { agents, tickets, reassignTicket } = useTickets();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    agent.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAgentTickets = (admin) => tickets.filter(t => t.dept === admin.dept);
  const getActiveCount = (admin) => tickets.filter(t => t.dept === admin.dept && t.status !== 'Resolved').length;

  const selectedAgentTickets = selectedAgent ? getAgentTickets(selectedAgent) : [];
  const unassignedTickets = tickets.filter(t => t.agent === 'Unassigned' && t.status !== 'Resolved' && (!selectedAgent || t.dept !== selectedAgent.dept));

  const handleAssignTicket = (ticketId) => {
    reassignTicket(ticketId, selectedAgent.name);
    toast.success(`Ticket ${ticketId} assigned to ${selectedAgent.name}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200 pointer-events-auto">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Agents</h1>
            <p className="text-slate-400">Manage your support team and view ticket assignments.</p>
          </div>
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl px-4 py-2 w-64 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-inner group">
            <Search className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-blue-400" />
            <input
              type="text"
              placeholder="Search agents..."
              className="bg-transparent text-sm text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
             <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-300 font-medium">Loading agents...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAgents.map(agent => {
              const activeTickets = getActiveCount(agent);
              const isAvailable = agent.status === 'Available';
              return (
                <Card 
                  key={agent.id} 
                  className="!p-6 bg-slate-900/50 hover:bg-slate-900/80 transition-all cursor-pointer border border-white/5 hover:border-white/10 hover:-translate-y-1 group"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-bold group-hover:scale-110 transition-transform">
                      {agent.name.charAt(0)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isAvailable ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                      {agent.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{agent.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                    <Briefcase className="w-4 h-4" />
                    {agent.dept}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Tickets</p>
                      <p className={`text-2xl font-bold ${activeTickets > 5 ? 'text-red-400' : 'text-white'}`}>{activeTickets}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Handled</p>
                      <p className="text-2xl font-bold text-slate-300">{getAgentTickets(agent).length}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {filteredAgents.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                <Users className="w-12 h-12 text-slate-600 mb-4" />
                <h4 className="text-lg font-medium text-slate-300">No agents found</h4>
                <p className="text-slate-500">Try checking your search terms.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Agent Details Panel */}
      {selectedAgent && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in" onClick={() => setSelectedAgent(null)} />
          <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-slate-900 border-l border-white/10 z-50 shadow-2xl p-6 sm:p-8 animate-in slide-in-from-right duration-300 flex flex-col h-screen overflow-hidden">
            
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white text-xl font-bold shadow-inner">
                  {selectedAgent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                  <p className="text-sm text-blue-400 font-medium">{selectedAgent.dept}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="p-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Assigned Tickets ({selectedAgentTickets.length})
                </h3>
                
                {selectedAgentTickets.length > 0 ? (
                  <div className="space-y-3">
                    {selectedAgentTickets.map(ticket => (
                      <div key={ticket.id} className="p-4 bg-slate-950/80 border border-white/5 rounded-xl hover:border-white/10 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-sm font-bold text-blue-400">{ticket.id}</span>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2 mb-3">{ticket.text}</p>
                        <div className="flex justify-between items-center border-t border-white/5 pt-3">
                          <StatusBadge status={ticket.priority} type="priority" />
                          <span className="text-xs text-slate-500 font-medium">{ticket.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-slate-950/50 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No tickets currently assigned.</p>
                  </div>
                )}
              </div>

              {/* Assign Unassigned Tickets */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Inbox className="w-4 h-4" /> Assign New Tickets
                </h3>
                
                {unassignedTickets.length > 0 ? (
                  <div className="space-y-3">
                    {unassignedTickets.map(ticket => (
                      <div key={ticket.id} className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl flex flex-col gap-3 group hover:border-purple-500/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-xs font-bold text-purple-400 block mb-1">{ticket.id}</span>
                            <p className="text-sm text-slate-200 line-clamp-1">{ticket.text}</p>
                          </div>
                          <StatusBadge status={ticket.priority} type="priority" />
                        </div>
                        <Button 
                          variant="secondary" 
                          className="w-full py-2 bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20 text-xs"
                          onClick={() => handleAssignTicket(ticket.id)}
                        >
                          <Link2 className="w-3.5 h-3.5 mr-2" /> Assign to {selectedAgent.name.split(' ')[0]}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-slate-950/50 rounded-xl border border-white/5">
                     <p className="text-slate-500 font-medium text-sm">No unassigned tickets available.</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </>
      )}

    </div>
  );
}
