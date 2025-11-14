import { STD, VAR, MEDIAN, AVEDEV } from '../../../src/interpreter/functions/statistics';

describe('Statistical Functions', () => {
  describe('STD - Standard Deviation', () => {
    it('should calculate standard deviation correctly for valid input', () => {
      const data = [1, 2, 3, 4, 5];
      const period = 3;
      const result = STD(data, period);

      // First two values should be NaN (not enough data)
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);

      // STD(3) at index 2: [1,2,3] -> mean=2, σ=√((1+0+1)/3)=√(2/3)≈0.8165
      expect(result[2]).toBeCloseTo(Math.sqrt(2 / 3), 4);

      // STD(3) at index 3: [2,3,4] -> mean=3, σ=√((1+0+1)/3)=√(2/3)≈0.8165
      expect(result[3]).toBeCloseTo(Math.sqrt(2 / 3), 4);

      // STD(3) at index 4: [3,4,5] -> mean=4, σ=√((1+0+1)/3)=√(2/3)≈0.8165
      expect(result[4]).toBeCloseTo(Math.sqrt(2 / 3), 4);
    });

    it('should handle period = 1', () => {
      const data = [1, 2, 3];
      const result = STD(data, 1);
      // Standard deviation of single value is 0
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(0);
    });

    it('should return all NaN when period > data length', () => {
      const data = [1, 2, 3];
      const result = STD(data, 5);
      expect(result.every(v => Number.isNaN(v))).toBe(true);
    });

    it('should handle identical values', () => {
      const data = [5, 5, 5, 5, 5];
      const result = STD(data, 3);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      // STD of identical values is 0
      expect(result[2]).toBe(0);
      expect(result[3]).toBe(0);
      expect(result[4]).toBe(0);
    });
  });

  describe('VAR - Variance', () => {
    it('should calculate variance correctly for valid input', () => {
      const data = [1, 2, 3, 4, 5];
      const period = 3;
      const result = VAR(data, period);

      // First two values should be NaN (not enough data)
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);

      // VAR(3) at index 2: [1,2,3] -> mean=2, variance=(1+0+1)/3=2/3≈0.6667
      expect(result[2]).toBeCloseTo(2 / 3, 4);

      // VAR(3) at index 3: [2,3,4] -> mean=3, variance=(1+0+1)/3=2/3≈0.6667
      expect(result[3]).toBeCloseTo(2 / 3, 4);

      // VAR(3) at index 4: [3,4,5] -> mean=4, variance=(1+0+1)/3=2/3≈0.6667
      expect(result[4]).toBeCloseTo(2 / 3, 4);
    });

    it('should handle period = 1', () => {
      const data = [1, 2, 3];
      const result = VAR(data, 1);
      // Variance of single value is 0
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(0);
    });

    it('should return all NaN when period > data length', () => {
      const data = [1, 2, 3];
      const result = VAR(data, 5);
      expect(result.every(v => Number.isNaN(v))).toBe(true);
    });

    it('should handle identical values', () => {
      const data = [5, 5, 5, 5, 5];
      const result = VAR(data, 3);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      // Variance of identical values is 0
      expect(result[2]).toBe(0);
      expect(result[3]).toBe(0);
      expect(result[4]).toBe(0);
    });
  });

  describe('MEDIAN - Median', () => {
    it('should calculate median correctly for odd window size', () => {
      const data = [1, 3, 2, 5, 4];
      const period = 3;
      const result = MEDIAN(data, period);

      // First two values should be NaN
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);

      // MEDIAN(3) at index 2: [1,3,2] -> sorted [1,2,3] -> median = 2
      expect(result[2]).toBe(2);

      // MEDIAN(3) at index 3: [3,2,5] -> sorted [2,3,5] -> median = 3
      expect(result[3]).toBe(3);

      // MEDIAN(3) at index 4: [2,5,4] -> sorted [2,4,5] -> median = 4
      expect(result[4]).toBe(4);
    });

    it('should calculate median correctly for even window size', () => {
      const data = [1, 2, 3, 4, 5, 6];
      const period = 4;
      const result = MEDIAN(data, period);

      // First three values should be NaN
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      expect(Number.isNaN(result[2])).toBe(true);

      // MEDIAN(4) at index 3: [1,2,3,4] -> sorted [1,2,3,4] -> median = (2+3)/2 = 2.5
      expect(result[3]).toBeCloseTo(2.5);

      // MEDIAN(4) at index 4: [2,3,4,5] -> sorted [2,3,4,5] -> median = (3+4)/2 = 3.5
      expect(result[4]).toBeCloseTo(3.5);

      // MEDIAN(4) at index 5: [3,4,5,6] -> sorted [3,4,5,6] -> median = (4+5)/2 = 4.5
      expect(result[5]).toBeCloseTo(4.5);
    });

    it('should handle period = 1', () => {
      const data = [1, 2, 3];
      const result = MEDIAN(data, 1);
      // Median of single value is itself
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });

    it('should return all NaN when period > data length', () => {
      const data = [1, 2, 3];
      const result = MEDIAN(data, 5);
      expect(result.every(v => Number.isNaN(v))).toBe(true);
    });
  });

  describe('AVEDEV - Average Absolute Deviation', () => {
    it('should calculate average absolute deviation correctly', () => {
      const data = [1, 2, 3, 4, 5];
      const period = 3;
      const result = AVEDEV(data, period);

      // First two values should be NaN
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);

      // AVEDEV(3) at index 2: [1,2,3] -> mean=2, avedev=(|1-2|+|2-2|+|3-2|)/3=(1+0+1)/3≈0.6667
      expect(result[2]).toBeCloseTo(2 / 3, 4);

      // AVEDEV(3) at index 3: [2,3,4] -> mean=3, avedev=(|2-3|+|3-3|+|4-3|)/3=(1+0+1)/3≈0.6667
      expect(result[3]).toBeCloseTo(2 / 3, 4);

      // AVEDEV(3) at index 4: [3,4,5] -> mean=4, avedev=(|3-4|+|4-4|+|5-4|)/3=(1+0+1)/3≈0.6667
      expect(result[4]).toBeCloseTo(2 / 3, 4);
    });

    it('should handle period = 1', () => {
      const data = [1, 2, 3];
      const result = AVEDEV(data, 1);
      // Average absolute deviation of single value is 0
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(0);
    });

    it('should return all NaN when period > data length', () => {
      const data = [1, 2, 3];
      const result = AVEDEV(data, 5);
      expect(result.every(v => Number.isNaN(v))).toBe(true);
    });

    it('should handle identical values', () => {
      const data = [5, 5, 5, 5, 5];
      const result = AVEDEV(data, 3);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      // AVEDEV of identical values is 0
      expect(result[2]).toBe(0);
      expect(result[3]).toBe(0);
      expect(result[4]).toBe(0);
    });

    it('should handle various datasets', () => {
      const data = [10, 20, 30, 40, 50];
      const period = 2;
      const result = AVEDEV(data, period);

      expect(Number.isNaN(result[0])).toBe(true);

      // AVEDEV(2) at index 1: [10,20] -> mean=15, avedev=(|10-15|+|20-15|)/2=(5+5)/2=5
      expect(result[1]).toBe(5);

      // AVEDEV(2) at index 2: [20,30] -> mean=25, avedev=(|20-25|+|30-25|)/2=(5+5)/2=5
      expect(result[2]).toBe(5);
    });
  });
});
