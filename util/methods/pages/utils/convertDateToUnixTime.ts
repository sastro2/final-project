export const unixTimeFromDate = (date: Date): number => {
  date = new Date(date);
  return Math.floor(date.getTime() / 1000);
};

export const unixTimeFromNumber = (dateAsNumber: number): number => {
  const date = new Date(dateAsNumber);
  return unixTimeFromDate(date);
};
