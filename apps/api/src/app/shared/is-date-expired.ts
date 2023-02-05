export const isDateExpired = (date: Date): boolean =>
  date.getTime() < Date.now();
