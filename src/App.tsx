/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Calendar, 
  Clock, 
  FileText, 
  Heart, 
  Info, 
  LineChart as ChartIcon, 
  Pill, 
  Plus, 
  Shield, 
  Stethoscope, 
  User,
  Brain,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

// --- Types ---
interface HealthEvent {
  id: number;
  date: string;
  type: string;
  description: string;
  provider: string;
}

interface Prescription {
  id: number;
  date: string;
  medicine: string;
  dosage: string;
  status: string;
}

interface Vital {
  id: number;
  date: string;
  weight: number;
  bp_sys: number;
  bp_dia: number;
  heart_rate: number;
}

// --- Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "info" }) => {
  const styles = {
    default: "bg-zinc-100 text-zinc-600",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-blue-700"
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'vitals' | 'medicine' | 'ai'>('timeline');
  const [data, setData] = useState<{ events: HealthEvent[], rx: Prescription[], vitals: Vital[] } | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'event' | 'rx' | 'vital'>('event');
  const [formData, setFormData] = useState<any>({});

  const fetchData = () => {
    fetch('/api/health-summary')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Failed to fetch health data", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = modalType === 'event' ? '/api/events' : modalType === 'rx' ? '/api/prescriptions' : '/api/vitals';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({});
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add record", err);
    }
  };

  const generateAiInsight = async () => {
    if (!data) return;
    setIsAiLoading(true);
    setAiResponse("");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      
      const prompt = `
        You are "LifePulse AI", a predictive wellness assistant inspired by Australia's My Health Record system.
        Analyze the following patient data and provide:
        1. A summary of their health journey from birth to now.
        2. Predictive insights: Based on their rising BP and weight in the vitals, what are the risks?
        3. Proactive recommendations: What screenings or lifestyle changes should they consider?
        4. A "Wellness Score" out of 100.

        Patient Data:
        Events: ${JSON.stringify(data.events)}
        Prescriptions: ${JSON.stringify(data.rx)}
        Vitals: ${JSON.stringify(data.vitals)}

        Format the response in clean Markdown with sections. Be professional, encouraging, and clear.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      setAiResponse(response.text || "Unable to generate insights at this time.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiResponse("Error connecting to LifePulse AI. Please check your configuration.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!data) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="w-8 h-8 text-zinc-400 animate-pulse" />
        <p className="text-zinc-500 font-medium">Synchronizing LifePulse Record...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">LifePulse</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Lifelong Health Record</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold">John Doe</span>
              <span className="text-[11px] text-zinc-400 font-mono uppercase tracking-tighter">Medicare: 1234 56789 1</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-black/5 flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-2">
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'timeline' ? 'bg-white shadow-sm border border-black/5 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-200/50'}`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Life Timeline</span>
            </button>
            <button 
              onClick={() => setActiveTab('vitals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'vitals' ? 'bg-white shadow-sm border border-black/5 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-200/50'}`}
            >
              <ChartIcon className="w-5 h-5" />
              <span className="font-medium">Wellness Vitals</span>
            </button>
            <button 
              onClick={() => setActiveTab('medicine')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'medicine' ? 'bg-white shadow-sm border border-black/5 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-200/50'}`}
            >
              <Pill className="w-5 h-5" />
              <span className="font-medium">Medicine Cabinet</span>
            </button>
            <div className="pt-4 mt-4 border-t border-zinc-200">
              <button 
                onClick={() => setActiveTab('ai')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeTab === 'ai' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-200/50'}`}
              >
                <Brain className={`w-5 h-5 ${activeTab === 'ai' ? 'text-emerald-400' : 'group-hover:text-zinc-900'}`} />
                <span className="font-medium">Predictive AI</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'timeline' && (
                <motion.div 
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-semibold tracking-tight">Life Timeline</h2>
                    <button 
                      onClick={() => { setModalType('event'); setIsModalOpen(true); }}
                      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Record
                    </button>
                  </div>
                  
                  <div className="relative pl-8 border-l-2 border-zinc-200 space-y-10">
                    {data.events.map((event, idx) => (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white border-4 border-zinc-900 z-10" />
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="min-w-[120px] pt-0.5">
                            <span className="text-sm font-mono text-zinc-400">{new Date(event.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <Card className="flex-1 p-5 hover:border-zinc-300 transition-colors cursor-default">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={event.type === 'Birth' ? 'success' : event.type === 'Immunization' ? 'info' : 'default'}>
                                  {event.type}
                                </Badge>
                                <h3 className="font-semibold">{event.description}</h3>
                              </div>
                              <Stethoscope className="w-4 h-4 text-zinc-300" />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                              <Shield className="w-3 h-3" />
                              <span>Verified by {event.provider}</span>
                            </div>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'vitals' && (
                <motion.div 
                  key="vitals"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight">Wellness Vitals</h2>
                    <button 
                      onClick={() => { setModalType('vital'); setIsModalOpen(true); }}
                      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Log Vitals
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Current Weight</span>
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-light tracking-tighter">{data.vitals[data.vitals.length - 1]?.weight}</span>
                        <span className="text-zinc-400 font-medium">kg</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-2">+3kg in last 12 months</p>
                    </Card>
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Blood Pressure</span>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-light tracking-tighter">
                          {data.vitals[data.vitals.length - 1]?.bp_sys}/{data.vitals[data.vitals.length - 1]?.bp_dia}
                        </span>
                        <span className="text-zinc-400 font-medium">mmHg</span>
                      </div>
                      <p className="text-[11px] text-amber-600 font-medium mt-2">Slightly Elevated (Stage 1)</p>
                    </Card>
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Heart Rate</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-light tracking-tighter">{data.vitals[data.vitals.length - 1]?.heart_rate}</span>
                        <span className="text-zinc-400 font-medium">bpm</span>
                      </div>
                      <p className="text-[11px] text-emerald-600 font-medium mt-2">Optimal Resting Rate</p>
                    </Card>
                  </div>

                  <Card className="p-8">
                    <h3 className="text-sm font-semibold mb-8 flex items-center gap-2">
                      <ChartIcon className="w-4 h-4" /> Blood Pressure Trends (Last 12 Months)
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.vitals}>
                          <defs>
                            <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#a1a1aa' }}
                            tickFormatter={(val) => new Date(val).toLocaleDateString('en-AU', { month: 'short' })}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#a1a1aa' }}
                            domain={['dataMin - 10', 'dataMax + 10']}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="bp_sys" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorSys)" name="Systolic" />
                          <Area type="monotone" dataKey="bp_dia" stroke="#71717a" strokeWidth={2} fillOpacity={0} name="Diastolic" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'medicine' && (
                <motion.div 
                  key="medicine"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight">Medicine Cabinet</h2>
                    <button 
                      onClick={() => { setModalType('rx'); setIsModalOpen(true); }}
                      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Prescription
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {data.rx.map((rx) => (
                      <Card key={rx.id} className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${rx.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                            <Pill className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{rx.medicine}</h3>
                            <p className="text-sm text-zinc-500">{rx.dosage}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={rx.status === 'Active' ? 'success' : 'default'}>{rx.status}</Badge>
                          <p className="text-[10px] text-zinc-400 mt-1 font-mono">Prescribed: {new Date(rx.date).toLocaleDateString('en-AU')}</p>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                    <Info className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">PBS Safety Net Info</h4>
                      <p className="text-sm text-blue-800/70 mt-1">You are $240.50 away from reaching your PBS Safety Net threshold for 2024. Once reached, your prescriptions will be cheaper or free for the rest of the year.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div 
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                      <Brain className="w-7 h-7 text-emerald-500" /> LifePulse AI
                    </h2>
                    <button 
                      onClick={generateAiInsight}
                      disabled={isAiLoading}
                      className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isAiLoading ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin" /> Analyzing...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Generate New Insight
                        </>
                      )}
                    </button>
                  </div>

                  {!aiResponse && !isAiLoading && (
                    <Card className="p-12 text-center border-dashed border-2 border-zinc-200 bg-transparent">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Brain className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Ready to analyze your health journey?</h3>
                        <p className="text-zinc-500 text-sm mb-8">LifePulse AI uses your lifelong medical history to predict risks and provide proactive wellness advice.</p>
                        <button 
                          onClick={generateAiInsight}
                          className="text-zinc-900 font-bold text-sm underline underline-offset-4 hover:text-zinc-600"
                        >
                          Start AI Analysis
                        </button>
                      </div>
                    </Card>
                  )}

                  {aiResponse && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose prose-zinc max-w-none"
                    >
                      <Card className="p-8 bg-white border-emerald-100 shadow-emerald-500/5">
                        <div className="markdown-body">
                          <ReactMarkdown>{aiResponse}</ReactMarkdown>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-xl font-semibold mb-6">
                  {modalType === 'event' ? 'Add Health Event' : modalType === 'rx' ? 'Add Prescription' : 'Log Vitals'}
                </h3>
                <form onSubmit={handleAddRecord} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Date</label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    
                    {modalType === 'event' && (
                      <>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Type</label>
                          <select 
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            onChange={e => setFormData({...formData, type: e.target.value})}
                          >
                            <option value="Checkup">Checkup</option>
                            <option value="Immunization">Immunization</option>
                            <option value="Injury">Injury</option>
                            <option value="Surgery">Surgery</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Description</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Annual physical exam"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            onChange={e => setFormData({...formData, description: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Provider</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Dr. Smith (GP)"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            onChange={e => setFormData({...formData, provider: e.target.value})}
                          />
                        </div>
                      </>
                    )}

                    {modalType === 'rx' && (
                      <>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Medicine Name</label>
                          <input 
                            type="text" 
                            required
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            onChange={e => setFormData({...formData, medicine: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Dosage</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. 5mg daily"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            onChange={e => setFormData({...formData, dosage: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Status</label>
                          <select 
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            onChange={e => setFormData({...formData, status: e.target.value})}
                          >
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </>
                    )}

                    {modalType === 'vital' && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Weight (kg)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Heart Rate (bpm)</label>
                          <input 
                            type="number" 
                            required
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            onChange={e => setFormData({...formData, heart_rate: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">BP Systolic</label>
                          <input 
                            type="number" 
                            required
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            onChange={e => setFormData({...formData, bp_sys: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">BP Diastolic</label>
                          <input 
                            type="number" 
                            required
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                            onChange={e => setFormData({...formData, bp_dia: parseInt(e.target.value)})}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 pt-6">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm border border-zinc-200 hover:bg-zinc-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
                    >
                      Save Record
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-200 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">Secure Healthcare Data • ISO 27001</span>
          </div>
          <div className="flex gap-8 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <a href="#" className="hover:text-zinc-900">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900">Terms of Service</a>
            <a href="#" className="hover:text-zinc-900">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
