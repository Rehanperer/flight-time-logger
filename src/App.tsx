import React, { useState } from 'react';
import { useFlightStore } from './store';
import { formatMinutes, formatMinutesDecimal } from './utils/time';
import { Plus, X, History, Plane, Calculator, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';

const App: React.FC = () => {
  const { logs, multipliers, addLog, removeLog, setMultipliers } = useFlightStore();
  const [activeTab, setActiveTab] = useState<'calc' | 'history' | 'stats'>('calc');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    removeLog(id);
    setConfirmDelete(null);
    showToast('Flight log deleted', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Background blobs for premium look */}
      <div className="absolute top-[-10%] left-[-10%] w-60 h-60 bg-indigo-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-purple-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />

      <header className="p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Plane className="text-indigo-400 w-8 h-8" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            FlightLogger
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 z-10 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'calc' && (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CalculatorView onAdd={(...args: any[]) => { addLog(...(args as [any, any, any])); showToast('Flight Logged!'); }} multipliers={multipliers} setMultipliers={setMultipliers} />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HistoryView logs={logs} onRemove={(id) => setConfirmDelete({ id })} />
            </motion.div>
          )}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StatsView logs={logs} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-slate-800 px-6 py-4 flex justify-around items-center z-20">
        <NavButton active={activeTab === 'calc'} onClick={() => setActiveTab('calc')} icon={<Calculator />} label="Log" />
        <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History />} label="Logs" />
        <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<Plane />} label="Stats" />
      </nav>

      {/* Custom Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full glass border border-white/10 shadow-2xl flex items-center gap-3 ${toast.type === 'success' ? 'bg-indigo-600/20' : 'bg-slate-800/40'}`}
          >
            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-indigo-400' : 'bg-slate-400'}`} />
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs glass-card p-6 premium-shadow"
            >
              <h3 className="text-lg font-bold mb-2">Delete Log?</h3>
              <p className="text-slate-400 text-sm mb-6">Are you sure you want to delete this flight log? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete.id)}
                  className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

// --- VIEW COMPONENTS ---

const CalculatorView: React.FC<{ onAdd: any; multipliers: any; setMultipliers: any }> = ({ onAdd, multipliers, setMultipliers }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [depTime, setDepTime] = useState('');
  const [arrTime, setArrTime] = useState('');

  const calculateT = () => {
    if (depTime.length !== 4 || arrTime.length !== 4) return 0;
    // Simple duration calc logic reused here for preview
    const parse = (t: string) => ({ h: parseInt(t.slice(0, 2)), m: parseInt(t.slice(2)) });
    const d = parse(depTime);
    const a = parse(arrTime);
    let diff = (a.h * 60 + a.m) - (d.h * 60 + d.m);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };

  const T = calculateT();

  const handleAdd = () => {
    if (T > 0) {
      onAdd(date, depTime, arrTime);
      setDepTime('');
      setArrTime('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-4 premium-shadow">
        <h2 className="text-xl font-semibold mb-2">New Flight</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Departure (HHmm)</label>
              <input
                type="text"
                maxLength={4}
                placeholder="0800"
                value={depTime}
                onChange={e => setDepTime(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Arrival (HHmm)</label>
              <input
                type="text"
                maxLength={4}
                placeholder="2020"
                value={arrTime}
                onChange={e => setArrTime(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-4">
            <h3 className="text-sm font-medium text-slate-300">Multipliers</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Multiplier X</label>
                <input
                  type="number"
                  step="0.1"
                  value={multipliers.x}
                  onChange={e => setMultipliers(parseFloat(e.target.value) || 0, multipliers.y)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 outline-none focus:border-indigo-500 transition-colors text-indigo-400 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Multiplier Y</label>
                <input
                  type="number"
                  step="0.1"
                  value={multipliers.y}
                  onChange={e => setMultipliers(multipliers.x, parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 outline-none focus:border-purple-500 transition-colors text-purple-400 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={T === 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
        >
          <Plus size={20} /> Add to Logs
        </button>
      </div>

      {T > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 grid grid-cols-1 gap-4 premium-shadow bg-indigo-900/10"
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-slate-400 font-medium">Total Flight Time (T)</span>
            <span className="text-2xl font-bold text-indigo-400">{formatMinutes(T)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-slate-400 font-medium">T x {multipliers.x} (Tx)</span>
            <span className="text-xl font-bold text-purple-400">{formatMinutes(Math.round(T * multipliers.x))}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">T x {multipliers.y} (Ty)</span>
            <span className="text-xl font-bold text-pink-400">{formatMinutes(Math.round(T * multipliers.y))}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const HistoryView: React.FC<{ logs: any[]; onRemove: (id: string) => void }> = ({ logs, onRemove }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold flex items-center gap-2"><History size={20} /> Recent Flights</h2>
    {logs.length === 0 ? (
      <div className="text-center py-10 text-slate-500">No flights logged yet.</div>
    ) : (
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="glass-card p-4 flex justify-between items-center relative group">
            <div>
              <div className="text-base font-bold text-slate-100">{format(parseISO(log.date), 'MMM dd, yyyy')}</div>
              <div className="text-sm text-slate-400 font-medium tracking-wide tracking-wider">{log.depTime} — {log.arrTime}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-indigo-400">{formatMinutes(log.durationMinutes)}</div>
            </div>
            <button
              onClick={() => onRemove(log.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const StatsView: React.FC<{ logs: any[] }> = ({ logs }) => {
  const { multipliers } = useFlightStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [view, setView] = useState<{ monthIdx: number; monthName: string } | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getMonthlyLogs = (monthIdx: number) => {
    return logs
      .filter(log => {
        const [year, month] = log.date.split('-').map(Number);
        return year === selectedYear && (month - 1) === monthIdx;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  if (view) {
    const monthlyLogs = getMonthlyLogs(view.monthIdx);
    const total = monthlyLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6 pb-10"
      >
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => setView(null)}
            className="p-2 glass rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={20} className="text-indigo-400" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-100">{view.monthName} {selectedYear}</h2>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">
              Total: {formatMinutes(total)} ({formatMinutesDecimal(total)} hrs)
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {monthlyLogs.map(log => (
            <div key={log.id} className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl premium-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xl font-black text-slate-100">{format(parseISO(log.date), 'dd MMM yyyy')}</div>
                  <div className="text-sm text-slate-400 font-bold tracking-wider uppercase mt-1">{log.depTime} — {log.arrTime}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1 font-bold">Duration</div>
                  <div className="text-2xl font-black text-indigo-400 leading-none">
                    {formatMinutes(log.durationMinutes)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                  <span className="text-[10px] text-indigo-400/70 uppercase tracking-widest block mb-2 font-black">TX ({multipliers.x})</span>
                  <span className="text-xl font-black text-indigo-400 leading-none">{formatMinutes(Math.round(log.durationMinutes * multipliers.x))}</span>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 text-right">
                  <span className="text-[10px] text-purple-400/70 uppercase tracking-widest block mb-2 font-black">TY ({multipliers.y})</span>
                  <span className="text-xl font-black text-purple-400 leading-none">{formatMinutes(Math.round(log.durationMinutes * multipliers.y))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-100">Monthly Stats</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">View history by month</p>
        </div>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-colors"
        >
          {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {months.map((month, idx) => {
          const monthlyLogs = getMonthlyLogs(idx);
          const total = monthlyLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);

          if (total === 0) return null;

          return (
            <button
              key={month}
              onClick={() => setView({ monthIdx: idx, monthName: month })}
              className="w-full glass-card p-5 flex justify-between items-center hover:border-indigo-500 hover:bg-indigo-500/5 group transition-all"
            >
              <div className="text-left">
                <div className="text-xl font-black text-slate-100 group-hover:text-indigo-400 transition-colors">{month}</div>
                <div className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">{monthlyLogs.length} Flights</div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <div className="text-2xl font-black text-indigo-400 leading-tight">{formatMinutes(total)}</div>
                  <div className="text-sm text-slate-500 uppercase font-black tracking-tight">{formatMinutesDecimal(total)} hours</div>
                </div>
                <Plus size={24} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
              </div>
            </button>
          );
        })}
        {logs.length > 0 && months.every((_, idx) => getMonthlyLogs(idx).length === 0) && (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
            <Plane size={40} className="mx-auto text-slate-800 mb-4 opacity-20" />
            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No logs for {selectedYear}</p>
          </div>
        )}
        {logs.length === 0 && (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
            <Calculator size={40} className="mx-auto text-slate-800 mb-4 opacity-20" />
            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No flights logged yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
