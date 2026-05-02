import { IF, CROSS, EVERY, EXIST, BARSLAST, COUNT } from '../../../src/interpreter/functions/logical';

describe('Logical Functions', () => {
  describe('IF - Conditional Selection', () => {
    it('should select A when condition is true (non-zero)', () => {
      const condition = [1, 0, 1, 0, 1];
      const a = [10, 20, 30, 40, 50];
      const b = [1, 2, 3, 4, 5];
      const result = IF(condition, a, b);

      expect(result).toEqual([10, 2, 30, 4, 50]);
    });

    it('should select B when condition is false (zero)', () => {
      const condition = [0, 0, 0];
      const a = [10, 20, 30];
      const b = [1, 2, 3];
      const result = IF(condition, a, b);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle all true conditions', () => {
      const condition = [1, 2, 3, 4];
      const a = [10, 20, 30, 40];
      const b = [1, 2, 3, 4];
      const result = IF(condition, a, b);

      expect(result).toEqual([10, 20, 30, 40]);
    });

    it('should treat any non-zero as true', () => {
      const condition = [5, -1, 0.5, 0, 100];
      const a = [10, 20, 30, 40, 50];
      const b = [1, 2, 3, 4, 5];
      const result = IF(condition, a, b);

      expect(result).toEqual([10, 20, 30, 4, 50]);
    });

    it('should handle arrays of different lengths by using shortest length', () => {
      const condition = [1, 0, 1];
      const a = [10, 20];
      const b = [1, 2, 3, 4];
      const result = IF(condition, a, b);

      expect(result).toEqual([10, 2]);
    });
  });

  describe('CROSS - Crossover Detection', () => {
    it('should detect when A crosses above B', () => {
      // A: [1, 2, 3, 4, 5]
      // B: [5, 4, 3, 2, 1]
      // At index 2: A[1]=2 < B[1]=4 and A[2]=3 >= B[2]=3 -> cross
      const a = [1, 2, 3, 4, 5];
      const b = [5, 4, 3, 2, 1];
      const result = CROSS(a, b);

      // First value is always 0 (no previous data)
      expect(result[0]).toBe(0);
      // Check each position
      expect(result[1]).toBe(0); // 2 < 4, no cross
      expect(result[2]).toBe(1); // 2 < 4 and 3 >= 3, cross!
      expect(result[3]).toBe(0); // 3 >= 3 already above
      expect(result[4]).toBe(0); // 4 >= 2 already above
    });

    it('should not detect cross when A is already above B', () => {
      const a = [5, 6, 7, 8];
      const b = [1, 2, 3, 4];
      const result = CROSS(a, b);

      expect(result).toEqual([0, 0, 0, 0]);
    });

    it('should not detect cross when A stays below B', () => {
      const a = [1, 2, 3, 4];
      const b = [5, 6, 7, 8];
      const result = CROSS(a, b);

      expect(result).toEqual([0, 0, 0, 0]);
    });

    it('should detect multiple crosses', () => {
      const a = [1, 3, 2, 4, 3, 5];
      const b = [2, 2, 3, 3, 4, 4];
      const result = CROSS(a, b);

      expect(result[0]).toBe(0); // First value always 0
      expect(result[1]).toBe(1); // 1 < 2 and 3 >= 2, cross!
      expect(result[2]).toBe(0); // 3 >= 2, already above
      expect(result[3]).toBe(1); // 2 < 3 and 4 >= 3, cross!
      expect(result[4]).toBe(0); // 4 >= 3, already above
      expect(result[5]).toBe(1); // 3 < 4 and 5 >= 4, cross!
    });

    it('should handle equal values correctly', () => {
      const a = [1, 2, 2, 3];
      const b = [2, 2, 2, 2];
      const result = CROSS(a, b);

      expect(result[0]).toBe(0); // First value
      expect(result[1]).toBe(1); // 1 < 2 and 2 >= 2, cross!
      expect(result[2]).toBe(0); // 2 >= 2, already at or above
      expect(result[3]).toBe(0); // 2 >= 2, already at or above
    });

    it('should handle arrays of different lengths by using shorter length', () => {
      const a = [1, 3, 5];
      const b = [2, 2];
      const result = CROSS(a, b);

      expect(result.length).toBe(2);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(1); // 1 < 2 and 3 >= 2
    });
  });

  describe('EVERY - All non-zero in N periods', () => {
    it('should return 1 when all values in N period are non-zero', () => {
      const data = [1, 1, 1, 1];
      const result = EVERY(data, 3);

      // Go/TDX-compatible warmup bars return 0 until enough history exists.
      expect(result).toEqual([0, 0, 1, 1]);
    });

    it('should return 0 when not all values in N period are non-zero', () => {
      const data = [1, 1, 0, 1];
      const result = EVERY(data, 3);

      expect(result).toEqual([0, 0, 0, 0]);
    });

    it('should check N=2 period correctly', () => {
      const data = [1, 0, 1, 1, 0];
      const result = EVERY(data, 2);

      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0); // [1, 0] has zero
      expect(result[2]).toBe(0); // [0, 1] has zero
      expect(result[3]).toBe(1); // [1, 1] all non-zero
      expect(result[4]).toBe(0); // [1, 0] has zero
    });

    it('should handle all zeros', () => {
      const data = [0, 0, 0, 0];
      const result = EVERY(data, 2);

      expect(result).toEqual([0, 0, 0, 0]);
    });

    it('should handle mixed positive and negative values as non-zero', () => {
      const data = [1, -1, 0.5, -0.5];
      const result = EVERY(data, 2);

      expect(result[0]).toBe(0);
      expect(result[1]).toBe(1); // [1, -1] all non-zero
      expect(result[2]).toBe(1); // [-1, 0.5] all non-zero
      expect(result[3]).toBe(1); // [0.5, -0.5] all non-zero
    });
  });

  describe('EXIST - Any non-zero in N periods', () => {
    it('should return 1 when any value in N period is non-zero', () => {
      const data = [0, 0, 1, 0];
      const result = EXIST(data, 3);

      // Go/TDX-compatible warmup bars return 0 until enough history exists.
      expect(result).toEqual([0, 0, 1, 1]);
    });

    it('should return 0 when all values in N period are zero', () => {
      const data = [0, 0, 0, 1];
      const result = EXIST(data, 3);

      expect(result).toEqual([0, 0, 0, 1]);
    });

    it('should check N=2 period correctly', () => {
      const data = [1, 0, 0, 1, 0];
      const result = EXIST(data, 2);

      expect(result[0]).toBe(0);
      expect(result[1]).toBe(1); // [1, 0] has non-zero
      expect(result[2]).toBe(0); // [0, 0] all zeros
      expect(result[3]).toBe(1); // [0, 1] has non-zero
      expect(result[4]).toBe(1); // [1, 0] has non-zero
    });

    it('should handle all non-zero values', () => {
      const data = [1, 2, 3, 4];
      const result = EXIST(data, 2);

      expect(result).toEqual([0, 1, 1, 1]);
    });
  });

  describe('BARSLAST - Bars since last non-zero', () => {
    it('should return bars since last non-zero value', () => {
      const data = [0, 1, 0, 0, 1];
      const result = BARSLAST(data);

      expect(Number.isNaN(result[0])).toBe(true); // No previous non-zero
      expect(result[1]).toBe(0); // Current is non-zero
      expect(result[2]).toBe(1); // 1 bar since last non-zero
      expect(result[3]).toBe(2); // 2 bars since last non-zero
      expect(result[4]).toBe(0); // Current is non-zero
    });

    it('should handle all zeros', () => {
      const data = [0, 0, 0];
      const result = BARSLAST(data);

      expect(result.every((value) => Number.isNaN(value))).toBe(true);
    });

    it('should reset to 0 when non-zero value appears', () => {
      const data = [1, 0, 0, 1, 0];
      const result = BARSLAST(data);

      // [0, 1, 2, 0, 1]
      expect(result[0]).toBe(0); // Current is non-zero
      expect(result[1]).toBe(1); // 1 bar since last non-zero
      expect(result[2]).toBe(2); // 2 bars since last non-zero
      expect(result[3]).toBe(0); // Current is non-zero
      expect(result[4]).toBe(1); // 1 bar since last non-zero
    });

    it('should handle all non-zero values', () => {
      const data = [1, 2, 3, 4];
      const result = BARSLAST(data);

      // [0, 0, 0, 0]
      expect(result).toEqual([0, 0, 0, 0]);
    });

    it('should handle negative values as non-zero', () => {
      const data = [0, -1, 0, 0];
      const result = BARSLAST(data);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(1);
      expect(result[3]).toBe(2);
    });
  });

  describe('COUNT - Count non-zero in N periods', () => {
    it('should count non-zero values in N period', () => {
      const data = [1, 0, 1, 1, 0];
      const result = COUNT(data, 3);

      // [NaN, NaN, 2, 2, 2]
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(2); // [1, 0, 1] -> 2 non-zero
      expect(result[3]).toBe(2); // [0, 1, 1] -> 2 non-zero
      expect(result[4]).toBe(2); // [1, 1, 0] -> 2 non-zero
    });

    it('should count correctly with all non-zero', () => {
      const data = [1, 1, 1, 1];
      const result = COUNT(data, 3);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(3);
      expect(result[3]).toBe(3);
    });

    it('should count correctly with all zeros', () => {
      const data = [0, 0, 0, 0];
      const result = COUNT(data, 3);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(0);
      expect(result[3]).toBe(0);
    });

    it('should handle N=2 period', () => {
      const data = [1, 0, 1, 0, 1];
      const result = COUNT(data, 2);

      // [NaN, 1, 1, 1, 1]
      expect(Number.isNaN(result[0])).toBe(true);
      expect(result[1]).toBe(1); // [1, 0] -> 1 non-zero
      expect(result[2]).toBe(1); // [0, 1] -> 1 non-zero
      expect(result[3]).toBe(1); // [1, 0] -> 1 non-zero
      expect(result[4]).toBe(1); // [0, 1] -> 1 non-zero
    });

    it('should handle negative values as non-zero', () => {
      const data = [1, -1, 0, -0.5];
      const result = COUNT(data, 2);

      // [NaN, 2, 1, 1]
      expect(Number.isNaN(result[0])).toBe(true);
      expect(result[1]).toBe(2); // [1, -1] -> 2 non-zero
      expect(result[2]).toBe(1); // [-1, 0] -> 1 non-zero
      expect(result[3]).toBe(1); // [0, -0.5] -> 1 non-zero
    });
  });
});
