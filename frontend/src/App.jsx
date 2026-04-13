import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import SubmitComplaint from './pages/SubmitComplaint';
import TrackComplaint from './pages/TrackComplaint';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AllTickets from './pages/AllTickets';
import Agents from './pages/Agents';
import Settings from './pages/Settings';
import { TicketProvider } from './context/TicketContext';

function App() {
  return (
    <TicketProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans text-slate-200">
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0f172a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              },
            }} 
          />
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/submit" element={<SubmitComplaint />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/my-complaints" element={<UserDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/tickets" element={<AllTickets />} />
              <Route path="/admin/agents" element={<Agents />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </TicketProvider>
  );
}

export default App;