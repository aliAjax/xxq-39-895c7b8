export const getStartOfDay = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const isSameDay = (ts1: number, ts2: number): boolean => {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const getStartOfWeek = (timestamp: number): number => {
  const date = new Date(timestamp);
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
};

export const getStartOfMonth = (timestamp: number): number => {
  const date = new Date(timestamp);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
};

export const getDaysInMonth = (timestamp: number): number => {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const getMonthMatrix = (monthStart: number): number[] => {
  const startDay = new Date(monthStart).getDay();
  const daysInMonth = getDaysInMonth(monthStart);
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

  const days: number[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startDay;
    const date = new Date(monthStart);
    date.setDate(dayOffset + 1);
    date.setHours(0, 0, 0, 0);
    days.push(date.getTime());
  }
  return days;
};

export const isToday = (timestamp: number): boolean => {
  return isSameDay(timestamp, Date.now());
};

export const isCurrentMonth = (timestamp: number, anchor: number): boolean => {
  const d1 = new Date(timestamp);
  const d2 = new Date(anchor);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

export const formatDateString = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateString = (dateStr: string): number | undefined => {
  if (!dateStr) return undefined;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const formatRangeText = (
  viewMode: 'week' | 'month',
  dates: number[],
  anchor: number
): string => {
  if (viewMode === 'week') {
    const start = new Date(dates[0]);
    const end = new Date(dates[6]);
    const startMonth = start.getMonth() + 1;
    const startDay = start.getDate();
    const endMonth = end.getMonth() + 1;
    const endDay = end.getDate();
    if (startMonth === endMonth) {
      return `${startMonth}月 ${startDay}日 - ${endDay}日`;
    }
    return `${startMonth}月 ${startDay}日 - ${endMonth}月 ${endDay}日`;
  } else {
    const date = new Date(anchor);
    return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
  }
};
