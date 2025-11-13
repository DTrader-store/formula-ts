import { REF, HHV, LLV } from '../../../src/interpreter/functions/reference';

describe('Reference Functions', () => {
  describe('REF - Reference', () => {
    it('should return value N periods ago', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const period = 3;
      const result = REF(data, period);

      // First 3 values should be NaN (not enough history)
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      expect(Number.isNaN(result[2])).toBe(true);

      // REF(3) at index 3 = value at index 0 = 1
      expect(result[3]).toBe(1);
      // REF(3) at index 4 = value at index 1 = 2
      expect(result[4]).toBe(2);
      // REF(3) at index 9 = value at index 6 = 7
      expect(result[9]).toBe(7);
    });

    it('should handle period = 0 (return same array)', () => {
      const data = [1, 2, 3, 4, 5];
      const result = REF(data, 0);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle period = 1', () => {
      const data = [1, 2, 3, 4, 5];
      const result = REF(data, 1);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(result[1]).toBe(1);
      expect(result[2]).toBe(2);
      expect(result[3]).toBe(3);
      expect(result[4]).toBe(4);
    });

    it('should return all NaN when period >= data length', () => {
      const data = [1, 2, 3];
      const result = REF(data, 5);
      expect(result.every(v => Number.isNaN(v))).toBe(true);
    });
  });

  describe('HHV - Highest High Value', () => {
    it('should calculate highest value over period', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
      const period = 3;
      const result = HHV(data, period);

      // First two should be NaN
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);

      // HHV(3) at index 2 = max(3,1,4) = 4
      expect(result[2]).toBe(4);
      // HHV(3) at index 3 = max(1,4,1) = 4
      expect(result[3]).toBe(4);
      // HHV(3) at index 4 = max(4,1,5) = 5
      expect(result[4]).toBe(5);
      // HHV(3) at index 5 = max(1,5,9) = 9
      expect(result[5]).toBe(9);
      // HHV(3) at index 6 = max(5,9,2) = 9
      expect(result[6]).toBe(9);
    });

    it('should handle period = 1', () => {
      const data = [3, 1, 4, 1, 5];
      const result = HHV(data, 1);
      expect(result).toEqual([3, 1, 4, 1, 5]);
    });

    it('should handle all same values', () => {
      const data = [5, 5, 5, 5, 5];
      const result = HHV(data, 3);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(5);
      expect(result[3]).toBe(5);
      expect(result[4]).toBe(5);
    });
  });

  describe('LLV - Lowest Low Value', () => {
    it('should calculate lowest value over period', () => {
      const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
      const period = 3;
      const result = LLV(data, period);

      // First two should be NaN
      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);

      // LLV(3) at index 2 = min(3,1,4) = 1
      expect(result[2]).toBe(1);
      // LLV(3) at index 3 = min(1,4,1) = 1
      expect(result[3]).toBe(1);
      // LLV(3) at index 4 = min(4,1,5) = 1
      expect(result[4]).toBe(1);
      // LLV(3) at index 5 = min(1,5,9) = 1
      expect(result[5]).toBe(1);
      // LLV(3) at index 6 = min(5,9,2) = 2
      expect(result[6]).toBe(2);
    });

    it('should handle period = 1', () => {
      const data = [3, 1, 4, 1, 5];
      const result = LLV(data, 1);
      expect(result).toEqual([3, 1, 4, 1, 5]);
    });

    it('should handle all same values', () => {
      const data = [5, 5, 5, 5, 5];
      const result = LLV(data, 3);

      expect(Number.isNaN(result[0])).toBe(true);
      expect(Number.isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(5);
      expect(result[3]).toBe(5);
      expect(result[4]).toBe(5);
    });
  });
});
