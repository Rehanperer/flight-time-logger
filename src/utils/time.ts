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

import { differenceInMinutes, parse } from 'date-fns';

export function calculateDurationMinutes(depDate: string, depTime: string, arrDate: string, arrTime: string) {
    const dep = parse(`${depDate} ${depTime}`, 'yyyy-MM-dd HHmm', new Date());
    const arr = parse(`${arrDate} ${arrTime}`, 'yyyy-MM-dd HHmm', new Date());

    if (isNaN(dep.getTime()) || isNaN(arr.getTime())) return 0;

    const diff = differenceInMinutes(arr, dep);
    return diff > 0 ? diff : 0;
}

export function adjustDurationMinutes(minutes: number) {
    // Rule: If flight is between 10 and 24 hours, it counts as 24 hours
    const tenHoursInMinutes = 10 * 60;
    const twentyFourHoursInMinutes = 24 * 60;

    if (minutes >= tenHoursInMinutes && minutes <= twentyFourHoursInMinutes) {
        return twentyFourHoursInMinutes;
    }
    return minutes;
}

export function formatMinutes(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

export function formatMinutesDecimal(totalMinutes: number) {
    return (totalMinutes / 60).toFixed(2);
}
