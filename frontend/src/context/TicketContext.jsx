import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const TicketContext = createContext();

const FAKE_TICKETS = [
  { id: 'TCK-10023', text: "Cannot access my online account after password reset.", dept: "Technical Support", priority: "High", confidence: 94, status: "Submitted", agent: "Unassigned", keywords: ["access", "password text", "reset failure", "login"], date: new Date().toLocaleDateString() },
  { id: 'TCK-10024', text: "Billing amount is incorrect for the previous month.", dept: "Billing", priority: "Medium", confidence: 88, status: "In Review", agent: "Sarah Jenkins", keywords: ["billing amount", "incorrect", "invoice", "overcharge"], date: new Date().toLocaleDateString() },
  { id: 'TCK-10025', text: "System outage on the main server cluster.", dept: "IT Infrastructure", priority: "High", confidence: 99, status: "In Progress", agent: "Mike Ross", keywords: ["outage", "server down", "cluster fail", "urgent"], date: new Date().toLocaleDateString() },
  { id: 'TCK-10026', text: "Requesting a feature enhancement for the dashboard.", dept: "Product", priority: "Low", confidence: 75, status: "Resolved", agent: "David Kim", keywords: ["feature", "enhancement", "dashboard", "suggestion"], date: new Date().toLocaleDateString() },
];

const FAKE_AGENTS = [
  { id: 1, name: "John Admin", dept: "Technical Support", status: "Available" },
  { id: 2, name: "Sarah Jenkins", dept: "Billing", status: "Busy" },
  { id: 3, name: "Mike Ross", dept: "IT Infrastructure", status: "Available" },
  { id: 4, name: "David Kim", dept: "Product", status: "Busy" },
  { id: 5, name: "Rachel Zane", dept: "Legal", status: "Available" },
];

export const useTickets = () => useContext(TicketContext);

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState(FAKE_TICKETS);
  const [agents, setAgents] = useState(FAKE_AGENTS);
  
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

  const addTicket = (ticket) => {
    setTickets([ticket, ...tickets]);
  };

  const updateTicketStatus = (id, newStatus) => {
    // If newStatus is passed explicitly, use it, otherwise cycle as before
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        if (newStatus) {
           toast.success(`Ticket ${id} status updated`);
           return { ...t, status: newStatus };
        }
        const statuses = ["Submitted", "In Review", "In Progress", "Resolved"];
        const currentIndex = statuses.indexOf(t.status);
        if (currentIndex < statuses.length - 1) {
          const nextStatus = statuses[currentIndex + 1];
          toast.success(`Status updated to ${nextStatus}`);
          return { ...t, status: nextStatus };
        }
        return t;
      }
      return t;
    }));
  };

  const reassignTicket = (id, newAgent) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        toast.success(`Ticket reassigned to ${newAgent}`);
        return { ...t, agent: newAgent };
      }
      return t;
    }));
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
      addTicket, 
      updateTicketStatus, 
      reassignTicket,
      saveSettings 
    }}>
      {children}
    </TicketContext.Provider>
  );
};
