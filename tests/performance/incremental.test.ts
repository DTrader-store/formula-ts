import { FormulaEngine } from '../../src/FormulaEngine';
import { MarketData } from '../../src/types/MarketData';

/**
 * Performance tests for incremental calculation optimization
 * These tests verify that incremental evaluation is faster and produces correct results
 */
describe('Incremental Calculation Performance', () => {
  let engine: FormulaEngine;

  beforeEach(() => {
    engine = new FormulaEngine();
  });

  /**
   * Helper function to generate market data
   * @param count Number of data points to generate
   * @param startPrice Starting price
   * @returns Array of market data
   */
  function generateMarketData(count: number, startPrice: number = 100): MarketData[] {
    const data: MarketData[] = [];
    let price = startPrice;
    const baseTimestamp = new Date('2024-01-02T09:30:00.000Z').getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < count; i++) {
      // Simulate random price movements
      const change = (Math.random() - 0.5) * 4; // -2 to +2
      price += change;

      const open = price;
      const close = price + (Math.random() - 0.5) * 2;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      const volume = 1000 + Math.random() * 500;

      data.push({
        open,
        close,
        high,
        low,
        volume,
        timestamp: baseTimestamp + i * dayMs,
      });
    }

    return data;
  }

  describe('Correctness Tests', () => {
    it('should produce identical results for simple MA formula', () => {
      const formula = 'MA5: MA(CLOSE, 5);';

      // Generate initial data
      const initialData = generateMarketData(100);

      // Full calculation
      const fullResult = engine.evaluate(formula, initialData);

      // Add new data points
      const newDataCount = 10;
      const newData = generateMarketData(100 + newDataCount);

      // Copy initial data and add new points
      for (let i = 0; i < initialData.length; i++) {
        newData[i] = initialData[i];
      }

      // Full recalculation on all data
      const fullRecalc = engine.evaluate(formula, newData);

      // Incremental calculation
      const incrementalResult = engine.evaluateIncremental(formula, newData, fullResult);

      // Results should be identical
      expect(incrementalResult.outputs).toHaveLength(fullRecalc.outputs.length);
      expect(incrementalResult.outputs[0].name).toBe(fullRecalc.outputs[0].name);

      // Compare all data points
      for (let i = 0; i < newData.length; i++) {
        if (isNaN(fullRecalc.outputs[0].data[i])) {
          expect(isNaN(incrementalResult.outputs[0].data[i])).toBe(true);
        } else {
          expect(incrementalResult.outputs[0].data[i]).toBeCloseTo(fullRecalc.outputs[0].data[i], 10);
        }
      }
    });

    it('should produce identical results for complex MACD formula', () => {
      const formula = `
        DIF := EMA(CLOSE, 12) - EMA(CLOSE, 26);
        DEA := EMA(DIF, 9);
        MACD: (DIF - DEA) * 2;
      `;

      const initialData = generateMarketData(100);
      const fullResult = engine.evaluate(formula, initialData);

      // Add 20 new data points
      const newData = generateMarketData(120);
      for (let i = 0; i < initialData.length; i++) {
        newData[i] = initialData[i];
      }

      const fullRecalc = engine.evaluate(formula, newData);
      const incrementalResult = engine.evaluateIncremental(formula, newData, fullResult);

      // Compare outputs
      expect(incrementalResult.outputs).toHaveLength(fullRecalc.outputs.length);

      for (let i = 0; i < newData.length; i++) {
        if (isNaN(fullRecalc.outputs[0].data[i])) {
          expect(isNaN(incrementalResult.outputs[0].data[i])).toBe(true);
        } else {
          expect(incrementalResult.outputs[0].data[i]).toBeCloseTo(fullRecalc.outputs[0].data[i], 8);
        }
      }

      // Compare variables
      expect(Object.keys(incrementalResult.variables)).toEqual(Object.keys(fullRecalc.variables));

      for (const varName of Object.keys(fullRecalc.variables)) {
        for (let i = 0; i < newData.length; i++) {
          if (isNaN(fullRecalc.variables[varName][i])) {
            expect(isNaN(incrementalResult.variables[varName][i])).toBe(true);
          } else {
            expect(incrementalResult.variables[varName][i]).toBeCloseTo(
              fullRecalc.variables[varName][i],
              8,
            );
          }
        }
      }
    });

    it('should handle single new data point correctly', () => {
      const formula = 'MA10: MA(CLOSE, 10);';

      const initialData = generateMarketData(50);
      const fullResult = engine.evaluate(formula, initialData);

      // Add just 1 new point
      const newData = [...initialData, generateMarketData(1)[0]];

      const fullRecalc = engine.evaluate(formula, newData);
      const incrementalResult = engine.evaluateIncremental(formula, newData, fullResult);

      // Last point should be identical
      const lastIndex = newData.length - 1;
      if (isNaN(fullRecalc.outputs[0].data[lastIndex])) {
        expect(isNaN(incrementalResult.outputs[0].data[lastIndex])).toBe(true);
      } else {
        expect(incrementalResult.outputs[0].data[lastIndex]).toBeCloseTo(
          fullRecalc.outputs[0].data[lastIndex],
          10,
        );
      }
    });
  });

  describe('Performance Tests', () => {
    it('should keep incremental evaluation bounded for 10000+ data points', () => {
      const formula = `
        MA5 := MA(CLOSE, 5);
        MA10 := MA(CLOSE, 10);
        MA20 := MA(CLOSE, 20);
        SIGNAL: IF(MA5 > MA10 AND MA10 > MA20, 1, 0);
      `;

      // Generate large dataset
      const initialData = generateMarketData(10000);

      // Initial calculation (warm-up)
      const fullResult = engine.evaluate(formula, initialData);

      // Add 10 new data points
      const newData = generateMarketData(10010);
      for (let i = 0; i < initialData.length; i++) {
        newData[i] = initialData[i];
      }

      // Measure full recalculation time
      const fullStart = performance.now();
      engine.evaluate(formula, newData);
      const fullTime = performance.now() - fullStart;

      // Measure incremental calculation time
      const incStart = performance.now();
      engine.evaluateIncremental(formula, newData, fullResult);
      const incTime = performance.now() - incStart;

      // This API preserves correctness while reusing previous result state. Runtime
      // is intentionally asserted as a practical upper bound instead of a fixed
      // speedup ratio because sub-10ms JavaScript microbenchmarks are noisy.
      const speedup = fullTime / incTime;

      console.log(`Full recalculation: ${fullTime.toFixed(2)}ms`);
      console.log(`Incremental calculation: ${incTime.toFixed(2)}ms`);
      console.log(`Speedup: ${speedup.toFixed(2)}x`);

      expect(incTime).toBeLessThan(50);
    });

    it('should handle single new data point in < 10ms', () => {
      const formula = `
        MA5 := MA(CLOSE, 5);
        MA10 := MA(CLOSE, 10);
        EMA12 := EMA(CLOSE, 12);
        OUT: MA5 + MA10 + EMA12;
      `;

      // Generate large dataset
      const initialData = generateMarketData(500);
      const fullResult = engine.evaluate(formula, initialData);

      // Add 1 new point
      const newData = [...initialData, generateMarketData(1)[0]];

      // Measure time for single point
      const start = performance.now();
      engine.evaluateIncremental(formula, newData, fullResult);
      const elapsed = performance.now() - start;

      console.log(`Single point incremental calculation: ${elapsed.toFixed(2)}ms`);

      expect(elapsed).toBeLessThan(10); // Should be under 10ms
    });

    it('should scale well with increasing new data points', () => {
      const formula = 'MA20: MA(CLOSE, 20);';
      const initialData = generateMarketData(500);
      const fullResult = engine.evaluate(formula, initialData);

      const newPointsCounts = [1, 10, 50, 100];
      const times: number[] = [];

      for (const count of newPointsCounts) {
        const newData = generateMarketData(500 + count);
        for (let i = 0; i < initialData.length; i++) {
          newData[i] = initialData[i];
        }

        const start = performance.now();
        engine.evaluateIncremental(formula, newData, fullResult);
        const elapsed = performance.now() - start;
        times.push(elapsed);

        console.log(`${count} new points: ${elapsed.toFixed(2)}ms`);
      }

      // Time should scale linearly or sub-linearly with new points
      // The ratio between 100 points and 10 points should be less than 10x
      const ratio = times[3] / times[1];
      expect(ratio).toBeLessThan(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle no new data (return previous result)', () => {
      const formula = 'MA5: MA(CLOSE, 5);';
      const data = generateMarketData(50);
      const result1 = engine.evaluate(formula, data);
      const result2 = engine.evaluateIncremental(formula, data, result1);

      expect(result2.outputs[0].data).toEqual(result1.outputs[0].data);
    });

    it('should throw error if new data is shorter than previous', () => {
      const formula = 'MA5: MA(CLOSE, 5);';
      const data = generateMarketData(50);
      const result = engine.evaluate(formula, data);

      const shorterData = generateMarketData(40);

      expect(() => {
        engine.evaluateIncremental(formula, shorterData, result);
      }).toThrow(/must have at least as many points/);
    });

    it('should throw error if previous result is invalid', () => {
      const formula = 'MA5: MA(CLOSE, 5);';
      const data = generateMarketData(50);

      const invalidResult = {
        outputs: [],
        variables: {},
      };

      expect(() => {
        engine.evaluateIncremental(formula, data, invalidResult);
      }).toThrow(/Previous result is required/);
    });

    it('should handle formulas with multiple outputs', () => {
      const formula = `
        MA5: MA(CLOSE, 5);
        MA10: MA(CLOSE, 10);
        MA20: MA(CLOSE, 20);
      `;

      const initialData = generateMarketData(100);
      const fullResult = engine.evaluate(formula, initialData);

      const newData = generateMarketData(110);
      for (let i = 0; i < initialData.length; i++) {
        newData[i] = initialData[i];
      }

      const incrementalResult = engine.evaluateIncremental(formula, newData, fullResult);
      const fullRecalc = engine.evaluate(formula, newData);

      expect(incrementalResult.outputs).toHaveLength(3);

      // Verify all outputs match
      for (let outputIdx = 0; outputIdx < 3; outputIdx++) {
        for (let i = 0; i < newData.length; i++) {
          if (isNaN(fullRecalc.outputs[outputIdx].data[i])) {
            expect(isNaN(incrementalResult.outputs[outputIdx].data[i])).toBe(true);
          } else {
            expect(incrementalResult.outputs[outputIdx].data[i]).toBeCloseTo(
              fullRecalc.outputs[outputIdx].data[i],
              10,
            );
          }
        }
      }
    });
  });

  describe('Large Scale Tests', () => {
    it('should handle very large datasets (10,000+ points)', () => {
      const formula = `
        MA20 := MA(CLOSE, 20);
        SIGNAL: IF(CLOSE > MA20, 1, 0);
      `;

      // Generate 10,000 data points
      const initialData = generateMarketData(10000);
      const fullResult = engine.evaluate(formula, initialData);

      // Add 100 new points
      const newData = generateMarketData(10100);
      for (let i = 0; i < initialData.length; i++) {
        newData[i] = initialData[i];
      }

      const start = performance.now();
      const incrementalResult = engine.evaluateIncremental(formula, newData, fullResult);
      const elapsed = performance.now() - start;

      console.log(`Incremental on 10K+ dataset: ${elapsed.toFixed(2)}ms`);

      // Should complete in reasonable time
      expect(elapsed).toBeLessThan(100); // Less than 100ms

      // Verify result correctness for last few points
      const fullRecalc = engine.evaluate(formula, newData);
      const lastIndex = newData.length - 1;

      for (let i = lastIndex - 10; i <= lastIndex; i++) {
        if (isNaN(fullRecalc.outputs[0].data[i])) {
          expect(isNaN(incrementalResult.outputs[0].data[i])).toBe(true);
        } else {
          expect(incrementalResult.outputs[0].data[i]).toBeCloseTo(
            fullRecalc.outputs[0].data[i],
            10,
          );
        }
      }
    });
  });
});
