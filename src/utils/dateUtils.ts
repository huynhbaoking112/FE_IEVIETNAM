
export const safeParseDate = (dateValue: string | Date | null | undefined): Date => {
  if (!dateValue) {
    return new Date();
  }
  
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? new Date() : dateValue;
  }
  
  const parsedDate = new Date(dateValue);
  return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

export const isValidDate = (date: Date | null | undefined): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};


export const safeDateFormat = (
  date: Date | null | undefined,
  fallback: string = 'Unknown'
): string => {
  if (!isValidDate(date)) {
    return fallback;
  }
  
  try {
    return date!.toLocaleDateString();
  } catch {
    return fallback;
  }
}; 