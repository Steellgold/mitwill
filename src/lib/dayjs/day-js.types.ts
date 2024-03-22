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

export type SimpleDiff = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export type PauseDiff = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;

  nbr20Taken: number;
  nbr45Taken: number;
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