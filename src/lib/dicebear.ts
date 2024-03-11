export const getAvatar = (firstName: string, lastName: string): string => {
  return `https://api.dicebear.com/7.x/initials/png?seed=${firstName}+${lastName}&backgroundColor=fd7e46`;
};