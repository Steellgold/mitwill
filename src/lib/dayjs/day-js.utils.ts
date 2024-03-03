import { dayJS } from "./day-js";
import type { Diff } from "./day-js.types";

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const calculateHours = (start: Date, end: Date): number => {
  const diff = end.getTime() - start.getTime();
  return diff / (1000 * 60 * 60);
};

export const majdate = (date?: Date | string): string => {
  if (!date) return dayJS().format("dddd DD MMMM YYYY").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  return dayJS(date).format("dddd DD MMMM YYYY").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

export const mjday = (date?: Date | string): string => {
  if (!date) return dayJS().format("dddd").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  return dayJS(date).format("dddd").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

export const mjmonth = (date?: Date | string): string => {
  if (!date) return dayJS().format("MMMM").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  return dayJS(date).format("MMMM").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

export const calculateDiff = (start: Date | string, end: Date | string, addZero = true): Diff => {
  const startDate = dayJS(start);
  const endDate = dayJS(end);
  const diff = endDate.diff(startDate);

  const duration = dayJS.duration(diff);
  let days = duration.days().toString();
  let hours = duration.hours().toString();
  let minutes = duration.minutes().toString();
  let seconds = duration.seconds().toString();

  if (addZero) {
    if (parseInt(days) < 10) days = `0${days}`;
    if (parseInt(hours) < 10) hours = `0${hours}`;
    if (parseInt(minutes) < 10) minutes = `0${minutes}`;
    if (parseInt(seconds) < 10) seconds = `0${seconds}`;
  }

  return { days, hours, minutes, seconds };
};

export type ShiftB = {
  start: string;
  end: string | null;
};

export type WeekShifts = {
  weekKey: number;
  shifts: ShiftB[];
};

export function nbrDaysWork(shiftData: WeekShifts[]): number {
  if (shiftData.length === 0) return 0;
  let days = 0;
  shiftData.map(week => week.shifts.map(() => days += 1));

  return days;
}