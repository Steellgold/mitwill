import type { Check } from "../providers/session";
import type { Dayjs } from "./day-js";
import { dayJS } from "./day-js";
import type { DiffWithWT, SimpleDiff, TimeBeyond } from "./day-js.types";

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

export const calculate = (check: Check): DiffWithWT => {
  const start: Dayjs = dayJS(check.start);
  const end: Dayjs | null = check.end ? dayJS(check.end) : null;
  const estimatedEnd: Dayjs = dayJS(check.start).add(7, "hours").add(check.pauseTaken ? 45 : 20, "minutes");

  const diff = end ? end.diff(start, "seconds") : 0;
  const duration = dayJS.duration(diff, "seconds");

  const nbrSupps = calculateTimeBeyond(start, end || estimatedEnd, check.pauseTaken);
  const nbrNights = calculateNightHours(start, end || estimatedEnd);

  return {
    days: duration.days().toString(),
    hours: duration.hours().toString(),
    minutes: duration.minutes().toString(),
    seconds: duration.seconds().toString(),
    nbrSupps,
    nbrNights,
    workTime: calculateWithoutPause(duration.hours().toString() + "h" + duration.minutes().toString(), check.pauseTaken)
  };
};

export const calculateDiff = (start: Dayjs | string, end: Dayjs | string): SimpleDiff => {
  const startTime = dayJS(start);
  const endTime = dayJS(end);
  const duration = dayJS.duration(endTime.diff(startTime));

  return {
    days: duration.days().toString(),
    hours: duration.hours().toString(),
    minutes: duration.minutes().toString(),
    seconds: duration.seconds().toString()
  };
};


const calculateNightHours = (start: Dayjs, end: Dayjs): { hours: string; minutes: string } => {
  let nightStart = start.set({ hour: 21, minute: 30, second: 0 });
  if (start.isAfter(nightStart)) {
    nightStart = nightStart.add(1, "day");
  }
  const nightEnd = nightStart.clone().set({ hour: 6, minute: 0, second: 0 }).add(1, "day");

  if (start.isBefore(nightStart) && end.isAfter(nightStart)) {
    nightStart = start.clone().set({ hour: 21, minute: 30, second: 0 });
  }

  let nightHours = 0;
  let nightMinutes = 0;

  if (start.isBefore(nightEnd) && end.isAfter(nightStart)) {
    const nightPeriodStart = start.isAfter(nightStart) ? start : nightStart;
    const nightPeriodEnd = end.isBefore(nightEnd) ? end : nightEnd;
    const nightDiff = nightPeriodEnd.diff(nightPeriodStart, "minutes");
    nightHours = Math.floor(nightDiff / 60);
    nightMinutes = nightDiff % 60;
  }

  return {
    hours: nightHours.toString().padStart(2, "0"),
    minutes: nightMinutes.toString().padStart(2, "0")
  };
};

const calculateWithoutPause = (time: string, pt = true): TimeBeyond => {
  const timeArray = time.split("h");
  const hours = parseInt(timeArray[0]);
  const minutes = parseInt(timeArray[1].replace("m", ""));
  const pause = pt ? 45 : 20;
  const pauseHours = Math.floor(pause / 60);
  const pauseMinutes = pause % 60;
  let newMinutes = minutes - pauseMinutes;
  let newHours = hours - pauseHours;

  if (newMinutes < 0) {
    newMinutes += 60;
    newHours -= 1;
  }

  return {
    hours: newHours.toString().padStart(2, "0"),
    minutes: newMinutes.toString().padStart(2, "0")
  };
};

export const calculateTimeBeyond = (start: Dayjs | string, end: Dayjs | string, pt = true): TimeBeyond => {
  const startTime = dayJS(start);
  const endTime = dayJS(end);
  const diffDuration = dayJS.duration(endTime.diff(startTime));
  const referenceDuration = dayJS.duration({ hours: 7, minutes: pt ? 45 : 20 });

  if (diffDuration.asMinutes() > referenceDuration.asMinutes()) {
    const beyondDuration = dayJS.duration(diffDuration.asMilliseconds() - referenceDuration.asMilliseconds());
    return {
      hours: addLeadingZero(beyondDuration.hours() + (beyondDuration.days() * 24)),
      minutes: addLeadingZero(beyondDuration.minutes())
    };
  }

  return { hours: "00", minutes: "00" };
};

export const addLeadingZero = (number: number): string => number < 10 ? `0${number}` : `${number}`;