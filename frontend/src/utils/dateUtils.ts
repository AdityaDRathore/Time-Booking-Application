/**
 * Date utility functions for the Time-Booking Application
 */

// Type alias for date input types
export type DateInput = Date | string | number;

// Type alias for date format styles
export type DateFormatStyle = 'short' | 'medium' | 'long';

// Type aliases for date format options
export type DateFormatOptions = {
  short: Intl.DateTimeFormatOptions;
  medium: Intl.DateTimeFormatOptions;
  long: Intl.DateTimeFormatOptions;
};

/**
 * Format a date to a human-readable string
 * @param date Date to format
 * @param format Format style ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export const formatDate = (
  date: DateInput,
  format: DateFormatStyle = 'medium'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const dateOptions: DateFormatOptions = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  };

  return new Intl.DateTimeFormat('en-US', dateOptions[format]).format(dateObj);
};

/**
 * Format a time to a human-readable string
 * @param date Date to extract time from
 * @param includeSeconds Whether to include seconds
 * @returns Formatted time string
 */
export const formatTime = (
  date: DateInput,
  includeSeconds = false
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: true
  };

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Format a datetime to a human-readable string
 * @param date Date to format
 * @param format Format style ('short', 'medium', 'long')
 * @returns Formatted datetime string
 */
export const formatDateTime = (
  date: DateInput,
  format: DateFormatStyle = 'medium'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid datetime';
  }

  const dateTimeOptions: DateFormatOptions = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    medium: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' }
  };

  return new Intl.DateTimeFormat('en-US', dateTimeOptions[format]).format(dateObj);
};

/**
 * Check if a date is today
 * @param date Date to check
 * @returns Boolean indicating if date is today
 */
export const isToday = (date: DateInput): boolean => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is in the past
 * @param date Date to check
 * @returns Boolean indicating if date is in the past
 */
export const isPast = (date: DateInput): boolean => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj < new Date();
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param date Date to calculate relative time from
 * @returns Relative time string
 */
export const getRelativeTime = (date: DateInput): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInDays) >= 7) {
    return formatDate(dateObj);
  } else if (diffInDays !== 0) {
    return formatter.format(diffInDays, 'day');
  } else if (diffInHours !== 0) {
    return formatter.format(diffInHours, 'hour');
  } else if (diffInMins !== 0) {
    return formatter.format(diffInMins, 'minute');
  } else {
    return formatter.format(diffInSecs, 'second');
  }
};