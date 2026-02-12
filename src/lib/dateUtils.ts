import { format, formatDistanceToNow, isValid } from 'date-fns';

/**
 * Safely parses a date string or Date object.
 * Returns a valid Date object or null if invalid.
 */
export const safeParseDate = (date: string | number | Date | null | undefined): Date | null => {
  if (!date) return null;
  const parsedDate = new Date(date);
  return isValid(parsedDate) ? parsedDate : null;
};

/**
 * Safely formats a date using date-fns format.
 * Returns a fallback string if the date is invalid.
 */
export const safeFormatSnapshot = (
  date: string | number | Date | null | undefined,
  formatStr: string = 'PPpp',
  fallback: string = 'Unknown time'
): string => {
  try {
    const parsedDate = safeParseDate(date);
    if (!parsedDate) return fallback;
    return format(parsedDate, formatStr);
  } catch {
    return fallback;
  }
};

/**
 * Safely formats a relative date using date-fns formatDistanceToNow.
 * Returns a fallback string if the date is invalid.
 */
export const safeFormatDistanceToNow = (
  date: string | number | Date | null | undefined,
  options: { addSuffix?: boolean } = { addSuffix: true },
  fallback: string = 'Recently'
): string => {
  try {
    const parsedDate = safeParseDate(date);
    if (!parsedDate) return fallback;
    return formatDistanceToNow(parsedDate, options);
  } catch {
    return fallback;
  }
};
