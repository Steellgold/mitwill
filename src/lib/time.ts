export const fixTime = (time: string | null): string => {
  if (!time) return "00:00";

  const [h, m] = time.split(":");
  return `${h.length === 1 ? `0${h}` : h}:${m.length === 1 ? `${m}0` : m}`;
};

export const fixURLCache = (url: string): string => {
  return `${url}?${new Date().getDay()}`;
};