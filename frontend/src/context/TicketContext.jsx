import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const TicketContext = createContext();

const API_URL = 'http://localhost:5000';

const FAKE_AGENTS = [
  { id: 1, name: "John Admin", dept: "Technical Support", status: "Available" },
  { id: 2, name: "Sarah Jenkins", dept: "Billing", status: "Busy" },
  { id: 3, name: "Mike Ross", dept: "IT Infrastructure", status: "Available" },
  { id: 4, name: "David Kim", dept: "Product", status: "Busy" },
  { id: 5, name: "Rachel Zane", dept: "Legal", status: "Available" },
];

export const useTickets = () => useContext(TicketContext);

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState(FAKE_AGENTS);
  
  // Auth state
  const [user, setUser] = useState(null);

  // App Settings State
  const [settings, setSettings] = useState({
    aiModelActive: true,
    priorityThresholdHigh: 90,
    priorityThresholdMedium: 70,
    adminName: "Admin User",
    adminEmail: "admin@enterprise.com",
    emailAlerts: true,
    highPriorityAlerts: true,
  });

  // Restore user session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      return data;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setTickets([]);
  };

  // Map backend status to frontend status
  const mapStatus = (status) => {
    if (status === 'pending') return 'Submitted';
    if (status === 'in_progress') return 'In Progress';
    if (status === 'resolved') return 'Resolved';
    return 'Submitted'; // Default
  };

  const fetchTickets = async () => {
    if (!user) return;
    try {
      if (user.role === 'admin') {
        // Fetch all complaints
        const res = await fetch(`${API_URL}/complaints?limit=100`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          const mapped = data.map(t => ({
            _rawId: t.id, // Keep the DB master id for updates
            id: t.ticket_id,
            text: t.normalized_text,
            dept: t.department,
            priority: t.priority,
            confidence: Math.floor(Math.random() * 20) + 80, // Mock confidence
            status: mapStatus(t.status),
            agent: t.agent || 'Unassigned',
            keywords: [],
            date: new Date().toLocaleDateString()
          }));
          setTickets(mapped);
        }
      } else {
        // Fetch student's own complaints
        const res = await fetch(`${API_URL}/student/${user.student_id}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          // Flatten student complaints to fit the format
          const pending = data.pending.map((c, i) => ({ id: `STU-P${i}`, text: c.text, status: mapStatus(c.status), dept: "Unknown", priority: "Medium", agent: "Unassigned" }));
          const resolved = data.resolved.map((c, i) => ({ id: `STU-R${i}`, text: c.text, status: mapStatus(c.status), dept: "Unknown", priority: "Medium", agent: "Unassigned" }));
          setTickets([...pending, ...resolved]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tickets');
    }
  };

  // Optional: automatically fetch on login
  useEffect(() => {
    if (user) {
      fetchTickets();
    } else {
      setTickets([]);
    }
  }, [user]);

  const addTicket = async (text) => {
    if (!user) {
      toast.error("You must be logged in to submit a complaint");
      return null;
    }
    
    try {
      const res = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit complaint');
      
      // refresh tickets if user
      fetchTickets();
      return data;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    if (!user || user.role !== 'admin') {
      toast.error("Not authorized");
      return;
    }
    
    const targetTicket = tickets.find(t => t.id === id);
    if (!targetTicket) return;
    
    let endpoint = '';
    
    if (newStatus === 'Resolved') {
      endpoint = `${API_URL}/resolve/${targetTicket._rawId}`;
    } else if (newStatus === 'In Progress' || newStatus === 'In Review') {
      endpoint = `${API_URL}/in_progress/${targetTicket._rawId}`;
    } else if (!newStatus) {
      if (targetTicket.status === 'Submitted') {
        endpoint = `${API_URL}/in_progress/${targetTicket._rawId}`;
      } else if (targetTicket.status === 'In Progress') {
        endpoint = `${API_URL}/resolve/${targetTicket._rawId}`;
      } else {
        toast.error(`Cannot automatically advance status from ${targetTicket.status}`);
        return;
      }
    } else {
       toast.error(`Cannot revert status to ${newStatus} or unsupported status`);
       return;
    }
    
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        toast.success(`Ticket status advanced`);
        fetchTickets(); // Refresh
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to update");
      }
    } catch (err) {
      toast.error("Error updating ticket");
    }
  };

  const reassignTicket = async (id, newAgent) => {
    if (!user || user.role !== 'admin') {
      toast.error("Not authorized");
      return;
    }

    const targetTicket = tickets.find(t => t.id === id);
    if (!targetTicket) return;

    try {
      const res = await fetch(`${API_URL}/reassign/${targetTicket._rawId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ agent: newAgent })
      });
      
      if (res.ok) {
        toast.success(`Ticket reassigned to ${newAgent}`);
        // Optionally fetchTickets() or update state locally
        setTickets(prev => prev.map(t => {
          if (t.id === id) {
            return { ...t, agent: newAgent };
          }
          return t;
        }));
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to reassign agent");
      }
    } catch (err) {
      toast.error("Error reassigning ticket");
    }
  };

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    toast.success("Settings saved");
  };

  return (
    <TicketContext.Provider value={{ 
      tickets, 
      agents,
      settings,
      user,
      login,
      logout,
      signup,
      addTicket, 
      fetchTickets,
      updateTicketStatus, 
      reassignTicket,
      saveSettings 
    }}>
      {children}
    </TicketContext.Provider>
  );
};
