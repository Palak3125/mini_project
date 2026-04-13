import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, CheckCircle2, SearchX } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { useTickets } from '../context/TicketContext';

const STEPS = ["Submitted", "In Review", "In Progress", "Resolved"];

export default function TrackComplaint() {
  const navigate = useNavigate();
  const { user } = useTickets();
  const [ticketId, setTicketId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [result, setResult] = useState(null); // 'found', 'not_found', null
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to track your status.");
      navigate('/login');
    }
  }, [user, navigate]);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    
    if (!user) {
      toast.error("Please securely login from the Home page first.");
      return;
    }

    setIsTracking(true);
    setResult(null);

    try {
      const res = await fetch(`http://127.0.0.1:5000/track/${ticketId.trim()}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      setIsTracking(false);

      if (res.ok) {
        const data = await res.json();
        setResult('found');
        toast.success("Ticket details found!");
        
        const mapStatus = (status) => {
          if (status === 'pending') return 'Submitted';
          if (status === 'in_progress') return 'In Progress';
          if (status === 'resolved') return 'Resolved';
          return 'Submitted';
        };

        const frontendStatus = mapStatus(data.status);
        
        setTicketData({
          id: ticketId.trim().toUpperCase(),
          status: frontendStatus,
          lastUpdated: new Date().toLocaleDateString(),
          step: STEPS.indexOf(frontendStatus) + 1 || 1
        });
      } else {
        setResult('not_found');
        toast.error("Invalid Ticket ID or not found.");
      }
    } catch (err) {
      setIsTracking(false);
      setResult('not_found');
      toast.error("Network error while tracking.");
    }
  };

  const commonCardStyles = "w-full max-w-2xl border border-white/10 bg-slate-900/60 shadow-2xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]";

  if (!user) return null;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] px-4 py-16 animate-in fade-in duration-500">
      
      <div className="text-center max-w-2xl mb-10 w-full">
        <h1 className="text-4xl font-bold mb-4 text-white">Track Status</h1>
        <p className="text-slate-400 text-lg">Enter your Ticket ID to view the latest updates on your submitted issue.</p>
      </div>

      <Card className={`${commonCardStyles} p-6 sm:p-8 mb-8`}>
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input 
              id="ticketId"
              placeholder="Enter Ticket ID (e.g. TCK-12345)"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="w-full uppercase"
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={!ticketId.trim() || isTracking}
            icon={Search}
            className="mt-1 sm:mt-0 py-3 px-8 transition-transform hover:scale-105 active:scale-95"
          >
            Track Status
          </Button>
        </form>
      </Card>

      {/* Result Area */}
      <div className="w-full max-w-2xl transition-all duration-500 min-h-[300px]">
        {isTracking && (
          <Card className={`${commonCardStyles} py-16 animate-in fade-in`}>
            <Loader text="Fetching ticket details securely..." size="w-10 h-10" />
          </Card>
        )}

        {!isTracking && result === 'not_found' && (
          <Card className="border-red-500/30 bg-red-950/40 text-center py-16 animate-in slide-in-from-bottom-4 backdrop-blur-xl max-w-2xl w-full mx-auto shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <SearchX className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Invalid Ticket ID</h3>
            <p className="text-red-300">We couldn't find a complaint matching "{ticketId}". Please double-check and try again.</p>
          </Card>
        )}

        {!isTracking && result === 'found' && ticketData && (
          <Card className={`${commonCardStyles} animate-in slide-in-from-bottom-4 overflow-hidden relative p-8`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 border-b border-white/10 pb-6 transition-colors hover:border-white/20">
              <div>
                <p className="text-slate-400 text-sm mb-1 uppercase tracking-widest font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Ticket Verified
                </p>
                <h3 className="text-3xl font-mono font-bold text-white mb-2">{ticketData.id}</h3>
                <p className="text-slate-500 text-sm">Submitted on: {ticketData.lastUpdated}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <StatusBadge status={ticketData.status} type="status" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-8 px-4">
              <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-slate-800 -translate-y-1/2 rounded-full" />
              <div 
                className="absolute top-1/2 left-4 h-1.5 bg-blue-500 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `calc(${((ticketData.step - 1) / (STEPS.length - 1)) * 100}% - 2rem)` }}
              />
              <div className="relative flex justify-between">
                {STEPS.map((label, index) => {
                  const isCompleted = index < ticketData.step;
                  const isCurrent = index === ticketData.step - 1;
                  
                  return (
                    <div key={label} className="flex flex-col items-center gap-4 w-20">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-700 z-10 
                        ${isCompleted 
                          ? 'bg-blue-500 border-slate-900 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110' 
                          : isCurrent 
                            ? 'bg-slate-900 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse' 
                            : 'bg-slate-900 border-slate-800 text-slate-600'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span className="text-sm font-bold">{index + 1}</span>}
                      </div>
                      <span className={`text-xs font-semibold text-center whitespace-nowrap transition-colors duration-300 ${isCompleted ? 'text-slate-300' : isCurrent ? 'text-blue-400 font-bold' : 'text-slate-600'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </Card>
        )}
      </div>
      
    </div>
  );
}
