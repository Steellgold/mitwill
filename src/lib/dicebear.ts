import { dayJS } from "./dayjs/day-js";

export const getAvatar = (firstName: string, lastName: string): string => {
  return `https://api.dicebear.com/7.x/initials/png?seed=${firstName}+${lastName}&backgroundColor=fd7e46`;
};

export const avatarTime = (url: string | null): string => {
  if (!url) return getAvatar("John", "Doe");

  const dateWithTime = dayJS().format("YYYY-MM-DDTHH:mm:ss");
  if (url.includes("?")) {
    return `${url}&time=${dateWithTime}`;
  }

  return `${url}?time=${dateWithTime}`;
};