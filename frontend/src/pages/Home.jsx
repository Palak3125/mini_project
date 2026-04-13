import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Shield, Lock, User } from 'lucide-react';
import Button from '../components/Button';
import { useTickets } from '../context/TicketContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useTickets();

  const handleActionClick = (path) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  const handleAdminClick = () => {
    navigate('/login?tab=admin');
  };

  const handleStudentClick = () => {
    navigate('/login?tab=student');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-16 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
      
      {/* Background glow effects for premium feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="text-center max-w-4xl z-10 -mt-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-8 shadow-2xl">
           <Shield className="w-10 h-10 text-blue-400 animate-pulse" />
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-slate-400 mb-6 drop-shadow-lg">
          AI Complaint Management System
        </h1>
        
        <p className="text-xl sm:text-2xl text-slate-400 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
          Smart routing, automated prioritization, and seamless resolution powered by Artificial Intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-xl mx-auto">
          <Button 
            variant="primary" 
            className="text-lg py-4 px-8 flex-1"
            onClick={() => handleActionClick('/submit')}
            icon={Send}
          >
            Submit Complaint
          </Button>
          <Button 
            variant="secondary" 
            className="text-lg py-4 px-8 flex-1 bg-slate-800/80 hover:bg-slate-700 hover:text-white"
            onClick={handleAdminClick}
            icon={Lock}
          >
            Admin Portal
          </Button>
        </div>
        <div className="mt-6">
          <button 
            onClick={handleStudentClick}
            className="text-slate-400 hover:text-white transition-colors text-sm hover:underline flex items-center justify-center mx-auto gap-2"
          >
            <User className="w-4 h-4" /> Student Portal
          </button>
        </div>
      </div>
    </div>
  );
}
