import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears } from 'date-fns';

/**
 * Get date range for common periods
 */
export function getDateRange(period: 'today' | 'week' | 'month' | 'year' | 'last30days' | 'last90days' | 'lastYear') {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now) };
    case 'last30days':
      return { start: subDays(now, 30), end: now };
    case 'last90days':
      return { start: subDays(now, 90), end: now };
    case 'lastYear':
      return { start: subYears(now, 1), end: now };
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Group items by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Calculate sum of array values
 */
export function sum(array: number[]): number {
  return array.reduce((total, value) => total + value, 0);
}

/**
 * Calculate average of array values
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}

/**
 * Calculate median of array values
 */
export function median(array: number[]): number {
  if (array.length === 0) return 0;
  const sorted = [...array].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(array: number[]): number {
  if (array.length === 0) return 0;
  const avg = average(array);
  const squareDiffs = array.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(average(squareDiffs));
}

/**
 * Detect outliers using Z-score
 */
export function detectOutliers(values: number[], threshold: number = 2): number[] {
  const avg = average(values);
  const stdDev = standardDeviation(values);
  
  return values.filter(value => {
    const zScore = Math.abs((value - avg) / stdDev);
    return zScore > threshold;
  });
}

/**
 * Paginate results
 */
export function paginate<T>(items: T[], page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  
  return {
    items: paginatedItems,
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
    hasNext: offset + limit < items.length,
    hasPrev: page > 1,
  };
}
