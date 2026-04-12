import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Shield, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

export default function Home() {
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ id: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    setTimeout(() => {
      setIsLoggingIn(false);
      if (adminCreds.password === 'admin123') {
        toast.success("Welcome, Admin");
        navigate('/admin');
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    }, 1000);
  };

  const isLoginValid = adminCreds.id.trim() && adminCreds.password.trim();

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
            onClick={() => navigate('/submit')}
            icon={Send}
          >
            Submit Complaint
          </Button>
          <Button 
            variant="secondary" 
            className="text-lg py-4 px-8 flex-1 bg-slate-800/80 hover:bg-slate-700 hover:text-white"
            onClick={() => setShowAdminModal(true)}
            icon={Lock}
          >
            Admin Login
          </Button>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-md bg-slate-900 border border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-8 mt-2">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
              <p className="text-slate-400 text-sm mt-1">Secure access to the AI resolution backend.</p>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <Input 
                label="Admin ID / Email" 
                id="adminId" 
                placeholder="admin@system.local" 
                value={adminCreds.id}
                onChange={(e) => setAdminCreds({...adminCreds, id: e.target.value})}
              />
              <Input 
                label="Password" 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={adminCreds.password}
                onChange={(e) => setAdminCreds({...adminCreds, password: e.target.value})}
              />
              <div className="pt-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className={`w-full ${!isLoginValid && 'opacity-50 grayscale cursor-not-allowed'}`}
                  isLoading={isLoggingIn}
                  disabled={!isLoginValid || isLoggingIn}
                >
                  {isLoggingIn ? 'Authenticating...' : 'Secure Login'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
