// TelEnvIQ - Cost Utility Functions

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with decimals for currency display
 */
export function formatCurrencyPrecise(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with compact notation (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Get color class based on change direction
 */
export function getChangeColor(change: number): string {
  if (change > 0) return 'text-red-600';
  if (change < 0) return 'text-emerald-600';
  return 'text-slate-500';
}

/**
 * Format a change as +/- percentage
 */
export function formatChange(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${formatNumber(change, 1)}%`;
}

/**
 * Get cost item type display label
 */
export function getCostItemTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    HOST: 'Host/VM',
    COMPONENT_LICENSE: 'License',
    SHARED_PLATFORM: 'Shared Platform',
    OTHER: 'Other',
  };
  return labels[type] || type;
}

/**
 * Get cost unit display label
 */
export function getCostUnitLabel(unit: string): string {
  const labels: Record<string, string> = {
    PER_ENV: 'Per Environment',
    PER_HOST: 'Per Host',
    PER_COMPONENT: 'Per Component',
    PER_GB: 'Per GB',
    PER_USER: 'Per User',
    OTHER: 'Other',
  };
  return labels[unit] || unit;
}

/**
 * Get allocation method display label
 */
export function getAllocationMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    DIRECT: 'Direct',
    SHARED_PRORATED: 'Shared (Prorated)',
  };
  return labels[method] || method;
}
