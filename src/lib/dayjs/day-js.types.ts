export type Diff = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  nbrSupps: {
    hours: string;
    minutes: string;
  };
  nbrNights: {
    hours: string;
    minutes: string;
  };
};

export type DiffWithLong = {
  isMoreLonger: boolean;
  diff: Diff;
};