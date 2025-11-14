import { FormulaEngine } from '../../src/FormulaEngine';
import { MarketData } from '../../src/types/MarketData';
import { LexerError, ParserError } from '../../src/errors';

describe('FormulaEngine - End-to-End Integration Tests', () => {
  let engine: FormulaEngine;
  let marketData: MarketData[];

  beforeEach(() => {
    engine = new FormulaEngine();

    // Sample market data for testing
    const baseTimestamp = new Date('2024-01-02T09:30:00.000Z').getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    marketData = [
      { open: 100, close: 102, high: 105, low: 99, volume: 1000, timestamp: baseTimestamp },
      { open: 102, close: 101, high: 103, low: 100, volume: 1100, timestamp: baseTimestamp + dayMs },
      { open: 101, close: 103, high: 106, low: 101, volume: 1200, timestamp: baseTimestamp + 2 * dayMs },
      { open: 103, close: 105, high: 107, low: 102, volume: 1300, timestamp: baseTimestamp + 3 * dayMs },
      { open: 105, close: 104, high: 106, low: 103, volume: 1400, timestamp: baseTimestamp + 4 * dayMs },
      { open: 104, close: 106, high: 108, low: 104, volume: 1500, timestamp: baseTimestamp + 5 * dayMs },
      { open: 106, close: 108, high: 110, low: 105, volume: 1600, timestamp: baseTimestamp + 6 * dayMs },
      { open: 108, close: 107, high: 109, low: 106, volume: 1700, timestamp: baseTimestamp + 7 * dayMs },
      { open: 107, close: 109, high: 111, low: 107, volume: 1800, timestamp: baseTimestamp + 8 * dayMs },
      { open: 109, close: 110, high: 112, low: 108, volume: 1900, timestamp: baseTimestamp + 9 * dayMs },
    ];
  });

  describe('MA (Moving Average) Formula', () => {
    it('should calculate MA5 correctly', () => {
      const formula = 'MA5: MA(CLOSE, 5);';
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].name).toBe('MA5');
      expect(result.outputs[0].data).toHaveLength(10);

      // First 4 values should be NaN (insufficient data)
      expect(isNaN(result.outputs[0].data[0])).toBe(true);
      expect(isNaN(result.outputs[0].data[1])).toBe(true);
      expect(isNaN(result.outputs[0].data[2])).toBe(true);
      expect(isNaN(result.outputs[0].data[3])).toBe(true);

      // 5th value: (102 + 101 + 103 + 105 + 104) / 5 = 103
      expect(result.outputs[0].data[4]).toBeCloseTo(103, 2);

      // 6th value: (101 + 103 + 105 + 104 + 106) / 5 = 103.8
      expect(result.outputs[0].data[5]).toBeCloseTo(103.8, 2);
    });

    it('should calculate multiple MA lines', () => {
      const formula = `
        MA5: MA(CLOSE, 5);
        MA10: MA(CLOSE, 10);
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(2);
      expect(result.outputs[0].name).toBe('MA5');
      expect(result.outputs[1].name).toBe('MA10');

      // MA10 should have 9 NaN values
      expect(isNaN(result.outputs[1].data[8])).toBe(true);
      expect(isNaN(result.outputs[1].data[9])).toBe(false);
    });
  });

  describe('MACD Formula', () => {
    it('should calculate simplified MACD', () => {
      const formula = `
        DIF := EMA(CLOSE, 12) - EMA(CLOSE, 26);
        DEA := EMA(DIF, 9);
        MACD: (DIF - DEA) * 2;
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].name).toBe('MACD');
      expect(result.outputs[0].data).toHaveLength(10);

      // Variables should be stored
      expect(result.variables).toHaveProperty('DIF');
      expect(result.variables).toHaveProperty('DEA');
      expect(result.variables.DIF).toHaveLength(10);
      expect(result.variables.DEA).toHaveLength(10);
    });
  });

  describe('KDJ Formula', () => {
    it('should calculate simplified KDJ', () => {
      const formula = `
        RSV := (CLOSE - LLV(LOW, 9)) / (HHV(HIGH, 9) - LLV(LOW, 9)) * 100;
        K: RSV;
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].name).toBe('K');
      expect(result.outputs[0].data).toHaveLength(10);

      // RSV should be calculated
      expect(result.variables).toHaveProperty('RSV');
      expect(result.variables.RSV).toHaveLength(10);

      // First 8 values should be NaN (need 9 periods)
      for (let i = 0; i < 8; i++) {
        expect(isNaN(result.outputs[0].data[i])).toBe(true);
      }

      // 9th and 10th values should be valid
      expect(isNaN(result.outputs[0].data[8])).toBe(false);
      expect(isNaN(result.outputs[0].data[9])).toBe(false);
    });
  });

  describe('Formulas with Variables', () => {
    it('should handle variable declarations and references', () => {
      const formula = `
        UPPER := MA(CLOSE, 5) + 2;
        LOWER := MA(CLOSE, 5) - 2;
        MID: (UPPER + LOWER) / 2;
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].name).toBe('MID');
      expect(result.variables).toHaveProperty('UPPER');
      expect(result.variables).toHaveProperty('LOWER');

      // MID should equal MA(CLOSE, 5) since UPPER and LOWER cancel out
      const ma5 = engine.evaluate('MA5: MA(CLOSE, 5);', marketData);
      for (let i = 0; i < 10; i++) {
        if (!isNaN(result.outputs[0].data[i])) {
          expect(result.outputs[0].data[i]).toBeCloseTo(ma5.outputs[0].data[i], 2);
        }
      }
    });

    it('should handle complex expressions', () => {
      const formula = `
        DIFF := HIGH - LOW;
        RANGE := (HIGH + LOW) / 2;
        RATIO: DIFF / RANGE * 100;
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].name).toBe('RATIO');
      expect(result.outputs[0].data).toHaveLength(10);

      // All values should be valid (no lookback needed)
      for (let i = 0; i < 10; i++) {
        expect(isNaN(result.outputs[0].data[i])).toBe(false);
        expect(result.outputs[0].data[i]).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw LexerError for invalid characters', () => {
      const formula = 'MA5: MA(CLOSE, 5) @ invalid;';

      expect(() => {
        engine.evaluate(formula, marketData);
      }).toThrow(LexerError);
    });

    it('should throw ParserError for syntax errors', () => {
      const formula = 'MA5: MA(CLOSE, 5;'; // Missing closing parenthesis

      expect(() => {
        engine.evaluate(formula, marketData);
      }).toThrow(ParserError);
    });

    it('should throw error for unknown functions', () => {
      const formula = 'TEST: UNKNOWN_FUNC(CLOSE, 5);';

      expect(() => {
        engine.evaluate(formula, marketData);
      }).toThrow(/Unknown function/);
    });

    it('should throw error for unknown identifiers', () => {
      const formula = 'TEST: UNDEFINED_VAR + 1;';

      expect(() => {
        engine.evaluate(formula, marketData);
      }).toThrow(/Undefined identifier/);
    });

    it('should throw error for empty market data', () => {
      const formula = 'MA5: MA(CLOSE, 5);';

      expect(() => {
        engine.evaluate(formula, []);
      }).toThrow(/empty/);
    });
  });

  describe('Logical Functions', () => {
    it('should handle IF function', () => {
      const formula = `
        SIGNAL: IF(CLOSE > OPEN, 1, 0);
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].name).toBe('SIGNAL');

      // Check specific values
      expect(result.outputs[0].data[0]).toBe(1); // close 102 > open 100
      expect(result.outputs[0].data[1]).toBe(0); // close 101 < open 102
      expect(result.outputs[0].data[2]).toBe(1); // close 103 > open 101
    });

    it('should handle CROSS function', () => {
      const formula = `
        MA5 := MA(CLOSE, 5);
        MA10 := MA(CLOSE, 10);
        CROSS_UP: CROSS(MA5, MA10);
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].name).toBe('CROSS_UP');
      expect(result.outputs[0].data).toHaveLength(10);

      // First value should be 0 (no previous value to compare)
      expect(result.outputs[0].data[0]).toBe(0);
    });
  });

  describe('Reference Functions', () => {
    it('should handle REF function', () => {
      const formula = `
        PREV_CLOSE: REF(CLOSE, 1);
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].name).toBe('PREV_CLOSE');

      // First value should be NaN
      expect(isNaN(result.outputs[0].data[0])).toBe(true);

      // Second value should be first close
      expect(result.outputs[0].data[1]).toBe(102); // First close value
      expect(result.outputs[0].data[2]).toBe(101); // Second close value
    });

    it('should handle HHV and LLV functions', () => {
      const formula = `
        HIGHEST: HHV(HIGH, 5);
        LOWEST: LLV(LOW, 5);
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(2);

      // First 4 values should be NaN
      for (let i = 0; i < 4; i++) {
        expect(isNaN(result.outputs[0].data[i])).toBe(true);
        expect(isNaN(result.outputs[1].data[i])).toBe(true);
      }

      // 5th value should be valid
      expect(isNaN(result.outputs[0].data[4])).toBe(false);
      expect(isNaN(result.outputs[1].data[4])).toBe(false);
    });
  });

  describe('Arithmetic Operations', () => {
    it('should handle basic arithmetic', () => {
      const formula = `
        RANGE: HIGH - LOW;
        DOUBLE: CLOSE * 2;
        HALF: CLOSE / 2;
        SUM: OPEN + CLOSE;
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(4);

      // Check first data point
      expect(result.outputs[0].data[0]).toBe(6); // 105 - 99
      expect(result.outputs[1].data[0]).toBe(204); // 102 * 2
      expect(result.outputs[2].data[0]).toBe(51); // 102 / 2
      expect(result.outputs[3].data[0]).toBe(202); // 100 + 102
    });

    it('should handle comparison operations', () => {
      const formula = `
        BULLISH: CLOSE > OPEN;
        EQUAL: HIGH = HIGH;
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(2);

      // BULLISH: check if close > open
      expect(result.outputs[0].data[0]).toBe(1); // 102 > 100
      expect(result.outputs[0].data[1]).toBe(0); // 101 < 102

      // EQUAL: should always be 1
      for (let i = 0; i < 10; i++) {
        expect(result.outputs[1].data[i]).toBe(1);
      }
    });

    it('should handle logical operations', () => {
      const formula = `
        BULL_AND_HIGH: (CLOSE > OPEN) AND (HIGH > 105);
        BULL_OR_HIGH: (CLOSE > OPEN) OR (HIGH > 105);
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(2);
      expect(result.outputs[0].data).toHaveLength(10);
      expect(result.outputs[1].data).toHaveLength(10);
    });
  });

  describe('Real Market Data Scenarios', () => {
    it('should calculate Bollinger Bands', () => {
      const formula = `
        MA20 := MA(CLOSE, 5);
        UPPER: MA20 + 2;
        MIDDLE: MA20;
        LOWER: MA20 - 2;
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(3);
      expect(result.outputs[0].name).toBe('UPPER');
      expect(result.outputs[1].name).toBe('MIDDLE');
      expect(result.outputs[2].name).toBe('LOWER');

      // Verify the band relationships
      for (let i = 4; i < 10; i++) {
        expect(result.outputs[0].data[i]).toBeGreaterThan(result.outputs[1].data[i]);
        expect(result.outputs[1].data[i]).toBeGreaterThan(result.outputs[2].data[i]);
        expect(result.outputs[0].data[i] - result.outputs[1].data[i]).toBeCloseTo(2, 2);
        expect(result.outputs[1].data[i] - result.outputs[2].data[i]).toBeCloseTo(2, 2);
      }
    });

    it('should calculate price channels', () => {
      const formula = `
        HH := HHV(HIGH, 5);
        LL := LLV(LOW, 5);
        UPPER: HH;
        LOWER: LL;
        MIDDLE: (HH + LL) / 2;
      `;
      const result = engine.evaluate(formula, marketData);

      expect(result.outputs).toHaveLength(3);

      // Verify channel relationships
      for (let i = 4; i < 10; i++) {
        expect(result.outputs[0].data[i]).toBeGreaterThanOrEqual(result.outputs[2].data[i]);
        expect(result.outputs[2].data[i]).toBeGreaterThanOrEqual(result.outputs[1].data[i]);
      }
    });
  });

  describe('Parse Method', () => {
    it('should parse formula without evaluating', () => {
      const formula = 'MA5: MA(CLOSE, 5);';
      const ast = engine.parse(formula);

      expect(ast.type).toBe('Program');
      expect(ast.body).toHaveLength(1);
      expect(ast.body[0].type).toBe('OutputDeclaration');
    });

    it('should parse complex formulas', () => {
      const formula = `
        VAR1 := MA(CLOSE, 5);
        VAR2 := EMA(HIGH, 10);
        OUT1: VAR1 + VAR2;
        OUT2: VAR1 - VAR2;
      `;
      const ast = engine.parse(formula);

      expect(ast.body).toHaveLength(4);
      expect(ast.body[0].type).toBe('VariableDeclaration');
      expect(ast.body[1].type).toBe('VariableDeclaration');
      expect(ast.body[2].type).toBe('OutputDeclaration');
      expect(ast.body[3].type).toBe('OutputDeclaration');
    });
  });

  describe('New Functions Integration Tests - Phase 4 Stage 1', () => {
    describe('Market Data Accessor Functions', () => {
      it('should access basic OHLC fields', () => {
        const formula = `
          O: OPEN;
          H: HIGH;
          L: LOW;
          C: CLOSE;
          V: VOL;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(5);
        expect(result.outputs[0].data[0]).toBe(100);
        expect(result.outputs[1].data[0]).toBe(105);
        expect(result.outputs[2].data[0]).toBe(99);
        expect(result.outputs[3].data[0]).toBe(102);
        expect(result.outputs[4].data[0]).toBe(1000);
      });

      it('should calculate with market data functions', () => {
        const formula = `
          BODY: CLOSE - OPEN;
          RANGE: HIGH - LOW;
          BULLISH: IF(CLOSE > OPEN, 1, 0);
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(3);
        expect(result.outputs[0].data[0]).toBe(2); // 102 - 100
        expect(result.outputs[1].data[0]).toBe(6); // 105 - 99
        expect(result.outputs[2].data[0]).toBe(1); // close > open
      });
    });

    describe('Pattern Functions', () => {
      it('should detect consecutive rises with UPNDAY', () => {
        const formula = `
          UP3: UPNDAY(CLOSE, 3);
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
        // First 3 values should be 0 (not enough data)
        expect(result.outputs[0].data[0]).toBe(0);
        expect(result.outputs[0].data[1]).toBe(0);
        expect(result.outputs[0].data[2]).toBe(0);
      });

      it('should detect consecutive falls with DOWNNDAY', () => {
        const formula = `
          DOWN2: DOWNNDAY(CLOSE, 2);
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
      });

      it('should check range with RANGE function', () => {
        const formula = `
          IN_RANGE: RANGE(CLOSE, 100, 110);
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        // All closes should be in range 100-110
        for (let i = 0; i < 10; i++) {
          expect(result.outputs[0].data[i]).toBe(1);
        }
      });

      it('should use NDAY for custom conditions', () => {
        const formula = `
          BULLISH := CLOSE > OPEN;
          BULL3: NDAY(BULLISH, 3);
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
      });
    });

    describe('Combined Pattern and MA Strategies', () => {
      it('should combine UPNDAY with MA crossover', () => {
        const formula = `
          MA5 := MA(CLOSE, 5);
          MA10 := MA(CLOSE, 10);
          UP3 := UPNDAY(CLOSE, 3);
          GOLDEN := CROSS(MA5, MA10);
          SIGNAL: UP3 AND GOLDEN;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].name).toBe('SIGNAL');
        expect(result.outputs[0].data).toHaveLength(10);
      });

      it('should filter signals by price range', () => {
        const formula = `
          MA5 := MA(CLOSE, 5);
          CROSS_UP := CROSS(MA5, MA(CLOSE, 10));
          PRICE_OK := RANGE(CLOSE, 105, 115);
          BUY: CROSS_UP AND PRICE_OK;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
      });
    });

    describe('Time Functions Integration', () => {
      it('should extract date components', () => {
        const formula = `
          Y: YEAR;
          M: MONTH;
          D: DAY;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(3);
        // Should extract year 2024
        expect(result.outputs[0].data[0]).toBe(2024);
        // Should extract month 1 (January)
        expect(result.outputs[1].data[0]).toBe(1);
        // Should extract day 2
        expect(result.outputs[2].data[0]).toBe(2);
      });

      it('should get date in YYYYMMDD format', () => {
        const formula = `
          D: DATE;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        // Should return 20240102
        expect(result.outputs[0].data[0]).toBe(20240102);
      });

      it('should filter by time period', () => {
        const formula = `
          YEAR_FILTER := YEAR = 2024;
          MONTH_FILTER := MONTH >= 1;
          TIME_OK: YEAR_FILTER AND MONTH_FILTER;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        // All data points should pass time filter
        for (let i = 0; i < 10; i++) {
          expect(result.outputs[0].data[i]).toBe(1);
        }
      });

      it('should get weekday', () => {
        const formula = `
          WD: WEEKDAY;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        // January 2, 2024 is a Tuesday (2)
        expect(result.outputs[0].data[0]).toBe(2);
      });
    });

    describe('Period Functions Integration', () => {
      it('should detect period type', () => {
        const formula = `
          P: PERIOD;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        // Should detect daily period (101)
        expect(result.outputs[0].data[0]).toBe(101);
      });

      it('should count total bars', () => {
        const formula = `
          BC: BARSCOUNT;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        // All positions should show total count of 10
        for (let i = 0; i < 10; i++) {
          expect(result.outputs[0].data[i]).toBe(10);
        }
      });

      it('should identify last bar', () => {
        const formula = `
          LAST: ISLASTBAR;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        // Only last bar should be 1
        for (let i = 0; i < 9; i++) {
          expect(result.outputs[0].data[i]).toBe(0);
        }
        expect(result.outputs[0].data[9]).toBe(1);
      });

      it('should count bars since condition', () => {
        const formula = `
          GOLDEN := CROSS(MA(CLOSE, 5), MA(CLOSE, 10));
          BARS: BARSSINCE(GOLDEN);
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
      });
    });

    describe('Chip Distribution Functions', () => {
      it('should calculate profit ratio with WINNER', () => {
        const formula = `
          PROFIT: WINNER(CLOSE, VOLUME, CLOSE);
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
        // Values should be between 0 and 1
        for (let i = 0; i < 10; i++) {
          expect(result.outputs[0].data[i]).toBeGreaterThanOrEqual(0);
          expect(result.outputs[0].data[i]).toBeLessThanOrEqual(1);
        }
      });

      it('should track value when condition met', () => {
        const formula = `
          CROSS_UP := CROSS(MA(CLOSE, 5), MA(CLOSE, 10));
          BUY_PRICE: VALUEWHEN(CROSS_UP, CLOSE);
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
      });

      it('should detect new high with TOPRANGE', () => {
        const formula = `
          NEW_HIGH: TOPRANGE(HIGH);
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
      });

      it('should detect new low with LOWRANGE', () => {
        const formula = `
          NEW_LOW: LOWRANGE(LOW);
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
      });
    });

    describe('Complex Real-World Scenarios', () => {
      it('should implement time-filtered MA strategy', () => {
        const formula = `
          TIME_OK := YEAR = 2024 AND MONTH >= 1;
          MA5 := MA(CLOSE, 5);
          MA10 := MA(CLOSE, 10);
          GOLDEN := CROSS(MA5, MA10);
          SIGNAL: TIME_OK AND GOLDEN;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.variables).toHaveProperty('TIME_OK');
        expect(result.variables).toHaveProperty('GOLDEN');
      });

      it('should implement consecutive rise with volume confirmation', () => {
        const formula = `
          UP3 := UPNDAY(CLOSE, 3);
          VOL_UP := VOLUME > MA(VOLUME, 5) * 1.2;
          SIGNAL: UP3 AND VOL_UP;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
      });

      it('should implement profit analysis strategy', () => {
        const formula = `
          WIN_RATIO := WINNER(CLOSE, VOLUME, CLOSE);
          LOW_WIN := WIN_RATIO < 0.3;
          NEW_HIGH := TOPRANGE(HIGH, 20);
          BUY: LOW_WIN AND NEW_HIGH;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.variables).toHaveProperty('WIN_RATIO');
        expect(result.variables).toHaveProperty('LOW_WIN');
      });

      it('should implement comprehensive trading strategy', () => {
        const formula = `
          MA5 := MA(CLOSE, 5);
          MA10 := MA(CLOSE, 10);
          GOLDEN := CROSS(MA5, MA10);
          BUY_PRICE := VALUEWHEN(GOLDEN, CLOSE);
          PROFIT := (CLOSE - BUY_PRICE) / BUY_PRICE * 100;
          HOLD_DAYS := BARSSINCE(GOLDEN);
          SELL: PROFIT > 5 OR HOLD_DAYS > 10;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].name).toBe('SELL');
        expect(result.variables).toHaveProperty('MA5');
        expect(result.variables).toHaveProperty('PROFIT');
        expect(result.variables).toHaveProperty('HOLD_DAYS');
      });

      it('should combine pattern, time, and volume analysis', () => {
        const formula = `
          YEAR_OK := YEAR = 2024;
          UP3 := UPNDAY(CLOSE, 3);
          PRICE_RANGE := RANGE(CLOSE, 100, 115);
          VOL_HIGH := VOLUME > REF(VOLUME, 1) * 1.5;
          STRONG_BUY: YEAR_OK AND UP3 AND PRICE_RANGE AND VOL_HIGH;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.outputs[0].data).toHaveLength(10);
      });

      it('should implement breakout detection with chip analysis', () => {
        const formula = `
          HH := HHV(HIGH, 20);
          BREAKOUT := HIGH > REF(HH, 1);
          WIN_RATIO := WINNER(CLOSE, VOLUME, CLOSE);
          LOW_PROFIT := WIN_RATIO < 0.3;
          BUY: BREAKOUT AND LOW_PROFIT;
        `;
        const result = engine.evaluate(formula, marketData);

        expect(result.outputs).toHaveLength(1);
        expect(result.variables).toHaveProperty('HH');
        expect(result.variables).toHaveProperty('BREAKOUT');
        expect(result.variables).toHaveProperty('WIN_RATIO');
      });
    });
  });
});
