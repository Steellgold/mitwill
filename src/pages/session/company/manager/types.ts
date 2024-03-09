export type DayTimes = {
  monday: { start: string | undefined; end: string | undefined };
  tuesday: { start: string | undefined; end: string | undefined };
  wednesday: { start: string | undefined; end: string | undefined };
  thursday: { start: string | undefined; end: string | undefined };
  friday: { start: string | undefined; end: string | undefined };
  saturday: { start: string | undefined; end: string | undefined; disabled: boolean };
};