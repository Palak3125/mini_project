import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Grid, Settings, LogOut, Shield } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  
  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to}
        onClick={() => console.log(`clicked ${label}`)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 active:scale-95 group hover:shadow-md hover:scale-[1.02] ${
          isActive 
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.25)]' 
            : 'text-slate-400 hover:bg-white/10 hover:text-white border border-transparent'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-300'}`} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="w-64 bg-slate-950 border-r border-white/10 flex flex-col h-screen fixed top-0 left-0 z-50 shadow-2xl pointer-events-auto">
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3 group" onClick={() => console.log("clicked Home")}>
          <div className="bg-purple-600/20 p-2 rounded-lg border border-purple-500/30 group-hover:bg-purple-600/30 transition-colors">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">AI Admin Desk</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3 mt-2">Dashboard</p>
        
        <NavItem to="/admin" icon={LayoutDashboard} label="Overview" />
        <NavItem to="/admin/tickets" icon={Grid} label="All Tickets" />
        <NavItem to="/admin/agents" icon={Users} label="Agents" />
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <NavItem to="/admin/settings" icon={Settings} label="Settings" />
        <Link 
          to="/" 
          onClick={() => console.log("clicked Exit")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent active:scale-95 group hover:shadow-md"
        >
          <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400" />
          <span className="font-medium">Exit System</span>
        </Link>
      </div>
    </div>
  );
}
