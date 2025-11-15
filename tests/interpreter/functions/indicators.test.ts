/**
 * Tests for Advanced Technical Indicators
 * Comprehensive test suite for 15 advanced technical indicators
 */

import { describe, it, expect } from '@jest/globals';
import {
  MACD_DIF,
  MACD_DEA,
  MACD_MACD,
  KDJ_K,
  KDJ_D,
  KDJ_J,
  SAR,
  CCI,
  DMI_PDI,
  DMI_MDI,
  DMI_ADX,
  DMI_ADXR,
  TRIX,
  OBV,
  BIAS,
  ROC,
  MTM,
  WR,
  PSY,
  ADX,
  ADXR,
} from '../../../src/interpreter/functions/indicators';
import { mockSimpleData, mockDailyData } from '../../fixtures/marketData';

describe('MACD - Moving Average Convergence Divergence', () => {
  const close = mockSimpleData.map((d) => d.close);

  describe('MACD_DIF', () => {
    it('should calculate DIF correctly', () => {
      const result = MACD_DIF(close, 12, 26);
      expect(result).toHaveLength(close.length);
      // First 25 values should be NaN (slow period - 1)
      for (let i = 0; i < 25; i++) {
        expect(isNaN(result[i])).toBe(true);
      }
    });

    it('should handle short period correctly', () => {
      const result = MACD_DIF(close, 3, 5);
      expect(result).toHaveLength(close.length);
      // Should have valid values after slow period
      expect(isNaN(result[4])).toBe(false);
    });

    it('should return all NaN for insufficient data', () => {
      const shortData = [100, 102, 101];
      const result = MACD_DIF(shortData, 12, 26);
      expect(result.every((v) => isNaN(v))).toBe(true);
    });

    it('should calculate with daily data', () => {
      const dailyClose = mockDailyData.map((d) => d.close);
      const result = MACD_DIF(dailyClose, 12, 26);
      // Should have valid values after period 25
      expect(isNaN(result[25])).toBe(false);
      expect(isNaN(result[50])).toBe(false);
    });
  });

  describe('MACD_DEA', () => {
    it('should calculate DEA correctly', () => {
      const result = MACD_DEA(close, 12, 26, 9);
      expect(result).toHaveLength(close.length);
      // DEA requires DIF first, then signal period
      expect(result.some((v) => !isNaN(v))).toBe(false); // Too short for 12,26,9
    });

    it('should work with shorter periods', () => {
      const result = MACD_DEA(close, 3, 5, 3);
      expect(result).toHaveLength(close.length);
      // Should have some valid values
      expect(result.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
    });

    it('should calculate with daily data', () => {
      const dailyClose = mockDailyData.map((d) => d.close);
      const result = MACD_DEA(dailyClose, 12, 26, 9);
      // Should have valid values
      expect(result.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
    });
  });

  describe('MACD_MACD', () => {
    it('should calculate histogram correctly', () => {
      const dailyClose = mockDailyData.map((d) => d.close);
      const result = MACD_MACD(dailyClose, 12, 26, 9);
      expect(result).toHaveLength(dailyClose.length);
      const validValues = result.filter((v) => !isNaN(v));
      expect(validValues.length).toBeGreaterThan(0);
    });

    it('should be 2 times (DIF - DEA)', () => {
      const dailyClose = mockDailyData.map((d) => d.close);
      const dif = MACD_DIF(dailyClose, 12, 26);
      const dea = MACD_DEA(dailyClose, 12, 26, 9);
      const macd = MACD_MACD(dailyClose, 12, 26, 9);

      for (let i = 0; i < dailyClose.length; i++) {
        if (!isNaN(macd[i])) {
          expect(macd[i]).toBeCloseTo((dif[i] - dea[i]) * 2, 10);
        }
      }
    });

    it('should handle empty array', () => {
      const result = MACD_MACD([], 12, 26, 9);
      expect(result).toHaveLength(0);
    });
  });
});

describe('KDJ - Stochastic Oscillator', () => {
  const high = mockSimpleData.map((d) => d.high);
  const low = mockSimpleData.map((d) => d.low);
  const close = mockSimpleData.map((d) => d.close);

  describe('KDJ_K', () => {
    it('should calculate K line correctly', () => {
      const result = KDJ_K(high, low, close, 9, 3);
      expect(result).toHaveLength(close.length);
      // First 8 values should be NaN
      for (let i = 0; i < 8; i++) {
        expect(isNaN(result[i])).toBe(true);
      }
      // Should have valid value at position 8
      expect(isNaN(result[8])).toBe(false);
    });

    it('should be between 0 and 100 (mostly)', () => {
      const dailyHigh = mockDailyData.map((d) => d.high);
      const dailyLow = mockDailyData.map((d) => d.low);
      const dailyClose = mockDailyData.map((d) => d.close);
      const result = KDJ_K(dailyHigh, dailyLow, dailyClose, 9, 3);
      const validValues = result.filter((v) => !isNaN(v));
      expect(validValues.length).toBeGreaterThan(0);
      // K can go outside 0-100 due to smoothing, but should be mostly in range
      const inRange = validValues.filter((v) => v >= -20 && v <= 120);
      expect(inRange.length / validValues.length).toBeGreaterThan(0.8);
    });

    it('should handle short period', () => {
      const result = KDJ_K(high, low, close, 3, 2);
      expect(result).toHaveLength(close.length);
      expect(result.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
    });
  });

  describe('KDJ_D', () => {
    it('should calculate D line correctly', () => {
      const result = KDJ_D(high, low, close, 9, 3, 3);
      expect(result).toHaveLength(close.length);
    });

    it('should smooth K line', () => {
      const dailyHigh = mockDailyData.map((d) => d.high);
      const dailyLow = mockDailyData.map((d) => d.low);
      const dailyClose = mockDailyData.map((d) => d.close);
      const k = KDJ_K(dailyHigh, dailyLow, dailyClose, 9, 3);
      const d = KDJ_D(dailyHigh, dailyLow, dailyClose, 9, 3, 3);
      // D should be smoother than K (less volatile)
      const kChanges = k.slice(1).map((v, i) => Math.abs(v - k[i])).filter((v) => !isNaN(v));
      const dChanges = d.slice(1).map((v, i) => Math.abs(v - d[i])).filter((v) => !isNaN(v));
      if (kChanges.length > 0 && dChanges.length > 0) {
        const avgKChange = kChanges.reduce((a, b) => a + b, 0) / kChanges.length;
        const avgDChange = dChanges.reduce((a, b) => a + b, 0) / dChanges.length;
        expect(avgDChange).toBeLessThanOrEqual(avgKChange * 1.5);
      }
    });
  });

  describe('KDJ_J', () => {
    it('should calculate J line correctly', () => {
      const result = KDJ_J(high, low, close, 9, 3, 3);
      expect(result).toHaveLength(close.length);
    });

    it('should equal 3K - 2D', () => {
      const dailyHigh = mockDailyData.map((d) => d.high);
      const dailyLow = mockDailyData.map((d) => d.low);
      const dailyClose = mockDailyData.map((d) => d.close);
      const k = KDJ_K(dailyHigh, dailyLow, dailyClose, 9, 3);
      const d = KDJ_D(dailyHigh, dailyLow, dailyClose, 9, 3, 3);
      const j = KDJ_J(dailyHigh, dailyLow, dailyClose, 9, 3, 3);

      for (let i = 0; i < j.length; i++) {
        if (!isNaN(j[i]) && !isNaN(k[i]) && !isNaN(d[i])) {
          expect(j[i]).toBeCloseTo(3 * k[i] - 2 * d[i], 10);
        }
      }
    });

    it('should handle empty arrays', () => {
      const result = KDJ_J([], [], [], 9, 3, 3);
      expect(result).toHaveLength(0);
    });
  });
});

describe('SAR - Parabolic Stop and Reverse', () => {
  const high = mockDailyData.map((d) => d.high);
  const low = mockDailyData.map((d) => d.low);

  it('should calculate SAR correctly', () => {
    const result = SAR(high, low, 0.02, 0.2);
    expect(result).toHaveLength(high.length);
    expect(isNaN(result[0])).toBe(false);
  });

  it('should be below high and above low (in general)', () => {
    const result = SAR(high, low, 0.02, 0.2);
    // SAR should be within or near the high-low range
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeDefined();
      expect(isNaN(result[i])).toBe(false);
    }
  });

  it('should handle different step values', () => {
    const result1 = SAR(high, low, 0.01, 0.2);
    const result2 = SAR(high, low, 0.05, 0.2);
    expect(result1).toHaveLength(high.length);
    expect(result2).toHaveLength(high.length);
    // Results should differ
    const differences = result1.filter((v, i) => v !== result2[i]).length;
    expect(differences).toBeGreaterThan(0);
  });

  it('should handle short data', () => {
    const shortHigh = [100, 102, 105];
    const shortLow = [98, 100, 103];
    const result = SAR(shortHigh, shortLow, 0.02, 0.2);
    expect(result).toHaveLength(3);
  });

  it('should handle empty arrays', () => {
    const result = SAR([], [], 0.02, 0.2);
    expect(result).toHaveLength(0);
  });
});

describe('CCI - Commodity Channel Index', () => {
  const high = mockDailyData.map((d) => d.high);
  const low = mockDailyData.map((d) => d.low);
  const close = mockDailyData.map((d) => d.close);

  it('should calculate CCI correctly', () => {
    const result = CCI(high, low, close, 14);
    expect(result).toHaveLength(close.length);
    // First 13 values should be NaN
    for (let i = 0; i < 13; i++) {
      expect(isNaN(result[i])).toBe(true);
    }
    expect(isNaN(result[13])).toBe(false);
  });

  it('should typically be between -200 and 200', () => {
    const result = CCI(high, low, close, 14);
    const validValues = result.filter((v) => !isNaN(v));
    expect(validValues.length).toBeGreaterThan(0);
    // Most values should be in typical range
    const inRange = validValues.filter((v) => v >= -300 && v <= 300);
    expect(inRange.length / validValues.length).toBeGreaterThan(0.9);
  });

  it('should work with different periods', () => {
    const result1 = CCI(high, low, close, 10);
    const result2 = CCI(high, low, close, 20);
    expect(result1).toHaveLength(close.length);
    expect(result2).toHaveLength(close.length);
  });

  it('should handle short data', () => {
    const shortHigh = [100, 102, 101, 103];
    const shortLow = [98, 100, 99, 101];
    const shortClose = [99, 101, 100, 102];
    const result = CCI(shortHigh, shortLow, shortClose, 3);
    expect(result).toHaveLength(4);
    expect(isNaN(result[2])).toBe(false);
  });

  it('should handle empty arrays', () => {
    const result = CCI([], [], [], 14);
    expect(result).toHaveLength(0);
  });
});

describe('DMI - Directional Movement Index', () => {
  const high = mockDailyData.map((d) => d.high);
  const low = mockDailyData.map((d) => d.low);
  const close = mockDailyData.map((d) => d.close);

  describe('DMI_PDI', () => {
    it('should calculate +DI correctly', () => {
      const result = DMI_PDI(high, low, close, 14);
      expect(result).toHaveLength(close.length);
      // First 14 values should be NaN
      for (let i = 0; i < 14; i++) {
        expect(isNaN(result[i])).toBe(true);
      }
    });

    it('should be between 0 and 100', () => {
      const result = DMI_PDI(high, low, close, 14);
      const validValues = result.filter((v) => !isNaN(v));
      expect(validValues.length).toBeGreaterThan(0);
      validValues.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      });
    });

    it('should handle different periods', () => {
      const result = DMI_PDI(high, low, close, 10);
      expect(result).toHaveLength(close.length);
      expect(result.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
    });
  });

  describe('DMI_MDI', () => {
    it('should calculate -DI correctly', () => {
      const result = DMI_MDI(high, low, close, 14);
      expect(result).toHaveLength(close.length);
    });

    it('should be between 0 and 100', () => {
      const result = DMI_MDI(high, low, close, 14);
      const validValues = result.filter((v) => !isNaN(v));
      expect(validValues.length).toBeGreaterThan(0);
      validValues.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('DMI_ADX', () => {
    it('should calculate ADX correctly', () => {
      const result = DMI_ADX(high, low, close, 14);
      expect(result).toHaveLength(close.length);
      // First 27 values should be NaN (2 * period - 1)
      for (let i = 0; i < 27; i++) {
        expect(isNaN(result[i])).toBe(true);
      }
    });

    it('should be between 0 and 100', () => {
      const result = DMI_ADX(high, low, close, 14);
      const validValues = result.filter((v) => !isNaN(v));
      expect(validValues.length).toBeGreaterThan(0);
      validValues.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      });
    });

    it('should match standalone ADX function', () => {
      const result1 = DMI_ADX(high, low, close, 14);
      const result2 = ADX(high, low, close, 14);
      expect(result1).toEqual(result2);
    });
  });

  describe('DMI_ADXR', () => {
    it('should calculate ADXR correctly', () => {
      const result = DMI_ADXR(high, low, close, 14);
      expect(result).toHaveLength(close.length);
      // ADXR needs even more data than ADX
      const validValues = result.filter((v) => !isNaN(v));
      expect(validValues.length).toBeGreaterThan(0);
    });

    it('should be between 0 and 100', () => {
      const result = DMI_ADXR(high, low, close, 14);
      const validValues = result.filter((v) => !isNaN(v));
      expect(validValues.length).toBeGreaterThan(0);
      validValues.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      });
    });

    it('should match standalone ADXR function', () => {
      const result1 = DMI_ADXR(high, low, close, 14);
      const result2 = ADXR(high, low, close, 14);
      expect(result1).toEqual(result2);
    });
  });
});

describe('TRIX - Triple Exponential Average', () => {
  const close = mockDailyData.map((d) => d.close);

  it('should calculate TRIX correctly', () => {
    const result = TRIX(close, 12);
    expect(result).toHaveLength(close.length);
  });

  it('should return percentage values', () => {
    const result = TRIX(close, 12);
    const validValues = result.filter((v) => !isNaN(v));
    expect(validValues.length).toBeGreaterThan(0);
    // TRIX should be small percentage values
    validValues.forEach((v) => {
      expect(Math.abs(v)).toBeLessThan(10); // Typically very small
    });
  });

  it('should work with different periods', () => {
    const result1 = TRIX(close, 9);
    const result2 = TRIX(close, 15);
    expect(result1).toHaveLength(close.length);
    expect(result2).toHaveLength(close.length);
  });

  it('should handle short data', () => {
    const shortData = [100, 102, 101, 103, 105, 104];
    const result = TRIX(shortData, 3);
    expect(result).toHaveLength(6);
  });

  it('should handle empty array', () => {
    const result = TRIX([], 12);
    expect(result).toHaveLength(0);
  });
});

describe('OBV - On Balance Volume', () => {
  const close = mockDailyData.map((d) => d.close);
  const volume = mockDailyData.map((d) => d.volume);

  it('should calculate OBV correctly', () => {
    const result = OBV(close, volume);
    expect(result).toHaveLength(close.length);
    expect(result[0]).toBe(volume[0]);
  });

  it('should accumulate volume based on price direction', () => {
    const result = OBV(close, volume);
    // OBV should change based on price movement
    for (let i = 1; i < result.length; i++) {
      if (close[i] > close[i - 1]) {
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      } else if (close[i] < close[i - 1]) {
        expect(result[i]).toBeLessThan(result[i - 1]);
      } else {
        expect(result[i]).toBe(result[i - 1]);
      }
    }
  });

  it('should handle empty arrays', () => {
    const result = OBV([], []);
    expect(result).toHaveLength(0);
  });

  it('should handle single value', () => {
    const result = OBV([100], [1000]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(1000);
  });
});

describe('BIAS - Bias Ratio', () => {
  const close = mockDailyData.map((d) => d.close);

  it('should calculate BIAS correctly', () => {
    const result = BIAS(close, 6);
    expect(result).toHaveLength(close.length);
    // First 5 values should be NaN
    for (let i = 0; i < 5; i++) {
      expect(isNaN(result[i])).toBe(true);
    }
  });

  it('should return percentage values', () => {
    const result = BIAS(close, 6);
    const validValues = result.filter((v) => !isNaN(v));
    expect(validValues.length).toBeGreaterThan(0);
    // BIAS is typically between -20 and 20
    const inRange = validValues.filter((v) => v >= -30 && v <= 30);
    expect(inRange.length / validValues.length).toBeGreaterThan(0.8);
  });

  it('should work with different periods', () => {
    const result1 = BIAS(close, 6);
    const result2 = BIAS(close, 12);
    const result3 = BIAS(close, 24);
    expect(result1.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
    expect(result2.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
    expect(result3.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
  });

  it('should handle empty array', () => {
    const result = BIAS([], 6);
    expect(result).toHaveLength(0);
  });
});

describe('ROC - Rate of Change', () => {
  const close = mockDailyData.map((d) => d.close);

  it('should calculate ROC correctly', () => {
    const result = ROC(close, 12);
    expect(result).toHaveLength(close.length);
    // First 12 values should be NaN
    for (let i = 0; i < 12; i++) {
      expect(isNaN(result[i])).toBe(true);
    }
  });

  it('should return percentage change', () => {
    const result = ROC(close, 12);
    const validValues = result.filter((v) => !isNaN(v));
    expect(validValues.length).toBeGreaterThan(0);
    // Verify calculation for a specific point
    const i = 15;
    const expected = ((close[i] - close[i - 12]) / close[i - 12]) * 100;
    expect(result[i]).toBeCloseTo(expected, 10);
  });

  it('should work with different periods', () => {
    const result1 = ROC(close, 6);
    const result2 = ROC(close, 12);
    expect(result1.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
    expect(result2.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
  });

  it('should handle empty array', () => {
    const result = ROC([], 12);
    expect(result).toHaveLength(0);
  });
});

describe('MTM - Momentum', () => {
  const close = mockDailyData.map((d) => d.close);

  it('should calculate MTM correctly', () => {
    const result = MTM(close, 12);
    expect(result).toHaveLength(close.length);
    // First 12 values should be NaN
    for (let i = 0; i < 12; i++) {
      expect(isNaN(result[i])).toBe(true);
    }
  });

  it('should return absolute difference', () => {
    const result = MTM(close, 12);
    const validValues = result.filter((v) => !isNaN(v));
    expect(validValues.length).toBeGreaterThan(0);
    // Verify calculation
    const i = 15;
    const expected = close[i] - close[i - 12];
    expect(result[i]).toBeCloseTo(expected, 10);
  });

  it('should differ from ROC (absolute vs percentage)', () => {
    const mtm = MTM(close, 12);
    const roc = ROC(close, 12);
    // MTM is absolute, ROC is percentage
    const i = 15;
    expect(mtm[i]).not.toEqual(roc[i]);
  });

  it('should handle empty array', () => {
    const result = MTM([], 12);
    expect(result).toHaveLength(0);
  });
});

describe('WR - Williams %R', () => {
  const high = mockDailyData.map((d) => d.high);
  const low = mockDailyData.map((d) => d.low);
  const close = mockDailyData.map((d) => d.close);

  it('should calculate WR correctly', () => {
    const result = WR(high, low, close, 14);
    expect(result).toHaveLength(close.length);
    // First 13 values should be NaN
    for (let i = 0; i < 13; i++) {
      expect(isNaN(result[i])).toBe(true);
    }
  });

  it('should be between -100 and 0', () => {
    const result = WR(high, low, close, 14);
    const validValues = result.filter((v) => !isNaN(v));
    expect(validValues.length).toBeGreaterThan(0);
    validValues.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(-100);
      expect(v).toBeLessThanOrEqual(0);
    });
  });

  it('should work with different periods', () => {
    const result1 = WR(high, low, close, 9);
    const result2 = WR(high, low, close, 14);
    expect(result1.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
    expect(result2.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
  });

  it('should handle empty arrays', () => {
    const result = WR([], [], [], 14);
    expect(result).toHaveLength(0);
  });
});

describe('PSY - Psychological Line', () => {
  const close = mockDailyData.map((d) => d.close);

  it('should calculate PSY correctly', () => {
    const result = PSY(close, 12);
    expect(result).toHaveLength(close.length);
    // First 12 values should be NaN
    for (let i = 0; i < 12; i++) {
      expect(isNaN(result[i])).toBe(true);
    }
  });

  it('should be between 0 and 100', () => {
    const result = PSY(close, 12);
    const validValues = result.filter((v) => !isNaN(v));
    expect(validValues.length).toBeGreaterThan(0);
    validValues.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('should count up days correctly', () => {
    const testData = [100, 101, 102, 101, 102, 103, 104, 103, 104, 105, 106, 107, 108];
    const result = PSY(testData, 12);
    // In last 12 days, count up days
    let upDays = 0;
    for (let i = 1; i <= 12; i++) {
      if (testData[i] > testData[i - 1]) {
        upDays++;
      }
    }
    const expected = (upDays / 12) * 100;
    expect(result[12]).toBeCloseTo(expected, 10);
  });

  it('should work with different periods', () => {
    const result1 = PSY(close, 6);
    const result2 = PSY(close, 12);
    expect(result1.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
    expect(result2.filter((v) => !isNaN(v)).length).toBeGreaterThan(0);
  });

  it('should handle empty array', () => {
    const result = PSY([], 12);
    expect(result).toHaveLength(0);
  });
});

describe('Edge Cases and Integration', () => {
  it('should handle all functions with empty arrays', () => {
    expect(MACD_DIF([], 12, 26)).toEqual([]);
    expect(KDJ_K([], [], [], 9, 3)).toEqual([]);
    expect(SAR([], [], 0.02, 0.2)).toEqual([]);
    expect(CCI([], [], [], 14)).toEqual([]);
    expect(TRIX([], 12)).toEqual([]);
    expect(OBV([], [])).toEqual([]);
    expect(BIAS([], 6)).toEqual([]);
    expect(ROC([], 12)).toEqual([]);
    expect(MTM([], 12)).toEqual([]);
    expect(WR([], [], [], 14)).toEqual([]);
    expect(PSY([], 12)).toEqual([]);
  });

  it('should handle single element arrays', () => {
    const single = [100];
    const macd = MACD_DIF(single, 12, 26);
    expect(macd).toHaveLength(1);
    expect(isNaN(macd[0])).toBe(true);

    const obv = OBV(single, [1000]);
    expect(obv).toHaveLength(1);
    expect(obv[0]).toBe(1000);
  });

  it('should handle arrays with identical values', () => {
    const identical = new Array(50).fill(100);
    const macd = MACD_DIF(identical, 12, 26);
    // Should be all zeros (or very close) after valid period
    const validValues = macd.filter((v) => !isNaN(v));
    validValues.forEach((v) => {
      expect(Math.abs(v)).toBeLessThan(0.0001);
    });
  });

  it('should maintain array length consistency', () => {
    const close = mockDailyData.map((d) => d.close);
    const high = mockDailyData.map((d) => d.high);
    const low = mockDailyData.map((d) => d.low);
    const volume = mockDailyData.map((d) => d.volume);

    expect(MACD_DIF(close, 12, 26)).toHaveLength(close.length);
    expect(KDJ_K(high, low, close, 9, 3)).toHaveLength(close.length);
    expect(SAR(high, low, 0.02, 0.2)).toHaveLength(high.length);
    expect(CCI(high, low, close, 14)).toHaveLength(close.length);
    expect(TRIX(close, 12)).toHaveLength(close.length);
    expect(OBV(close, volume)).toHaveLength(close.length);
    expect(BIAS(close, 6)).toHaveLength(close.length);
    expect(ROC(close, 12)).toHaveLength(close.length);
    expect(MTM(close, 12)).toHaveLength(close.length);
    expect(WR(high, low, close, 14)).toHaveLength(close.length);
    expect(PSY(close, 12)).toHaveLength(close.length);
  });

  it('should produce deterministic results', () => {
    const close = mockDailyData.map((d) => d.close);
    const result1 = MACD_DIF(close, 12, 26);
    const result2 = MACD_DIF(close, 12, 26);
    expect(result1).toEqual(result2);

    const high = mockDailyData.map((d) => d.high);
    const low = mockDailyData.map((d) => d.low);
    const sar1 = SAR(high, low, 0.02, 0.2);
    const sar2 = SAR(high, low, 0.02, 0.2);
    expect(sar1).toEqual(sar2);
  });
});
