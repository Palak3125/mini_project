import React, { useState, useEffect } from 'react';
import { Save, User, Bell, Cpu, Shield, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTickets } from '../context/TicketContext';

export default function Settings() {
  const { settings, saveSettings } = useTickets();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Sync if context updates externally
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    saveSettings(localSettings);
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200 pointer-events-auto">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
            <p className="text-slate-400">Configure AI models, notifications, and your administrative profile.</p>
          </div>
          <Button 
            variant="primary" 
            className="w-40" 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </div>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* System Settings */}
          <Card className="!p-6 bg-slate-900/50 border-white/5 lg:col-span-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Cpu className="w-5 h-5 text-blue-400" /> System Integration
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                <div>
                  <h4 className="font-semibold text-white mb-1">AI Classification Model</h4>
                  <p className="text-sm text-slate-400">Automatically assign departments and priorities to incoming tickets.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={localSettings.aiModelActive} 
                    onChange={(e) => handleChange('aiModelActive', e.target.checked)} 
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-4">
                <h4 className="font-semibold text-white mb-2">Priority Thresholds (Confidence %)</h4>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-slate-400">High Priority Confidence Level</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="50" max="99" 
                      value={localSettings.priorityThresholdHigh} 
                      onChange={(e) => handleChange('priorityThresholdHigh', parseInt(e.target.value))}
                      className="w-full accent-red-500"
                    />
                    <span className="font-mono text-sm w-12 text-right">{localSettings.priorityThresholdHigh}%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-white/5 mt-2">
                  <label className="text-sm text-slate-400">Medium Priority Confidence Level</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="30" max="80" 
                      value={localSettings.priorityThresholdMedium} 
                      onChange={(e) => handleChange('priorityThresholdMedium', parseInt(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                    <span className="font-mono text-sm w-12 text-right">{localSettings.priorityThresholdMedium}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Admin Profile */}
          <Card className="!p-6 bg-slate-900/50 border-white/5 lg:col-span-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-purple-400" /> Admin Profile
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400">Display Name</label>
                <input 
                  type="text" 
                  value={localSettings.adminName}
                  onChange={(e) => handleChange('adminName', e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400">Email Address</label>
                <input 
                  type="email" 
                  value={localSettings.adminEmail}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Key className="w-4 h-4" /> Authentication
                </h4>
                <Button 
                  variant="secondary" 
                  className="w-full bg-slate-950 hover:bg-slate-800"
                  onClick={() => toast('Password rest email sent', { icon: '📧' })}
                >
                  Change Password
                </Button>
                <p className="text-xs text-slate-500 text-center">A secure reset link will be emailed to you.</p>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="!p-6 bg-slate-900/50 border-white/5 lg:col-span-3">
             <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-green-400" /> Notifications & Alerts
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                <div className="flex gap-4 items-center">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">Email Summaries</h4>
                    <p className="text-xs text-slate-400">Receive daily digest of ticket resolutions.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={localSettings.emailAlerts} 
                    onChange={(e) => handleChange('emailAlerts', e.target.checked)} 
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-white/5">
                <div className="flex gap-4 items-center">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">High Priority Alerts</h4>
                    <p className="text-xs text-slate-400">Immediate notifications for critical issues.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={localSettings.highPriorityAlerts} 
                    onChange={(e) => handleChange('highPriorityAlerts', e.target.checked)} 
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
