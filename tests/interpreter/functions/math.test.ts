import { MA, EMA, SUM, MAX, MIN, ABS, SQRT, POW, MOD, ROUND } from '../../../src/interpreter/functions/math';

describe('Math Functions', () => {
  describe('MA - Simple Moving Average', () => {
    it('should calculate MA correctly for valid input', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const period = 3;
      const result = MA(data, period);

      // First two values should be NaN (not enough data)
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);

      // MA(3) = (1+2+3)/3 = 2
      expect(result[2]).toBeCloseTo(2);
      // MA(3) = (2+3+4)/3 = 3
      expect(result[3]).toBeCloseTo(3);
      // MA(3) = (3+4+5)/3 = 4
      expect(result[4]).toBeCloseTo(4);
      // MA(3) = (8+9+10)/3 = 9
      expect(result[9]).toBeCloseTo(9);
    });

    it('should handle period = 1', () => {
      const data = [1, 2, 3];
      const result = MA(data, 1);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return all NaN when period > data length', () => {
      const data = [1, 2, 3];
      const result = MA(data, 5);
      expect(result.every(v => Number.isNaN(v))).toBe(true);
    });
  });

  describe('EMA - Exponential Moving Average', () => {
    it('should calculate EMA correctly', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const period = 3;
      const result = EMA(data, period);

      // First value should be NaN
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);

      // EMA starts with SMA for first calculation
      // First EMA value (index 2) = SMA = (1+2+3)/3 = 2
      expect(result[2]).toBeCloseTo(2);

      // multiplier = 2/(3+1) = 0.5
      // EMA = (4 - 2) * 0.5 + 2 = 3
      expect(result[3]).toBeCloseTo(3);

      // EMA = (5 - 3) * 0.5 + 3 = 4
      expect(result[4]).toBeCloseTo(4);
    });

    it('should handle period = 1', () => {
      const data = [1, 2, 3];
      const result = EMA(data, 1);
      // When period = 1, multiplier = 2/(1+1) = 1, so EMA = current value
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(2);
      expect(result[2]).toBeCloseTo(3);
    });
  });

  describe('SUM - Summation', () => {
    it('should calculate rolling sum correctly', () => {
      const data = [1, 2, 3, 4, 5];
      const period = 3;
      const result = SUM(data, period);

      // First two should be NaN
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);

      // SUM(3) = 1+2+3 = 6
      expect(result[2]).toBe(6);
      // SUM(3) = 2+3+4 = 9
      expect(result[3]).toBe(9);
      // SUM(3) = 3+4+5 = 12
      expect(result[4]).toBe(12);
    });

    it('should handle period = 1', () => {
      const data = [1, 2, 3];
      const result = SUM(data, 1);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('MAX - Maximum of two values', () => {
    it('should return element-wise maximum', () => {
      const a = [1, 5, 3, 8, 2];
      const b = [4, 2, 6, 1, 9];
      const result = MAX(a, b);

      expect(result).toEqual([4, 5, 6, 8, 9]);
    });

    it('should handle equal values', () => {
      const a = [5, 5, 5];
      const b = [5, 5, 5];
      const result = MAX(a, b);

      expect(result).toEqual([5, 5, 5]);
    });

    it('should handle arrays of different lengths by using shorter length', () => {
      const a = [1, 2, 3];
      const b = [4, 5];
      const result = MAX(a, b);

      expect(result).toEqual([4, 5]);
    });
  });

  describe('MIN - Minimum of two values', () => {
    it('should return element-wise minimum', () => {
      const a = [1, 5, 3, 8, 2];
      const b = [4, 2, 6, 1, 9];
      const result = MIN(a, b);

      expect(result).toEqual([1, 2, 3, 1, 2]);
    });

    it('should handle equal values', () => {
      const a = [5, 5, 5];
      const b = [5, 5, 5];
      const result = MIN(a, b);

      expect(result).toEqual([5, 5, 5]);
    });

    it('should handle arrays of different lengths by using shorter length', () => {
      const a = [1, 2, 3];
      const b = [4, 5];
      const result = MIN(a, b);

      expect(result).toEqual([1, 2]);
    });
  });

  describe('ABS - Absolute Value', () => {
    it('should calculate absolute values correctly', () => {
      const data = [1, -2, 3, -4, -5];
      const result = ABS(data);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle all positive values', () => {
      const data = [1, 2, 3];
      const result = ABS(data);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle all negative values', () => {
      const data = [-1, -2, -3];
      const result = ABS(data);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle zero', () => {
      const data = [0, -0, 0];
      const result = ABS(data);

      expect(result).toEqual([0, 0, 0]);
    });
  });

  describe('SQRT - Square Root', () => {
    it('should calculate square roots correctly', () => {
      const data = [4, 9, 16, 25];
      const result = SQRT(data);

      expect(result[0]).toBeCloseTo(2);
      expect(result[1]).toBeCloseTo(3);
      expect(result[2]).toBeCloseTo(4);
      expect(result[3]).toBeCloseTo(5);
    });

    it('should handle decimal results', () => {
      const data = [2, 3, 5];
      const result = SQRT(data);

      expect(result[0]).toBeCloseTo(Math.sqrt(2));
      expect(result[1]).toBeCloseTo(Math.sqrt(3));
      expect(result[2]).toBeCloseTo(Math.sqrt(5));
    });

    it('should handle zero', () => {
      const data = [0];
      const result = SQRT(data);

      expect(result[0]).toBe(0);
    });

    it('should return NaN for negative values', () => {
      const data = [-1, -4];
      const result = SQRT(data);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
    });
  });

  describe('POW - Power', () => {
    it('should calculate power correctly for element-wise arrays', () => {
      const base = [2, 3, 4];
      const exp = [2, 2, 2];
      const result = POW(base, exp);

      expect(result).toEqual([4, 9, 16]);
    });

    it('should handle zero exponent', () => {
      const base = [2, 3, 4];
      const exp = [0, 0, 0];
      const result = POW(base, exp);

      expect(result).toEqual([1, 1, 1]);
    });

    it('should handle negative exponents', () => {
      const base = [2, 4];
      const exp = [-1, -2];
      const result = POW(base, exp);

      expect(result[0]).toBeCloseTo(0.5);
      expect(result[1]).toBeCloseTo(0.0625);
    });

    it('should handle arrays of different lengths by using shorter length', () => {
      const base = [2, 3, 4];
      const exp = [2, 3];
      const result = POW(base, exp);

      expect(result).toEqual([4, 27]);
    });
  });

  describe('MOD - Modulo', () => {
    it('should calculate modulo correctly', () => {
      const dividend = [10, 11, 12];
      const divisor = [3, 3, 3];
      const result = MOD(dividend, divisor);

      expect(result).toEqual([1, 2, 0]);
    });

    it('should handle negative dividends', () => {
      const dividend = [-10, -11];
      const divisor = [3, 3];
      const result = MOD(dividend, divisor);

      expect(result[0]).toBe(-10 % 3);
      expect(result[1]).toBe(-11 % 3);
    });

    it('should return NaN for division by zero', () => {
      const dividend = [10];
      const divisor = [0];
      const result = MOD(dividend, divisor);

      expect(Number.isNaN(result[0])).toBe(true);
    });

    it('should handle arrays of different lengths by using shorter length', () => {
      const dividend = [10, 11, 12];
      const divisor = [3, 3];
      const result = MOD(dividend, divisor);

      expect(result).toEqual([1, 2]);
    });
  });

  describe('ROUND - Rounding', () => {
    it('should round to nearest integer (banker\'s rounding)', () => {
      const data = [1.4, 1.5, 1.6];
      const result = ROUND(data);

      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(2);
    });

    it('should handle negative values', () => {
      const data = [-1.4, -2.5, -1.6];
      const result = ROUND(data);

      expect(result[0]).toBe(-1);
      expect(result[1]).toBe(-2);
      expect(result[2]).toBe(-2);
    });

    it('should handle whole numbers', () => {
      const data = [1, 2, 3];
      const result = ROUND(data);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle zero', () => {
      const data = [0, 0.1];
      const result = ROUND(data);

      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
    });
  });
});
