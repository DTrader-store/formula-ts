import { DATE, TIME, YEAR, MONTH, DAY, HOUR, MINUTE, WEEKDAY } from '../../../src/interpreter/functions/datetime';

describe('DateTime Functions', () => {
  describe('DATE - Get date in YYYYMMDD format', () => {
    it('should return date in YYYYMMDD format', () => {
      const timestamps = [
        new Date('2024-01-15 09:30:00').getTime(),
        new Date('2024-02-28 14:00:00').getTime(),
        new Date('2024-12-31 23:59:59').getTime(),
      ];
      const result = DATE(timestamps);

      expect(result).toEqual([20240115, 20240228, 20241231]);
    });

    it('should handle leap year dates', () => {
      const timestamps = [
        new Date('2024-02-29 12:00:00').getTime(), // Leap year
        new Date('2023-02-28 12:00:00').getTime(), // Non-leap year
      ];
      const result = DATE(timestamps);

      expect(result).toEqual([20240229, 20230228]);
    });

    it('should pad single digit months and days with zeros', () => {
      const timestamps = [
        new Date('2024-01-01 00:00:00').getTime(),
        new Date('2024-09-05 12:00:00').getTime(),
      ];
      const result = DATE(timestamps);

      expect(result).toEqual([20240101, 20240905]);
    });

    it('should handle year boundaries', () => {
      const timestamps = [
        new Date('2023-12-31 23:59:59').getTime(),
        new Date('2024-01-01 00:00:00').getTime(),
      ];
      const result = DATE(timestamps);

      expect(result).toEqual([20231231, 20240101]);
    });

    it('should work with empty array', () => {
      const result = DATE([]);
      expect(result).toEqual([]);
    });

    it('should work with single timestamp', () => {
      const timestamps = [new Date('2024-06-15 10:30:00').getTime()];
      const result = DATE(timestamps);

      expect(result).toEqual([20240615]);
    });
  });

  describe('TIME - Get time in HHMMSS format', () => {
    it('should return time in HHMMSS format', () => {
      const timestamps = [
        new Date('2024-01-15 09:30:00').getTime(),
        new Date('2024-01-15 14:45:30').getTime(),
        new Date('2024-01-15 23:59:59').getTime(),
      ];
      const result = TIME(timestamps);

      expect(result).toEqual([93000, 144530, 235959]);
    });

    it('should handle midnight and noon', () => {
      const timestamps = [
        new Date('2024-01-15 00:00:00').getTime(), // Midnight
        new Date('2024-01-15 12:00:00').getTime(), // Noon
      ];
      const result = TIME(timestamps);

      expect(result).toEqual([0, 120000]);
    });

    it('should pad single digit hours, minutes, and seconds', () => {
      const timestamps = [
        new Date('2024-01-15 01:05:09').getTime(),
        new Date('2024-01-15 09:00:00').getTime(),
      ];
      const result = TIME(timestamps);

      expect(result).toEqual([10509, 90000]);
    });

    it('should handle market hours', () => {
      const timestamps = [
        new Date('2024-01-15 09:30:00').getTime(), // Market open (US)
        new Date('2024-01-15 16:00:00').getTime(), // Market close (US)
      ];
      const result = TIME(timestamps);

      expect(result).toEqual([93000, 160000]);
    });

    it('should work with empty array', () => {
      const result = TIME([]);
      expect(result).toEqual([]);
    });
  });

  describe('YEAR - Get year', () => {
    it('should extract year from timestamps', () => {
      const timestamps = [
        new Date('2020-01-01').getTime(),
        new Date('2021-06-15').getTime(),
        new Date('2024-12-31').getTime(),
      ];
      const result = YEAR(timestamps);

      expect(result).toEqual([2020, 2021, 2024]);
    });

    it('should handle different years', () => {
      const timestamps = [
        new Date('2000-01-01').getTime(),
        new Date('2010-01-01').getTime(),
        new Date('2030-01-01').getTime(),
      ];
      const result = YEAR(timestamps);

      expect(result).toEqual([2000, 2010, 2030]);
    });

    it('should work with empty array', () => {
      const result = YEAR([]);
      expect(result).toEqual([]);
    });
  });

  describe('MONTH - Get month (1-12)', () => {
    it('should extract month from timestamps', () => {
      const timestamps = [
        new Date('2024-01-15').getTime(), // January
        new Date('2024-06-15').getTime(), // June
        new Date('2024-12-15').getTime(), // December
      ];
      const result = MONTH(timestamps);

      expect(result).toEqual([1, 6, 12]);
    });

    it('should return months in range 1-12', () => {
      const timestamps = Array.from({ length: 12 }, (_, i) =>
        new Date(`2024-${String(i + 1).padStart(2, '0')}-01`).getTime()
      );
      const result = MONTH(timestamps);

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('should work with empty array', () => {
      const result = MONTH([]);
      expect(result).toEqual([]);
    });
  });

  describe('DAY - Get day of month (1-31)', () => {
    it('should extract day from timestamps', () => {
      const timestamps = [
        new Date('2024-01-01').getTime(),
        new Date('2024-01-15').getTime(),
        new Date('2024-01-31').getTime(),
      ];
      const result = DAY(timestamps);

      expect(result).toEqual([1, 15, 31]);
    });

    it('should handle different month lengths', () => {
      const timestamps = [
        new Date('2024-01-31').getTime(), // 31 days
        new Date('2024-02-29').getTime(), // 29 days (leap year)
        new Date('2024-04-30').getTime(), // 30 days
      ];
      const result = DAY(timestamps);

      expect(result).toEqual([31, 29, 30]);
    });

    it('should work with empty array', () => {
      const result = DAY([]);
      expect(result).toEqual([]);
    });
  });

  describe('HOUR - Get hour (0-23)', () => {
    it('should extract hour from timestamps', () => {
      const timestamps = [
        new Date('2024-01-15 00:30:00').getTime(),
        new Date('2024-01-15 09:30:00').getTime(),
        new Date('2024-01-15 23:30:00').getTime(),
      ];
      const result = HOUR(timestamps);

      expect(result).toEqual([0, 9, 23]);
    });

    it('should return hours in range 0-23', () => {
      const timestamps = Array.from({ length: 24 }, (_, i) =>
        new Date(`2024-01-15 ${String(i).padStart(2, '0')}:00:00`).getTime()
      );
      const result = HOUR(timestamps);

      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
    });

    it('should work with empty array', () => {
      const result = HOUR([]);
      expect(result).toEqual([]);
    });
  });

  describe('MINUTE - Get minute (0-59)', () => {
    it('should extract minute from timestamps', () => {
      const timestamps = [
        new Date('2024-01-15 09:00:00').getTime(),
        new Date('2024-01-15 09:30:00').getTime(),
        new Date('2024-01-15 09:59:00').getTime(),
      ];
      const result = MINUTE(timestamps);

      expect(result).toEqual([0, 30, 59]);
    });

    it('should handle all minute values', () => {
      const timestamps = [
        new Date('2024-01-15 09:05:00').getTime(),
        new Date('2024-01-15 09:15:00').getTime(),
        new Date('2024-01-15 09:45:00').getTime(),
      ];
      const result = MINUTE(timestamps);

      expect(result).toEqual([5, 15, 45]);
    });

    it('should work with empty array', () => {
      const result = MINUTE([]);
      expect(result).toEqual([]);
    });
  });

  describe('WEEKDAY - Get day of week (1-7)', () => {
    it('should return 1 for Monday', () => {
      // 2024-01-15 is a Monday
      const timestamps = [new Date('2024-01-15').getTime()];
      const result = WEEKDAY(timestamps);

      expect(result).toEqual([1]);
    });

    it('should return 2-6 for Tuesday-Saturday', () => {
      const timestamps = [
        new Date('2024-01-16').getTime(), // Tuesday
        new Date('2024-01-17').getTime(), // Wednesday
        new Date('2024-01-18').getTime(), // Thursday
        new Date('2024-01-19').getTime(), // Friday
        new Date('2024-01-20').getTime(), // Saturday
      ];
      const result = WEEKDAY(timestamps);

      expect(result).toEqual([2, 3, 4, 5, 6]);
    });

    it('should return 7 for Sunday', () => {
      // 2024-01-21 is a Sunday
      const timestamps = [new Date('2024-01-21').getTime()];
      const result = WEEKDAY(timestamps);

      expect(result).toEqual([7]);
    });

    it('should correctly convert from JavaScript day (0=Sunday) to 1-7 (1=Monday)', () => {
      // Week from Monday to Sunday
      const timestamps = [
        new Date('2024-01-15').getTime(), // Monday (JS: 1 -> Result: 1)
        new Date('2024-01-16').getTime(), // Tuesday (JS: 2 -> Result: 2)
        new Date('2024-01-17').getTime(), // Wednesday (JS: 3 -> Result: 3)
        new Date('2024-01-18').getTime(), // Thursday (JS: 4 -> Result: 4)
        new Date('2024-01-19').getTime(), // Friday (JS: 5 -> Result: 5)
        new Date('2024-01-20').getTime(), // Saturday (JS: 6 -> Result: 6)
        new Date('2024-01-21').getTime(), // Sunday (JS: 0 -> Result: 7)
      ];
      const result = WEEKDAY(timestamps);

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should work with market trading days', () => {
      // US market trades Monday-Friday
      const timestamps = [
        new Date('2024-01-15').getTime(), // Monday
        new Date('2024-01-16').getTime(), // Tuesday
        new Date('2024-01-17').getTime(), // Wednesday
        new Date('2024-01-18').getTime(), // Thursday
        new Date('2024-01-19').getTime(), // Friday
      ];
      const result = WEEKDAY(timestamps);

      // All should be 1-5 (trading days)
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(result.every((day) => day >= 1 && day <= 5)).toBe(true);
    });

    it('should work with empty array', () => {
      const result = WEEKDAY([]);
      expect(result).toEqual([]);
    });
  });

  describe('Integration - All functions working together', () => {
    it('should extract all components from the same timestamps', () => {
      // 2024-01-15 (Monday) 09:30:00
      const timestamps = [new Date('2024-01-15 09:30:00').getTime()];

      expect(DATE(timestamps)).toEqual([20240115]);
      expect(TIME(timestamps)).toEqual([93000]);
      expect(YEAR(timestamps)).toEqual([2024]);
      expect(MONTH(timestamps)).toEqual([1]);
      expect(DAY(timestamps)).toEqual([15]);
      expect(HOUR(timestamps)).toEqual([9]);
      expect(MINUTE(timestamps)).toEqual([30]);
      expect(WEEKDAY(timestamps)).toEqual([1]);
    });

    it('should handle multiple timestamps consistently', () => {
      const timestamps = [
        new Date('2024-01-15 09:30:00').getTime(),
        new Date('2024-06-20 14:45:30').getTime(),
        new Date('2024-12-31 23:59:59').getTime(),
      ];

      expect(DATE(timestamps)).toEqual([20240115, 20240620, 20241231]);
      expect(YEAR(timestamps)).toEqual([2024, 2024, 2024]);
      expect(MONTH(timestamps)).toEqual([1, 6, 12]);
      expect(DAY(timestamps)).toEqual([15, 20, 31]);
    });
  });
});
