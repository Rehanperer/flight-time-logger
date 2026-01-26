import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function parseHoursMinutes(timeStr: string) {
    // Input format: HHmm (e.g., 0630)
    const clean = timeStr.replace(/[^\d]/g, '');
    if (clean.length !== 4) return null;

    const hours = parseInt(clean.substring(0, 2), 10);
    const minutes = parseInt(clean.substring(2, 4), 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return { hours, minutes };
}

export function calculateDurationMinutes(depTime: string, arrTime: string) {
    const dep = parseHoursMinutes(depTime);
    const arr = parseHoursMinutes(arrTime);

    if (!dep || !arr) return 0;

    let depTotal = dep.hours * 60 + dep.minutes;
    let arrTotal = arr.hours * 60 + arr.minutes;

    if (arrTotal < depTotal) {
        // Over midnight
        arrTotal += 24 * 60;
    }

    return arrTotal - depTotal;
}

export function formatMinutes(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

export function formatMinutesDecimal(totalMinutes: number) {
    return (totalMinutes / 60).toFixed(2);
}
