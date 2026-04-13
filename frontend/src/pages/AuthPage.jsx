import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, User, KeyRound, Mail, Type, AtSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { useTickets } from '../context/TicketContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, user } = useTickets();
  
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('tab') === 'admin' ? 'admin' : 'student';

  const [activeTab, setActiveTab] = useState(initialMode); // 'student' | 'admin'
  const [isLoginView, setIsLoginView] = useState(true); // true = Login, false = Signup (Student only)
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Sync tab if URL changes but component doesn't unmount
  useEffect(() => {
    const currentMode = queryParams.get('tab') === 'admin' ? 'admin' : 'student';
    setActiveTab(currentMode);
    setIsLoginView(true); // Always default to Login view when switching tabs
  }, [location.search]);

  // If already logged in, redirect them
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/my-complaints');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (activeTab === 'student' && !isLoginView) {
        // Handle Student Signup
        await signup(formData.name, formData.email, formData.password);
        toast.success("Account created successfully! Logging you in...");
        await login(formData.email, formData.password, 'user');
        navigate('/submit');
      } else {
        // Handle Admin or Student Login
        const role = activeTab === 'admin' ? 'admin' : 'user';
        await login(formData.email, formData.password, role);
        toast.success(`Welcome back, ${role === 'admin' ? 'Admin' : 'Student'}!`);
        navigate(role === 'admin' ? '/admin' : '/my-complaints');
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim() && (isLoginView || formData.name.trim());

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 animate-in fade-in zoom-in duration-500 relative">
      
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full max-h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Secure Portal
          </h1>
          <p className="text-slate-400">Authenticate to access the platform</p>
        </div>

        <Card className="bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-0">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button 
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'student' ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'}`}
              onClick={() => { setActiveTab('student'); setIsLoginView(true); setFormData({ name: '', email: '', password: '' }); }}
              type="button"
            >
              <User className="w-4 h-4" /> Student
            </button>
            <button 
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'admin' ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-900/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'}`}
              onClick={() => { setActiveTab('admin'); setIsLoginView(true); setFormData({ name: '', email: '', password: '' }); }}
              type="button"
            >
              <Shield className="w-4 h-4" /> Admin
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${activeTab === 'admin' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                {activeTab === 'admin' ? <Shield className="w-8 h-8 text-purple-400" /> : <User className="w-8 h-8 text-blue-400" />}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {activeTab === 'admin' ? 'Admin Login' : (isLoginView ? 'Student Login' : 'Create Account')}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLoginView && activeTab === 'student' && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                  <Input 
                    label="Full Name" 
                    id="name" 
                    type="text"
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              )}

              <Input 
                label={activeTab === 'admin' ? "Admin Email" : "Student Email"} 
                id="email" 
                type="email"
                placeholder={activeTab === 'admin' ? "admin@system.local" : "student@college.edu"} 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              
              <Input 
                label="Password" 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className={`w-full py-3 ${activeTab === 'admin' ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] border-purple-500/30' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] border-blue-500/30'} ${!isFormValid && 'opacity-50 grayscale cursor-not-allowed'}`}
                  isLoading={isLoading}
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? 'Authenticating...' : (isLoginView ? 'Secure Login' : 'Sign Up')}
                </Button>
              </div>
            </form>

            {activeTab === 'student' && (
              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  {isLoginView ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLoginView(!isLoginView);
                      setFormData({ name: '', email: '', password: '' });
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all"
                  >
                    {isLoginView ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>
            )}

          </div>
        </Card>
      </div>
    </div>
  );
}
