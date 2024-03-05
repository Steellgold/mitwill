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
  if (!date) return dayJS().format("dddd DD MMMM YYYY").replace(/(^\w{1})/g, letter => letter.toUpperCase());
  return dayJS(date).format("dddd DD MMMM YYYY").replace(/(^\w{1})/g, letter => letter.toUpperCase());
};

export const mjday = (date?: Date | string): string => {
  if (!date) return dayJS().format("dddd").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  return dayJS(date).format("dddd").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

export const mjmonth = (date?: Date | string): string => {
  if (!date) return dayJS().format("MMMM").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  return dayJS(date).format("MMMM").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

export const calculateDiff = (
  start: Date | string,
  end: Date | string,
  addZero = true,
  defaultStartHour = "06:00",
  defaultEndHour = "14:00",
  remove: {
    hours: number;
    minutes: number;
  } = { hours: 0, minutes: 0 }
): Diff => {
  const startDate = dayJS(start);
  const endDate = dayJS(end);
  const diff = endDate.diff(startDate);

  const totalDuration = dayJS.duration(diff);
  let days = totalDuration.days().toString();
  let hours = totalDuration.hours().toString();
  let minutes = totalDuration.minutes().toString();
  let seconds = totalDuration.seconds().toString();

  if (addZero) {
    days = addLeadingZero(days);
    hours = addLeadingZero(hours);
    minutes = addLeadingZero(minutes);
    seconds = addLeadingZero(seconds);
  }

  let nbrSuppsMinutes = 0;
  let nbrNightsMinutes = 0;

  let currentTime = startDate;
  while (currentTime < endDate) {
    const hour = currentTime.hour();
    const minute = currentTime.minute();
    const currentMinutes = hour * 60 + minute;
    const nightStart = 21 * 60 + 30;
    const nightEnd = 6 * 60;
    const overtimeStart = dayJS(defaultStartHour, "HH:mm").hour() * 60;
    const overtimeEnd = dayJS(defaultEndHour, "HH:mm").hour() * 60;

    if ((currentMinutes >= nightStart) || (currentMinutes < nightEnd)) {
      nbrNightsMinutes++;
    }

    if (currentMinutes < overtimeStart || currentMinutes >= overtimeEnd) {
      nbrSuppsMinutes++;
    }

    currentTime = currentTime.add(1, "minute");
  }

  function addLeadingZero(number: string): string {
    return parseInt(number) < 10 ? `0${number}` : number;
  }

  const convertMinutesToHoursAndMinutes = (totalMinutes: number): { hours: string; minutes: string } => ({
    hours: addLeadingZero(Math.floor(totalMinutes / 60).toString()),
    minutes: addLeadingZero((totalMinutes % 60).toString())
  });

  const nbrSupps = convertMinutesToHoursAndMinutes(nbrSuppsMinutes);
  const nbrNights = convertMinutesToHoursAndMinutes(nbrNightsMinutes);

  if (remove.hours > 0) {
    hours = (parseInt(hours) - remove.hours).toString();
  }

  if (remove.minutes > 0) {
    minutes = (parseInt(minutes) - remove.minutes).toString();
  }

  return { days, hours, minutes, seconds, nbrSupps, nbrNights };
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

export const calculateNightHours = (shiftData: WeekShifts[]): number => {
  if (shiftData.length === 0) return 0;
  let hours = 0;
  shiftData.map(week => week.shifts.map(shift => {
    const start = dayJS(shift.start);
    const end = dayJS(shift.end);
    const diff = end.diff(start, "hours");
    if (diff > 0) hours += diff;
  }));

  return hours;
};