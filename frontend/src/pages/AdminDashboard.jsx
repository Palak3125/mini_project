import React, { useState, useMemo } from 'react';
import { Filter, Search, X, BrainCircuit, Activity, Users, FileText, AlertCircle, Inbox, UserPlus, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTickets } from '../context/TicketContext';

export default function AdminDashboard() {
  const { tickets, agents, updateTicketStatus, reassignTicket } = useTickets();
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Dynamic Departments
  const uniqueDepartments = useMemo(() => {
    return [...new Set(tickets.map(t => t.dept))].filter(Boolean).sort();
  }, [tickets]);

  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      data.push({
        name: days[d.getDay()],
        date: d,
        tickets: 0
      });
    }

    tickets.forEach(ticket => {
      if (ticket.date) {
        const ticketDate = new Date(ticket.date);
        if (!isNaN(ticketDate.getTime())) {
          ticketDate.setHours(0, 0, 0, 0);
          const dayEntry = data.find(d => d.date.getTime() === ticketDate.getTime());
          if (dayEntry) {
            dayEntry.tickets += (ticket.count || 1);
          }
        }
      }
    });

    return data;
  }, [tickets]);

  // Find full ticket whenever state changes so it updates live
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [reassigning, setReassigning] = useState(false);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
      
      // Default behavior: hide Resolved tickets from inbox unless explicitly selected
      if (filterStatus === 'All' && t.status === 'Resolved') return false;
      if (filterStatus !== 'All' && t.status !== filterStatus) return false;
      
      if (filterDept !== 'All' && t.dept !== filterDept) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = t.text.toLowerCase().includes(query);
        const idMatch = t.id.toLowerCase().includes(query);
        return textMatch || idMatch || (t.keywords && t.keywords.some(k => k.toLowerCase().includes(query)));
      }
      return true;
    });
  }, [tickets, filterPriority, filterStatus, filterDept, searchQuery]);

  const highPriorityTickets = tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved');

  const handleAction = () => {
    if (selectedTicket.status === 'Resolved') {
      toast.error("Ticket is already resolved.");
      return;
    }
    updateTicketStatus(selectedTicket.id);
  };

  const handleReassign = (e) => {
    const newAgent = e.target.value;
    if (newAgent) {
      reassignTicket(selectedTicket.id, newAgent);
      setReassigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Overview Dashboard</h1>
            <p className="text-slate-400">Welcome back. Here is the AI-analyzed snapshot of current operations.</p>
          </div>
          {/* <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:bg-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-default">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
              AI Model: v4.2 Active
            </span>
          </div> */}
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="!p-6 bg-slate-900/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><FileText className="w-6 h-6" /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Complaints</p>
                <h3 className="text-3xl font-bold text-white mt-1">{tickets.length}</h3>
              </div>
            </div>
          </Card>
          <Card className="!p-6 bg-red-950/20 border-red-500/20 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(239,68,68,0.15)] group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-bl-full blur-xl group-hover:bg-red-500/20 transition-colors" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-400 group-hover:scale-110 transition-transform"><AlertCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-red-300 text-sm font-medium">High Priority</p>
                <h3 className="text-3xl font-bold text-white mt-1 group-hover:text-red-400 transition-colors">{highPriorityTickets.length}</h3>
              </div>
            </div>
          </Card>
          <Card className="!p-6 bg-slate-900/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Activity className="w-6 h-6" /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending Review</p>
                <h3 className="text-3xl font-bold text-white mt-1">{tickets.filter(t => t.status === 'In Review' || t.status === 'Submitted').length}</h3>
              </div>
            </div>
          </Card>
          <Card className="!p-6 bg-slate-900/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl text-green-500"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Resolved Total</p>
                <h3 className="text-3xl font-bold text-white mt-1">{tickets.filter(t => t.status === 'Resolved').length}</h3>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2 !p-6 bg-slate-900/50 min-h-[300px] border-white/5 shadow-2xl">
            <h3 className="font-semibold text-lg mb-6 text-white flex items-center justify-between">
              Ticket Volume (Last 7 Days)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* High Priority Alerts */}
          <Card className="!p-6 bg-slate-900/50 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)] overflow-hidden flex flex-col">
            <h3 className="font-semibold text-lg mb-4 text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
              Critical Action Needed
            </h3>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {highPriorityTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 hover:border-red-500/40 hover:-translate-y-0.5 transition-all cursor-pointer shadow-sm group"
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold text-red-400 group-hover:text-red-300 transition-colors">{ticket.id}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Urgent</span>
                  </div>
                  <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">{ticket.text}</p>
                </div>
              ))}
              {highPriorityTickets.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-8">
                  <CheckCircle2 className="w-10 h-10 mb-2 text-green-500/50" />
                  <p className="text-sm font-medium">No critical tickets pending.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Complaints Table */}
        <Card className="!p-0 bg-slate-900/50 overflow-hidden shadow-2xl border-white/5">
          <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-950/30">
            <h3 className="font-semibold text-xl text-white">Inbox Queue</h3>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              {/* Search Bar */}
              <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl px-3 py-2 w-full xl:w-64 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-inner group">
                <Search className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-blue-400" />
                <input
                  type="text"
                  placeholder="Search ID, keywords..."
                  className="bg-transparent text-sm text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-colors hover:bg-slate-800/80 cursor-pointer">
                <Filter className="w-4 h-4 text-slate-400 mr-2" />
                <select
                  className="bg-transparent text-sm text-slate-300 focus:outline-none appearance-none cursor-pointer"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-colors hover:bg-slate-800/80 cursor-pointer">
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

              <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-colors hover:bg-slate-800/80 cursor-pointer">
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

          <div className="overflow-x-auto min-h-[300px]">
            {filteredTickets.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-xs uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <th className="p-5 font-semibold">Ticket ID</th>
                    <th className="p-5 font-semibold w-1/3">Complaint Summary</th>
                    <th className="p-5 font-semibold">AI Department</th>
                    <th className="p-5 font-semibold">Priority</th>
                    <th className="p-5 font-semibold text-center">AI Confidence</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold">Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredTickets.map(ticket => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <td className="p-5 font-mono font-medium text-slate-300 group-hover:text-blue-400 transition-colors">
                        {ticket.id}
                        {ticket.count > 1 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            {ticket.count}x
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-slate-200 truncate max-w-[200px]" title={ticket.text}>{ticket.text}</td>
                      <td className="p-5 text-slate-400 font-medium">{ticket.dept}</td>
                      <td className="p-5"><StatusBadge status={ticket.priority} type="priority" /></td>
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded bg-slate-950 font-mono text-xs shadow-inner border border-white/5 ${ticket.confidence > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {ticket.confidence}%
                        </span>
                      </td>
                      <td className="p-5"><StatusBadge status={ticket.status} /></td>
                      <td className="p-5 text-slate-400 flex items-center gap-2">
                        {ticket.agent === 'Unassigned' ? <span className="text-slate-500 text-xs italic bg-slate-800 px-2 py-1 rounded-sm">Unassigned</span> : ticket.agent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700/50">
                  <Inbox className="w-8 h-8 text-slate-500" />
                </div>
                <h4 className="text-lg font-semibold text-slate-300 mb-1">No tickets found</h4>
                <p className="text-slate-500 max-w-sm">Try adjusting your filters or search query to find what you're looking for.</p>
                {(searchQuery || filterPriority !== 'All' || filterStatus !== 'All' || filterDept !== 'All') && (
                  <button
                    onClick={() => { setSearchQuery(''); setFilterPriority('All'); setFilterStatus('All'); setFilterDept('All'); toast.success("Filters reset"); }}
                    className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* AI Details Sliding Panel */}
      {selectedTicket && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in" onClick={() => setSelectedTicketId(null)} />
          <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-slate-900 border-l border-white/10 z-50 shadow-2xl p-6 sm:p-8 animate-in slide-in-from-right duration-300 overflow-y-auto custom-scrollbar flex flex-col">

            <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Ticket Details</span>
                <h2 className="text-2xl font-mono font-bold text-white mt-1.5 flex items-center gap-3">
                  {selectedTicket.id}
                  <StatusBadge status={selectedTicket.status} />
                </h2>
              </div>
              <button onClick={() => setSelectedTicketId(null)} className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white hover:scale-105 active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-8">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">User Complaint</h4>
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/5 shadow-inner">
                <p className="text-slate-200 leading-relaxed text-[15px]">{selectedTicket.text}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Analysis Results</h3>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:border-white/10 transition-colors shadow-sm">
                <span className="text-slate-400 text-sm font-medium">Predicted Department</span>
                <span className="text-slate-200 font-semibold px-3 py-1 bg-slate-800 rounded-lg">{selectedTicket.dept}</span>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:border-white/10 transition-colors shadow-sm">
                <span className="text-slate-400 text-sm font-medium">Assigned Priority</span>
                <StatusBadge status={selectedTicket.priority} type="priority" />
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:border-white/10 transition-colors shadow-sm">
                <span className="text-slate-400 text-sm font-medium">Assigned Agent</span>
                <span className="text-slate-200 font-semibold">{selectedTicket.agent}</span>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    Confidence Score
                  </span>
                  <span className={`font-mono font-bold text-lg ${selectedTicket.confidence > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {selectedTicket.confidence}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${selectedTicket.confidence > 90 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`}
                    style={{ width: `${selectedTicket.confidence}%` }}
                  />
                </div>
              </div>

              {/* Keywords Identified */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-sm">
                <span className="text-slate-400 text-sm font-medium block mb-4">Reasoning Keywords Extract</span>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.keywords && selectedTicket.keywords.map((kw, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg text-sm font-mono shadow-sm hover:scale-105 transition-transform cursor-default">
                      "{kw}"
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
              {reassigning ? (
                <div className="p-4 bg-slate-950 border border-white/10 rounded-xl space-y-3">
                  <p className="text-sm font-medium text-slate-300 mb-2">Select new agent:</p>
                  <select
                    onChange={handleReassign}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose an agent...</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.name}>{agent.name} ({agent.dept})</option>
                    ))}
                  </select>
                  <button onClick={() => setReassigning(false)} className="w-full text-center text-sm text-slate-500 hover:text-white pt-2">Cancel</button>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Button variant="primary" className="flex-1 py-4 text-base" onClick={handleAction}>
                    {selectedTicket.status === 'Resolved' ? 'Resolved \u2713' : 'Advance Status'}
                  </Button>
                  <Button variant="secondary" className="flex-1 py-4 text-base bg-slate-800 hover:bg-slate-700" onClick={() => setReassigning(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Reassign
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
