import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bot, User, LogOut } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useTickets();
  
  if (location.pathname.startsWith('/admin')) return null;

  const NavLink = ({ to, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`relative text-sm font-medium transition-colors hover:text-white pb-1 group ${isActive ? 'text-blue-400' : 'text-slate-400'}`}
      >
        {label}
        <span className={`absolute left-0 bottom-0 w-full h-[2px] bg-blue-500 transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
      </Link>
    );
  };

  return (
    <nav className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-blue-600/20 p-2 rounded-xl group-hover:bg-blue-600/30 transition-transform duration-300 group-hover:rotate-6">
              <Bot className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              AI Resolve
            </span>
          </Link>
          
          <div className="flex items-center gap-8">
            <NavLink to="/submit" label="Submit" />
            <NavLink to="/track" label="Track" />
            
            {user && (
              <Link 
                to="/my-complaints" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600/10 border border-blue-500/20 rounded-lg hover:bg-blue-600/20 text-blue-400 transition-all focus:ring-2 focus:ring-blue-500 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                <User className="w-4 h-4" />
                My Complaints
              </Link>
            )}

            {user && (
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-red-400 transition-all focus:ring-2 focus:ring-red-500 hover:scale-105 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] ml-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
