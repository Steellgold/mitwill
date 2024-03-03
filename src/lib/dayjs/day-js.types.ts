export type Diff = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export type DiffWithLong = {
  isMoreLonger: boolean;
  diff: Diff;
};