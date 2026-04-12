import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Search, Inbox, Edit2, CheckCircle2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import Card from '../components/Card';
import { useTickets } from '../context/TicketContext';

export default function AllTickets() {
  const { tickets, agents, updateTicketStatus, reassignTicket } = useTickets();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Simulate API fetch loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
      if (filterStatus !== 'All' && t.status !== filterStatus) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return t.text.toLowerCase().includes(query) || t.id.toLowerCase().includes(query);
      }
      return true;
    });
  }, [tickets, filterPriority, filterStatus, searchQuery]);

  const handleStatusChange = async (id, newStatus) => {
    const promise = new Promise(resolve => setTimeout(resolve, 400));
    toast.promise(promise, {
      loading: 'Updating status...',
      success: `Status changed to ${newStatus}`,
      error: 'Failed to update status'
    });
    await promise;
    updateTicketStatus(id, newStatus);
  };

  const handleAgentChange = async (id, newAgent) => {
    const promise = new Promise(resolve => setTimeout(resolve, 400));
    toast.promise(promise, {
      loading: 'Assigning agent...',
      success: `Agent assigned: ${newAgent}`,
      error: 'Failed to assign agent'
    });
    await promise;
    reassignTicket(id, newAgent);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200 pointer-events-auto">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold text-white mb-2">All Tickets</h1>
        <p className="text-slate-400 mb-8">Manage and track all user complaints across departments.</p>

        <Card className="!p-0 bg-slate-900/50 overflow-hidden shadow-2xl border-white/5">
          <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-950/30">
            <h3 className="font-semibold text-xl text-white">Tickets Directory</h3>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl px-3 py-2 w-full xl:w-64 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-inner group">
                <Search className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-blue-400" />
                <input
                  type="text"
                  placeholder="Search ID, summary..."
                  className="bg-transparent text-sm text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-colors hover:bg-slate-800/80">
                <Filter className="w-4 h-4 text-slate-400 mr-2" />
                <select
                  className="bg-transparent text-sm text-slate-300 focus:outline-none appearance-none cursor-pointer"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-colors hover:bg-slate-800/80">
                <Filter className="w-4 h-4 text-slate-400 mr-2" />
                <select
                  className="bg-transparent text-sm text-slate-300 focus:outline-none appearance-none cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-slate-300 font-medium tracking-wide">Loading tickets...</span>
                </div>
              </div>
            ) : null}

            {!isLoading && filteredTickets.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <th className="p-5 font-semibold">Ticket ID</th>
                    <th className="p-5 font-semibold w-1/4">Complaint Summary</th>
                    <th className="p-5 font-semibold">Department</th>
                    <th className="p-5 font-semibold">Priority</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold">Assigned Agent</th>
                    <th className="p-5 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="p-5 font-mono font-medium text-slate-300 group-hover:text-blue-400 transition-colors">{ticket.id}</td>
                      <td className="p-5 text-slate-200 line-clamp-2 max-w-[250px]" title={ticket.text}>{ticket.text}</td>
                      <td className="p-5 text-slate-400 font-medium">{ticket.dept}</td>
                      <td className="p-5"><StatusBadge status={ticket.priority} type="priority" /></td>
                      <td className="p-5">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className={`bg-slate-900 border border-slate-700/50 rounded-lg px-2 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus:border-blue-500 cursor-pointer ${
                            ticket.status === 'Resolved' ? 'text-green-400' : 
                            ticket.status === 'Submitted' ? 'text-purple-400' : 'text-yellow-400'
                          }`}
                        >
                          <option className="text-slate-300" value="Submitted">Submitted</option>
                          <option className="text-slate-300" value="In Review">In Review</option>
                          <option className="text-slate-300" value="In Progress">In Progress</option>
                          <option className="text-slate-300" value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-slate-500" />
                          <select
                            value={ticket.agent}
                            onChange={(e) => handleAgentChange(ticket.id, e.target.value)}
                            className={`bg-slate-900 border border-slate-700/50 rounded-lg px-2 py-1.5 text-xs font-medium shadow-sm focus:outline-none focus:border-blue-500 cursor-pointer ${
                              ticket.agent === 'Unassigned' ? 'text-slate-500 italic' : 'text-slate-300'
                            }`}
                          >
                            <option className="text-slate-500" value="Unassigned">Unassigned</option>
                            {agents.map(a => (
                              <option key={a.id} className="text-slate-300" value={a.name}>{a.name}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => handleStatusChange(ticket.id, 'Resolved')}
                          className="p-2 bg-slate-800/80 hover:bg-green-500/20 text-slate-400 hover:text-green-400 rounded-lg transition-all border border-transparent hover:border-green-500/30 group/btn"
                          title="Mark as Resolved"
                        >
                          <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              !isLoading && (
                <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700/50">
                    <Inbox className="w-8 h-8 text-slate-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-300 mb-1">No tickets found</h4>
                  <p className="text-slate-500 max-w-sm">There are no tickets matching your current criteria.</p>
                  {(searchQuery || filterPriority !== 'All' || filterStatus !== 'All') && (
                    <button
                      onClick={() => { setSearchQuery(''); setFilterPriority('All'); setFilterStatus('All'); toast.success("Filters reset"); }}
                      className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
