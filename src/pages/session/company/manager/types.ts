export type DayTimes = {
  sunday: { start: string | undefined; end: string | undefined; disabled: boolean };
  monday: { start: string | undefined; end: string | undefined; disabled: boolean };
  tuesday: { start: string | undefined; end: string | undefined; disabled: boolean };
  wednesday: { start: string | undefined; end: string | undefined; disabled: boolean };
  thursday: { start: string | undefined; end: string | undefined; disabled: boolean };
  friday: { start: string | undefined; end: string | undefined; disabled: boolean };
  saturday: { start: string | undefined; end: string | undefined; disabled: boolean };
};

export type PlanningData = {
  by: string;
  for: string[];
  from: string;
  to: string;
  monday_start: string | undefined;
  monday_end: string | undefined;
  tuesday_start: string | undefined;
  tuesday_end: string | undefined;
  wednesday_start: string | undefined;
  wednesday_end: string | undefined;
  thursday_start: string | undefined;
  thursday_end: string | undefined;
  friday_start: string | undefined;
  friday_end: string | undefined;
  saturday_start: string | undefined;
  saturday_end: string | undefined;
  sunday_start: string | undefined;
  sunday_end: string | undefined;
  is_night: boolean;
};