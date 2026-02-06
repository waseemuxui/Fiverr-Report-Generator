
import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const EXCHANGE_RATE = 278;

// --- ICONS ---
const SparklesIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

const ClearIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
  </svg>
);

const DownloadIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const AlertIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
  </svg>
);

const CalculatorIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm2.25-4.5h.008v.008H10.5v-.008Zm0 2.25h.008v.008H10.5v-.008Zm0 2.25h.008v.008H10.5v-.008Zm2.25-4.5h.008v.008H12.75v-.008Zm0 2.25h.008v.008H12.75v-.008Zm0 2.25h.008v.008H12.75v-.008Zm2.25-4.5h.008v.008H15v-.008Zm0 2.25h.008v.008H15v-.008Zm0 2.25h.008v.008H15v-.008ZM7.5 10.5h3v3h-3v-3Zm3-3h3v3h-3v-3Zm-3 0h3v3h-3v-3Zm9-3h-9a2.25 2.25 0 0 0-2.25 2.25v12a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-12a2.25 2.25 0 0 0-2.25-2.25Z" />
  </svg>
);

const UserGroupIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
  </svg>
);

const BriefcaseIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.67.38m-2.72-11.528c-.08-.016-.16-.024-.24-.025h-9.84c-.08 0-.16.009-.24.025m2.72 11.528a9.427 9.427 0 0 1-2.72.632m-4.5-8.006a2.18 2.18 0 0 1-.75-1.661V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
  </svg>
);

const PlusIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const CheckIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const DocumentTextIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const ClockIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const PaperAirplaneIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
);

const FunnelIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
  </svg>
);

// --- GEMINI SERVICE ---
const getFriendlyErrorMessage = (error: any) => {
  const msg = (error.message || error.toString()).toLowerCase();
  if (msg.includes("fetch failed") || msg.includes("network")) return { title: "Network Error", message: "Unable to reach the AI service.", suggestion: "Please check your internet connection." };
  if (msg.includes("401") || msg.includes("api key")) return { title: "Authentication Error", message: "Invalid API Key.", suggestion: "Check your config." };
  return { title: "Unexpected Error", message: error.message || "An unknown error occurred.", suggestion: "Please try again." };
};

const parseOrderData = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Parse the following Fiverr order report text into a structured JSON array. For each order, extract clientName, description, date, status, and calculate the total value. Text: \n---\n${text}\n---`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            clientName: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING },
            value: { type: Type.NUMBER },
            status: { type: Type.STRING },
          },
          required: ["clientName", "description", "date", "value", "status"],
        },
      },
    },
  });

  const parsed = JSON.parse(response.text || "[]");
  return parsed.map((order: any, i: number) => ({
    ...order,
    id: i,
    sheetName: '',
    expense: 0,
    taskNotes: '',
    valuePKR: Math.round(order.value * EXCHANGE_RATE) // Initialize with estimated PKR
  }));
};

// --- MODAL COMPONENT ---
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

// --- TOOLS ---
const FeeCalculatorTool = () => {
  const [amount, setAmount] = useState(100);
  const net = (amount * 0.8).toFixed(2);
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-400">Order Value ($)</label>
      <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="themed-input text-lg" />
      <div className="p-4 bg-slate-900 rounded-lg text-center">
        <div className="text-slate-400 text-sm">Net Profit (Fiverr 20%)</div>
        <div className="text-4xl font-bold text-emerald-400">${net}</div>
      </div>
    </div>
  );
};

const ClientManagerTool = () => {
  const [clients, setClients] = useState([{ id: 1, name: "Sample User", note: "Loves fast deliveries" }]);
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400 italic">Persistent client notes coming soon.</p>
      {clients.map(c => (
        <div key={c.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
          <div className="font-bold">{c.name}</div>
          <div className="text-sm text-slate-400">{c.note}</div>
        </div>
      ))}
    </div>
  );
};

const ProjectTrackerTool = () => {
  const [tasks, setTasks] = useState([{ id: 1, text: "Finish Logo Design", done: false }]);
  return (
    <div className="space-y-2">
      {tasks.map(t => (
        <div key={t.id} className="flex items-center gap-2 p-2 bg-slate-700/20 rounded border border-slate-600">
          <input type="checkbox" checked={t.done} readOnly />
          <span className="text-sm">{t.text}</span>
        </div>
      ))}
    </div>
  );
};

const WordCounterTool = () => {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <div className="space-y-4">
      <textarea className="themed-input h-32 text-sm" placeholder="Paste text..." value={text} onChange={e => setText(e.target.value)} />
      <div className="text-xl font-bold text-center">{words} Words</div>
    </div>
  );
};

const PomodoroTool = () => {
  const [time, setTime] = useState(1500);
  return <div className="text-5xl font-mono text-center py-6">{Math.floor(time/60)}:00</div>;
};

const ProposalTool = () => {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-400">Template for quick bidding:</p>
      <div className="p-3 bg-slate-900 rounded border border-slate-700 text-xs text-slate-300">
        Hi there, I saw your project...
      </div>
    </div>
  );
};

// --- REPORT COMPONENTS ---
const ReportTable = ({ data, onUpdateField }: any) => {
  const [statusFilter, setStatusFilter] = useState('All');

  // Derive unique statuses for the filter
  const statuses = useMemo(() => {
    const s = new Set<string>();
    s.add('All');
    data.forEach((item: any) => s.add(item.status));
    return Array.from(s);
  }, [data]);

  // Filter the data based on status selection
  const filteredData = useMemo(() => {
    if (statusFilter === 'All') return data;
    return data.filter((item: any) => item.status === statusFilter);
  }, [data, statusFilter]);

  const totalValueUSD = filteredData.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0);
  const totalValuePKR = filteredData.reduce((sum: number, item: any) => sum + (Number(item.valuePKR) || 0), 0);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Fiverr Order Report", 14, 20);
    
    const tableBody = filteredData.map((row: any) => [
      row.date, 
      row.clientName, 
      row.taskNotes || '-', 
      row.status,
      `$${Number(row.value).toFixed(2)}`,
      `Rs ${Number(row.valuePKR || 0).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Client', 'Notes', 'Status', 'USD', 'PKR']],
      body: tableBody,
      theme: 'grid',
      foot: [['', '', '', 'Total', `$${totalValueUSD.toFixed(2)}`, `Rs ${totalValuePKR.toLocaleString()}`]],
    });
    doc.save("fiverr_report.pdf");
  };

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">Report Preview <span className="text-xs text-slate-500 font-normal">({filteredData.length} orders)</span></h2>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Status Filter Dropdown */}
          <div className="relative flex-1 sm:flex-none min-w-[150px]">
             <div className="absolute left-3 top-2 text-slate-500 pointer-events-none">
                <FunnelIcon className="w-4 h-4" />
             </div>
             <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="themed-input pl-10 text-xs appearance-none cursor-pointer"
             >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>

          <button onClick={downloadPDF} className="px-4 py-2 bg-emerald-600 rounded text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 whitespace-nowrap">
            <DownloadIcon className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700/50 text-xs font-medium uppercase text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Task Notes</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Value ($)</th>
                <th className="px-4 py-3 text-right">Price (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-sm">
              {filteredData.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-4 font-mono text-xs">{order.date}</td>
                  <td className="px-4 py-4 font-medium text-white">{order.clientName}</td>
                  <td className="px-4 py-4">
                    <input 
                      className="themed-input text-xs border-transparent hover:border-slate-600 bg-transparent focus:bg-slate-900 focus:border-indigo-500" 
                      value={order.taskNotes} 
                      onChange={e => onUpdateField(order.id, 'taskNotes', e.target.value)} 
                      placeholder="Add task note..." 
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      order.status.toLowerCase().includes('completed') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      order.status.toLowerCase().includes('revision') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                      'bg-slate-700 text-slate-300 border border-slate-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-emerald-400 font-bold font-mono">${Number(order.value).toFixed(2)}</td>
                  <td className="px-4 py-4 text-right">
                     <div className="flex justify-end">
                        <input 
                          type="number"
                          className="themed-input text-xs text-right w-24 border-transparent hover:border-slate-600 bg-transparent focus:bg-slate-900 focus:border-indigo-500 font-mono text-cyan-400"
                          value={order.valuePKR || ''} 
                          onChange={e => onUpdateField(order.id, 'valuePKR', Number(e.target.value))} 
                          placeholder="Price PKR" 
                        />
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-700/20 font-bold border-t border-slate-700">
              <tr>
                <td colSpan={4} className="px-4 py-4 text-right text-slate-400 text-xs uppercase tracking-widest">Grand Total:</td>
                <td className="px-4 py-4 text-right text-emerald-400 font-mono text-lg">${totalValueUSD.toFixed(2)}</td>
                <td className="px-4 py-4 text-right text-cyan-400 font-mono text-lg">Rs {totalValuePKR.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

const ContactView = () => (
  <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
    <div className="text-center space-y-2">
      <h1 className="text-4xl font-bold">Contact <span className="text-indigo-400">Us</span></h1>
      <p className="text-slate-400">Need help or want to suggest a feature?</p>
    </div>
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400"><PaperAirplaneIcon className="w-6 h-6" /></div>
        <div>
          <div className="font-bold">Email Support</div>
          <div className="text-slate-400">sitefixs@gmail.com</div>
        </div>
      </div>
      <div className="space-y-4">
        <input className="themed-input" placeholder="Name" />
        <textarea className="themed-input h-32" placeholder="Message..." />
        <button className="w-full py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-bold">Send Message</button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [view, setView] = useState('home');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleGenerate = async (e: any) => {
    const text = e.target.form[0].value;
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseOrderData(text);
      setData(parsed);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const tools: any = {
    calculator: { title: "Fee Calculator", component: <FeeCalculatorTool />, icon: <CalculatorIcon className="w-6 h-6 text-indigo-400" />, desc: "Calculate Fiverr 20% fees." },
    clients: { title: "Client Manager", component: <ClientManagerTool />, icon: <UserGroupIcon className="w-6 h-6 text-cyan-400" />, desc: "Track buyer preferences." },
    projects: { title: "Project Tracker", component: <ProjectTrackerTool />, icon: <BriefcaseIcon className="w-6 h-6 text-emerald-400" />, desc: "Manage active tasks." },
    wordcounter: { title: "Word Counter", component: <WordCounterTool />, icon: <DocumentTextIcon className="w-6 h-6 text-fuchsia-400" />, desc: "Count gig description length." },
    pomodoro: { title: "Timer", component: <PomodoroTool />, icon: <ClockIcon className="w-6 h-6 text-amber-400" />, desc: "Stay focused while working." },
    proposal: { title: "Proposal", component: <ProposalTool />, icon: <PaperAirplaneIcon className="w-6 h-6 text-teal-400" />, desc: "Quick bid templates." }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">SF</div>
            <span className="font-bold text-xl text-indigo-400">SiteFixStudio</span>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <a href="https://sitefixstudio.com" className="text-slate-400 hover:text-white transition-colors">Home</a>
            <button onClick={() => setView('home')} className={view === 'home' ? 'text-white' : 'text-slate-400 hover:text-white'}>Report Tool</button>
            <button onClick={() => setView('contact')} className={view === 'contact' ? 'text-white' : 'text-slate-400 hover:text-white'}>Contact Us</button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-12 py-12">
        {view === 'home' ? (
          <>
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-extrabold tracking-tight">Fiverr <span className="text-indigo-400">Report Maker</span></h1>
              <p className="text-slate-400 max-w-xl mx-auto">Copy-paste your Fiverr order data and transform it into a structured PDF report in seconds.</p>
            </div>

            <form className="space-y-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl" onSubmit={e => e.preventDefault()}>
              <textarea className="themed-input h-64 text-sm font-mono" placeholder="Paste order data here..." disabled={loading} />
              <div className="flex gap-4">
                <button onClick={handleGenerate} disabled={loading} className="flex-1 py-4 bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold flex items-center justify-center gap-2">
                  {loading ? 'Processing AI...' : <><SparklesIcon className="w-5 h-5" /> Generate Report</>}
                </button>
                <button type="reset" onClick={() => setData(null)} className="px-8 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">Clear</button>
              </div>
            </form>

            {error && <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 flex gap-3">
              <AlertIcon className="w-5 h-5" />
              <div>
                <div className="font-bold">{getFriendlyErrorMessage(error).title}</div>
                <div className="text-sm">{getFriendlyErrorMessage(error).message}</div>
              </div>
            </div>}

            {data && <ReportTable data={data} onUpdateField={(id: number, f: string, v: any) => {
              setData(prev => {
                if (!prev) return null;
                return prev.map(item => item.id === id ? { ...item, [f]: v } : item);
              });
            }} />}

            <div className="space-y-6 pt-12 border-t border-slate-800">
              <h2 className="text-2xl font-bold flex items-center gap-2">Freelancer Toolkit <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">6 Tools</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.keys(tools).map(key => (
                  <div key={key} onClick={() => setActiveTool(key)} className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500/50 cursor-pointer transition-all group shadow-lg hover:shadow-indigo-500/5">
                    <div className="mb-4">{tools[key].icon}</div>
                    <h3 className="font-bold mb-1">{tools[key].title}</h3>
                    <p className="text-xs text-slate-500">{tools[key].desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : <ContactView />}
      </div>

      <footer className="p-12 border-t border-slate-800 text-center text-slate-600 text-sm">
        Site Credit: SiteFixStudio.com
      </footer>

      <Modal isOpen={!!activeTool} onClose={() => setActiveTool(null)} title={activeTool ? tools[activeTool].title : ''}>
        {activeTool && tools[activeTool].component}
      </Modal>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
