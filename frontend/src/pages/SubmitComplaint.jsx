import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, Copy, FileText, Search, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import StatusBadge from '../components/StatusBadge';
import { useTickets } from '../context/TicketContext';

const LOADING_STEPS = [
  "Analyzing complaint...",
  "Assigning department...",
  "Generating ticket..."
];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const { user, addTicket } = useTickets();
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [copied, setCopied] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Please login to submit a complaint");
      navigate('/login');
    }
  }, [user, navigate]);

  // Computed state & validation
  const charCount = description.length;
  const isFormValid = charCount >= 10;
    
  // AI Prediction fake logic
  const isTyping = charCount > 10 && !isSubmitting && !isSuccess;
  const aiThought = charCount > 50 ? "AI Analysis: Routing to relevant department..." : "AI is detecting possible category...";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || !user) return;
    
    setIsSubmitting(true);
    setLoadingStep(0);
    
    const interval = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 800);
    
    try {
      const result = await addTicket(description);
      
      clearInterval(interval);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTicketId(result.ticket_id);
      toast.success(result.message || "Ticket successfully generated!");

    } catch (err) {
      clearInterval(interval);
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    toast.success("Ticket ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const commonCardStyles = "max-w-3xl mx-auto w-full border border-white/10 bg-slate-900/60 shadow-2xl p-8 sm:p-12 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]";

  if (isSuccess && ticketId) {
    return (
      <div className="min-h-[calc(100vh-80px)] px-4 py-16 animate-in fade-in zoom-in duration-500">
        <Card className={`${commonCardStyles} max-w-2xl text-center relative overflow-hidden backdrop-blur-2xl`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-green-500/10 blur-[80px]" />
          
          <div className="inline-flex justify-center items-center w-20 h-20 bg-green-500/10 text-green-500 rounded-full mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)] animate-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-extrabold mb-3 text-white">Complaint Submitted Successfully</h2>
          <p className="text-slate-400 mb-10 text-lg">Our team will review your issue shortly.</p>
          
          <div className="bg-slate-950/50 rounded-2xl p-6 sm:p-8 border border-white/5 space-y-6 text-left mb-8 transition-all hover:border-white/10">
            <div className="flex justify-between items-center pb-6 border-b border-white/5">
              <span className="text-slate-400 font-medium">Ticket ID</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold text-white tracking-widest bg-slate-900 border border-slate-700 px-4 py-1.5 rounded-lg shadow-inner">
                  {ticketId}
                </span>
                <button 
                  onClick={copyToClipboard}
                  className="p-2.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-all border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 active:scale-95 group"
                  title="Copy Ticket ID"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Initial Status</span>
              <StatusBadge status="Submitted" />
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full text-lg py-4 border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-blue-400"
            icon={Search}
            onClick={() => navigate('/track')}
          >
            Track Complaint
          </Button>
        </Card>
      </div>
    );
  }

  // Prevent render flash if redirecting
  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-16 animate-in slide-in-from-bottom-8 duration-500">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <FileText className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">Submit a Complaint</h1>
        <p className="text-slate-400 text-lg">Please fill out the form below. Our automated system ensures rapid processing.</p>
      </div>

      <Card className={commonCardStyles}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Input 
              label="Complaint Description" 
              id="description" 
              placeholder="Describe your issue clearly (min 10 characters)..." 
              isTextArea 
              required 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={charCount > 0 && !isFormValid ? "Minimum 10 characters required." : ""}
              className="mb-2 min-h-[150px]"
            />
            <div className="flex justify-between items-center px-1 mt-1">
              <div className="h-5 flex items-center transition-opacity duration-300">
                {isTyping && (
                  <span className="text-xs text-blue-400 flex items-center gap-1.5 animate-pulse bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    <Bot className="w-3 h-3" />
                    {aiThought}
                  </span>
                )}
              </div>
              <span className={`text-xs ${charCount < 10 ? 'text-red-400' : 'text-slate-400'}`}>
                {charCount} characters
              </span>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              variant="primary" 
              className={`w-full text-lg py-3.5 transition-all duration-300 ${!isFormValid ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]'}`}
              icon={Send}
              isLoading={isSubmitting}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <span className="animate-pulse">{LOADING_STEPS[Math.min(loadingStep, LOADING_STEPS.length - 1)]}</span>
              ) : (
                'Submit Support Ticket'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
