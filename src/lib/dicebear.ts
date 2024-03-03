export const getAvatar = (value?: string): string => {
  return `https://api.dicebear.com/7.x/avataaars-neutral/png?seed=${value ?? "Cuddles"}&backgroundColor=f8d25c,ffdbb4,edb98a,ffdfbf`;
};