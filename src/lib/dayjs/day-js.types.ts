export type Diff = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  nbrSupps: TimeBeyond;
  nbrNights: {
    hours: string;
    minutes: string;
  };
};

export type DiffWithWT = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  nbrSupps: TimeBeyond;
  nbrNights: {
    hours: string;
    minutes: string;
  };
  workTime: TimeBeyond;
};

export type TimeBeyond = {
  hours: string;
  minutes: string;
}

export type DiffWithLong = {
  isMoreLonger: boolean;
  diff: Diff;
};