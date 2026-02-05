import React, { useState } from 'react';
import { useFlightStore, type FlightLog } from './store';
import { formatMinutes, formatMinutesDecimal } from './utils/time';
import { Plus, X, History, Plane, Calculator, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, parse } from 'date-fns';

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
              <CalculatorView onAdd={(...args: [string, string, string, string]) => { addLog(...args); showToast('Flight Logged!'); }} multipliers={multipliers} setMultipliers={setMultipliers} />
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

const CalculatorView: React.FC<{ onAdd: (depDate: string, arrDate: string, depTime: string, arrTime: string) => void; multipliers: { x: number; y: number }; setMultipliers: (x: number, y: number) => void }> = ({ onAdd, multipliers, setMultipliers }) => {
  const [depDate, setDepDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [arrDate, setArrDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [depTime, setDepTime] = useState('');
  const [arrTime, setArrTime] = useState('');

  const calculateT = () => {
    if (depTime.length !== 4 || arrTime.length !== 4) return 0;
    try {
      const dep = parse(`${depDate} ${depTime}`, 'yyyy-MM-dd HHmm', new Date());
      const arr = parse(`${arrDate} ${arrTime}`, 'yyyy-MM-dd HHmm', new Date());
      if (isNaN(dep.getTime()) || isNaN(arr.getTime())) return 0;
      const diff = (arr.getTime() - dep.getTime()) / (1000 * 60);
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  const T = calculateT();
  const decimalHours = T / 60;
  const Tx = Math.round(decimalHours * multipliers.x * 100) / 100;
  const Ty = Math.round(Tx * multipliers.y * 100) / 100;

  const handleAdd = () => {
    if (T > 0) {
      onAdd(depDate, arrDate, depTime, arrTime);
      setDepTime('');
      setArrTime('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-4 premium-shadow">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">New Flight</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1 font-bold">Departure Date</label>
              <input
                type="date"
                value={depDate}
                onChange={e => {
                  setDepDate(e.target.value);
                  // Default arrival date to same as departure
                  if (arrDate < e.target.value) setArrDate(e.target.value);
                }}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1 font-bold">Arrival Date</label>
              <input
                type="date"
                value={arrDate}
                min={depDate}
                onChange={e => setArrDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1 font-bold">Departure (HHmm)</label>
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
              <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1 font-bold">Arrival (HHmm)</label>
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
                <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1 font-bold">USD Rate (X)</label>
                <input
                  type="number"
                  step="0.1"
                  value={multipliers.x}
                  onChange={e => setMultipliers(parseFloat(e.target.value) || 0, multipliers.y)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 outline-none focus:border-indigo-500 transition-colors text-indigo-400 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest block mb-1 font-bold">QAR Rate (Y)</label>
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
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={20} /> Add to Logs
        </button>
      </div>

      {T > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 grid grid-cols-1 gap-4 premium-shadow bg-indigo-900/10 border-indigo-500/20"
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-sm text-slate-300 font-bold uppercase tracking-widest">Flying Hrs</span>
            <span className="text-2xl font-black text-indigo-400">{formatMinutes(T)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-sm text-slate-300 font-bold uppercase tracking-widest">USD (T x {multipliers.x})</span>
            <span className="text-xl font-black text-purple-400">${Tx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-300 font-bold uppercase tracking-widest">QAR (USD x {multipliers.y})</span>
            <span className="text-xl font-black text-pink-400">{Ty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} QAR</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const HistoryView: React.FC<{ logs: FlightLog[]; onRemove: (id: string) => void }> = ({ logs, onRemove }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold flex items-center gap-2"><History size={20} /> Recent Flights</h2>
    {logs.length === 0 ? (
      <div className="text-center py-10 text-slate-500">No flights logged yet.</div>
    ) : (
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="glass-card p-4 flex justify-between items-center relative group">
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold text-slate-100 truncate">
                {log.depDate && log.arrDate && log.depDate === log.arrDate
                  ? format(parseISO(log.depDate), 'MMM dd, yyyy')
                  : log.depDate && log.arrDate
                    ? `${format(parseISO(log.depDate), 'MMM dd')} - ${format(parseISO(log.arrDate), 'MMM dd, yyyy')}`
                    : 'Invalid Date'}
              </div>
              <div className="text-base text-slate-300 font-bold tracking-wide">{log.depTime} — {log.arrTime}</div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
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

const StatsView: React.FC<{ logs: FlightLog[] }> = ({ logs }) => {
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
        if (!log.depDate) return false;
        const [year, month] = log.depDate.split('-').map(Number);
        return year === selectedYear && (month - 1) === monthIdx;
      })
      .sort((a, b) => (b.depDate || '').localeCompare(a.depDate || ''));
  };

  if (view) {
    const monthlyLogs = getMonthlyLogs(view.monthIdx);
    const totalT = monthlyLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const totalTx = monthlyLogs.reduce((acc, curr) => {
      const decimalHours = curr.durationMinutes / 60;
      const mX = curr.multiplierX ?? multipliers.x;
      return acc + (decimalHours * mX);
    }, 0);
    const totalTy = monthlyLogs.reduce((acc, curr) => {
      const decimalHours = curr.durationMinutes / 60;
      const mX = curr.multiplierX ?? multipliers.x;
      const mY = curr.multiplierY ?? multipliers.y;
      const tx = decimalHours * mX;
      return acc + (tx * mY);
    }, 0);

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
            <div className="text-sm text-slate-400 uppercase font-bold tracking-widest">
              Total Flying Hrs: {formatMinutes(totalT)} ({formatMinutesDecimal(totalT)} hrs)
            </div>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card p-4 bg-purple-500/10 border-purple-500/20">
            <div className="text-xs text-purple-300 uppercase tracking-widest font-black mb-1">Total USD</div>
            <div className="text-xl font-black text-purple-400">${totalTx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-slate-400 font-bold">Converted from decimal hours</div>
          </div>
          <div className="glass-card p-4 bg-pink-500/10 border-pink-500/20">
            <div className="text-xs text-pink-300 uppercase tracking-widest font-black mb-1">Total QAR</div>
            <div className="text-xl font-black text-pink-400">{totalTy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-slate-400 font-bold">Converted from USD</div>
          </div>
        </div>

        <div className="space-y-4">
          {monthlyLogs.map(log => {
            const decimalHours = log.durationMinutes / 60;
            const mX = log.multiplierX ?? multipliers.x;
            const mY = log.multiplierY ?? multipliers.y;
            const Tx = decimalHours * mX;
            const Ty = Tx * mY;
            return (
              <div key={log.id} className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl premium-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-xl font-black text-slate-100 truncate">
                      {log.depDate && log.arrDate && log.depDate === log.arrDate
                        ? format(parseISO(log.depDate), 'dd MMM yyyy')
                        : log.depDate && log.arrDate
                          ? `${format(parseISO(log.depDate), 'dd MMM')} - ${format(parseISO(log.arrDate), 'dd MMM yyyy')}`
                          : 'Invalid Date'}
                    </div>
                    <div className="text-sm text-slate-400 font-bold tracking-wider uppercase mt-1">{log.depTime} — {log.arrTime}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-1 font-bold">Flying Hrs</div>
                    <div className="text-2xl font-black text-indigo-400 leading-none">
                      {formatMinutes(log.durationMinutes)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                  <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                    <span className="text-xs text-indigo-300 uppercase tracking-widest block mb-1 font-black">USD (${mX})</span>
                    <span className="text-xl font-black text-indigo-400 leading-none">${Tx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 text-right">
                    <span className="text-xs text-purple-300 uppercase tracking-widest block mb-1 font-black">QAR (Rate {mY})</span>
                    <span className="text-xl font-black text-purple-400 leading-none">{Ty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            );
          })}
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
          const totalT = monthlyLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
          const totalTx = monthlyLogs.reduce((acc, curr) => {
            const decimalHours = curr.durationMinutes / 60;
            const mX = curr.multiplierX ?? multipliers.x;
            return acc + (decimalHours * mX);
          }, 0);
          const totalTy = monthlyLogs.reduce((acc, curr) => {
            const decimalHours = curr.durationMinutes / 60;
            const mX = curr.multiplierX ?? multipliers.x;
            const mY = curr.multiplierY ?? multipliers.y;
            const tx = decimalHours * mX;
            return acc + (tx * mY);
          }, 0);

          if (totalT === 0) return null;

          return (
            <button
              key={month}
              onClick={() => setView({ monthIdx: idx, monthName: month })}
              className="w-full glass-card p-5 hover:border-indigo-500 hover:bg-indigo-500/5 group transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                  <div className="text-xl font-black text-slate-100 group-hover:text-indigo-400 transition-colors">{month}</div>
                  <div className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">{monthlyLogs.length} Flights</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-400 leading-tight">{formatMinutes(totalT)}</div>
                  <div className="text-xs text-slate-500 font-bold">{formatMinutesDecimal(totalT)} hrs</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <div className="text-left">
                  <div className="text-xs text-purple-300 uppercase tracking-widest font-black">USD Total</div>
                  <div className="text-sm font-black text-purple-400">${totalTx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-pink-300 uppercase tracking-widest font-black">QAR Total</div>
                  <div className="text-sm font-black text-pink-400">{totalTy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
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
