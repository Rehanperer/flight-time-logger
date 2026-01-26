import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateDurationMinutes } from './utils/time';

export interface FlightLog {
    id: string;
    date: string;
    depTime: string; // HHmm format
    arrTime: string; // HHmm format
    durationMinutes: number;
}

interface FlightState {
    logs: FlightLog[];
    multipliers: {
        x: number;
        y: number;
    };
    addLog: (date: string, depTime: string, arrTime: string) => void;
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
            addLog: (date, depTime, arrTime) => {
                const durationMinutes = calculateDurationMinutes(depTime, arrTime);
                const newLog: FlightLog = {
                    id: crypto.randomUUID(),
                    date,
                    depTime,
                    arrTime,
                    durationMinutes,
                };
                set((state) => ({ logs: [newLog, ...state.logs] }));
            },
            removeLog: (id) =>
                set((state) => ({ logs: state.logs.filter((log) => log.id !== id) })),
            setMultipliers: (x, y) => set({ multipliers: { x, y } }),
        }),
        {
            name: 'flight-storage',
        }
    )
);
