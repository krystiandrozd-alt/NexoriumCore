// TelEnvIQ - Cost Utility Unit Tests
// Tests for currency formatting and cost display functions

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCurrencyPrecise,
  formatCompactNumber,
  formatNumber,
  formatPercentage,
  getChangeColor,
  formatChange,
  getCostItemTypeLabel,
  getCostUnitLabel,
  getAllocationMethodLabel,
} from '@/lib/utils/cost';

// ============================================
// CURRENCY FORMATTING TESTS
// ============================================

describe('formatCurrency', () => {
  it('should format positive numbers as USD by default', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should format negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });

  it('should round to whole numbers', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
    expect(formatCurrency(1234.49)).toBe('$1,234');
  });

  it('should support different currencies', () => {
    expect(formatCurrency(1000, 'EUR')).toContain('1,000');
    expect(formatCurrency(1000, 'GBP')).toContain('1,000');
    expect(formatCurrency(1000, 'AUD')).toContain('1,000');
  });
});

describe('formatCurrencyPrecise', () => {
  it('should include two decimal places', () => {
    expect(formatCurrencyPrecise(1000)).toBe('$1,000.00');
    expect(formatCurrencyPrecise(1234.5)).toBe('$1,234.50');
    expect(formatCurrencyPrecise(1234.56)).toBe('$1,234.56');
  });

  it('should round to two decimal places', () => {
    expect(formatCurrencyPrecise(1234.567)).toBe('$1,234.57');
    expect(formatCurrencyPrecise(1234.564)).toBe('$1,234.56');
  });

  it('should format zero with decimals', () => {
    expect(formatCurrencyPrecise(0)).toBe('$0.00');
  });
});

// ============================================
// COMPACT NUMBER FORMATTING TESTS
// ============================================

describe('formatCompactNumber', () => {
  it('should format small numbers without suffix', () => {
    expect(formatCompactNumber(100)).toBe('100');
    expect(formatCompactNumber(999)).toBe('999');
  });

  it('should format thousands with K suffix', () => {
    expect(formatCompactNumber(1000)).toBe('1K');
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(12345)).toBe('12K');
  });

  it('should format millions with M suffix', () => {
    expect(formatCompactNumber(1000000)).toBe('1M');
    expect(formatCompactNumber(1500000)).toBe('1.5M');
    expect(formatCompactNumber(12345678)).toBe('12M');
  });

  it('should format billions with B suffix', () => {
    expect(formatCompactNumber(1000000000)).toBe('1B');
    expect(formatCompactNumber(2500000000)).toBe('2.5B');
  });
});

// ============================================
// NUMBER FORMATTING TESTS
// ============================================

describe('formatNumber', () => {
  it('should format with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should handle decimal places', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
    expect(formatNumber(1234.567, 0)).toBe('1,235');
    expect(formatNumber(1234.5, 1)).toBe('1,234.5');
  });

  it('should not add unnecessary decimals', () => {
    expect(formatNumber(1000, 2)).toBe('1,000');
    expect(formatNumber(1000.1, 2)).toBe('1,000.1');
  });
});

describe('formatPercentage', () => {
  it('should format as percentage with default decimals', () => {
    expect(formatPercentage(50)).toBe('50%');
    expect(formatPercentage(33.33)).toBe('33.3%');
    expect(formatPercentage(100)).toBe('100%');
  });

  it('should respect decimal parameter', () => {
    expect(formatPercentage(33.333, 2)).toBe('33.33%');
    expect(formatPercentage(33.333, 0)).toBe('33%');
  });

  it('should handle zero and negative percentages', () => {
    expect(formatPercentage(0)).toBe('0%');
    expect(formatPercentage(-10)).toBe('-10%');
  });
});

// ============================================
// CHANGE FORMATTING TESTS
// ============================================

describe('getChangeColor', () => {
  it('should return red for positive change (cost increase)', () => {
    expect(getChangeColor(10)).toBe('text-red-600');
    expect(getChangeColor(0.1)).toBe('text-red-600');
  });

  it('should return green for negative change (cost decrease)', () => {
    expect(getChangeColor(-10)).toBe('text-emerald-600');
    expect(getChangeColor(-0.1)).toBe('text-emerald-600');
  });

  it('should return neutral color for zero change', () => {
    expect(getChangeColor(0)).toBe('text-slate-500');
  });
});

describe('formatChange', () => {
  it('should add plus sign for positive changes', () => {
    expect(formatChange(10)).toBe('+10%');
    expect(formatChange(5.5)).toBe('+5.5%');
  });

  it('should keep minus sign for negative changes', () => {
    expect(formatChange(-10)).toBe('-10%');
    expect(formatChange(-5.5)).toBe('-5.5%');
  });

  it('should format zero change', () => {
    expect(formatChange(0)).toBe('0%');
  });

  it('should handle decimal precision', () => {
    expect(formatChange(33.33)).toBe('+33.3%');
    expect(formatChange(-33.33)).toBe('-33.3%');
  });
});

// ============================================
// LABEL TESTS
// ============================================

describe('getCostItemTypeLabel', () => {
  it('should return correct labels for known types', () => {
    expect(getCostItemTypeLabel('HOST')).toBe('Host/VM');
    expect(getCostItemTypeLabel('COMPONENT_LICENSE')).toBe('License');
    expect(getCostItemTypeLabel('SHARED_PLATFORM')).toBe('Shared Platform');
    expect(getCostItemTypeLabel('OTHER')).toBe('Other');
  });

  it('should return the type itself for unknown types', () => {
    expect(getCostItemTypeLabel('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE');
    expect(getCostItemTypeLabel('CUSTOM')).toBe('CUSTOM');
  });
});

describe('getCostUnitLabel', () => {
  it('should return correct labels for known units', () => {
    expect(getCostUnitLabel('PER_ENV')).toBe('Per Environment');
    expect(getCostUnitLabel('PER_HOST')).toBe('Per Host');
    expect(getCostUnitLabel('PER_COMPONENT')).toBe('Per Component');
    expect(getCostUnitLabel('PER_GB')).toBe('Per GB');
    expect(getCostUnitLabel('PER_USER')).toBe('Per User');
    expect(getCostUnitLabel('OTHER')).toBe('Other');
  });

  it('should return the unit itself for unknown units', () => {
    expect(getCostUnitLabel('PER_REQUEST')).toBe('PER_REQUEST');
    expect(getCostUnitLabel('CUSTOM')).toBe('CUSTOM');
  });
});

describe('getAllocationMethodLabel', () => {
  it('should return correct labels for known methods', () => {
    expect(getAllocationMethodLabel('DIRECT')).toBe('Direct');
    expect(getAllocationMethodLabel('SHARED_PRORATED')).toBe('Shared (Prorated)');
  });

  it('should return the method itself for unknown methods', () => {
    expect(getAllocationMethodLabel('CUSTOM')).toBe('CUSTOM');
    expect(getAllocationMethodLabel('WEIGHTED')).toBe('WEIGHTED');
  });
});

// ============================================
// EDGE CASES
// ============================================

describe('edge cases', () => {
  it('should handle very large numbers', () => {
    expect(formatCurrency(999999999999)).toBe('$999,999,999,999');
    expect(formatCompactNumber(999999999999)).toBe('1T');
  });

  it('should handle very small decimal numbers', () => {
    expect(formatNumber(0.001, 3)).toBe('0.001');
    expect(formatPercentage(0.1, 1)).toBe('0.1%');
  });

  it('should handle infinity', () => {
    expect(formatNumber(Infinity)).toBe('∞');
    expect(formatNumber(-Infinity)).toBe('-∞');
  });

  it('should handle NaN gracefully', () => {
    expect(formatNumber(NaN)).toBe('NaN');
  });
});

// ============================================
// CONSISTENCY TESTS
// ============================================

describe('formatting consistency', () => {
  it('should produce consistent output for same input', () => {
    const amount = 12345.67;
    expect(formatCurrency(amount)).toBe(formatCurrency(amount));
    expect(formatCurrencyPrecise(amount)).toBe(formatCurrencyPrecise(amount));
  });

  it('should maintain precision across formatting methods', () => {
    // Both should represent 1,234 dollars
    const precise = formatCurrencyPrecise(1234);
    const rounded = formatCurrency(1234);

    expect(precise).toBe('$1,234.00');
    expect(rounded).toBe('$1,234');
  });
});
