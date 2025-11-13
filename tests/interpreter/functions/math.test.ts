import { MA, EMA, SUM, MAX, MIN } from '../../../src/interpreter/functions/math';

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
});
