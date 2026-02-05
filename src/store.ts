import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateDurationMinutes } from './utils/time';

export interface FlightLog {
    id: string;
    depDate: string;
    arrDate: string;
    depTime: string; // HHmm format
    arrTime: string; // HHmm format
    durationMinutes: number;
    multiplierX: number;
    multiplierY: number;
}

interface FlightState {
    logs: FlightLog[];
    multipliers: {
        x: number;
        y: number;
    };
    addLog: (depDate: string, arrDate: string, depTime: string, arrTime: string, multiplierX: number, multiplierY: number) => void;
    removeLog: (id: string) => void;
    setMultipliers: (x: number, y: number) => void;
}

export const useFlightStore = create<FlightState>()(
    persist(
        (set) => ({
            logs: [],
            multipliers: {
                x: 1.5,
                y: 2.0,
            },
            addLog: (depDate, arrDate, depTime, arrTime, multiplierX, multiplierY) => {
                const durationMinutes = calculateDurationMinutes(depDate, depTime, arrDate, arrTime);
                const newLog: FlightLog = {
                    id: crypto.randomUUID(),
                    depDate,
                    arrDate,
                    depTime,
                    arrTime,
                    durationMinutes,
                    multiplierX,
                    multiplierY,
                };
                set((state) => ({ logs: [newLog, ...state.logs] }));
            },
            removeLog: (id) =>
                set((state) => ({ logs: state.logs.filter((log) => log.id !== id) })),
            setMultipliers: (x, y) => set({ multipliers: { x, y } }),
        }),
        {
            name: 'flight-storage',
            version: 3,
            migrate: (persistedState: any, version: number) => {
                const today = new Date().toISOString().split('T')[0];
                if (version < 1) {
                    if (persistedState && persistedState.logs) {
                        persistedState.logs = persistedState.logs.map((log: any) => ({
                            ...log,
                            depDate: log.depDate || log.date || today,
                            arrDate: log.arrDate || log.date || today,
                        }));
                    }
                }

                // Version 1 or 2 to 3: Ensure all logs have multiplierX and multiplierY
                if (version < 3) {
                    if (persistedState && persistedState.logs) {
                        const defaultX = persistedState.multipliers?.x || 1.5;
                        const defaultY = persistedState.multipliers?.y || 3.64;
                        persistedState.logs = persistedState.logs.map((log: any) => ({
                            ...log,
                            multiplierX: log.multiplierX ?? defaultX,
                            multiplierY: log.multiplierY ?? defaultY,
                        }));
                    }
                }
                return persistedState;
            },
        }
    )
);
