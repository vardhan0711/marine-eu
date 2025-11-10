import { describe, it, expect } from 'vitest';
import { computeCB } from '../../src/application/use-cases/ComputeCB';

describe('ComputeCB', () => {
  const TARGET = 89.3368;
  const MULTIPLIER = 41000;

  describe('positive CB (surplus)', () => {
    it('should compute positive CB when actual is below target', () => {
      const actual = 75.0;
      const fuel = 100; // metric tons

      const result = computeCB(actual, fuel);

      const expectedCB = (TARGET - actual) * fuel * MULTIPLIER;
      expect(result.cb).toBe(expectedCB);
      expect(result.cb).toBeGreaterThan(0);
      expect(result.isSurplus).toBe(true);
      expect(result.target).toBe(TARGET);
      expect(result.actual).toBe(actual);
      expect(result.fuelConsumption).toBe(fuel);
    });

    it('should compute large surplus for low actual intensity', () => {
      const actual = 50.0;
      const fuel = 200;

      const result = computeCB(actual, fuel);

      const expectedCB = (TARGET - actual) * fuel * MULTIPLIER;
      expect(result.cb).toBe(expectedCB);
      expect(result.cb).toBeGreaterThan(0);
      expect(result.isSurplus).toBe(true);
    });

    it('should compute positive CB when actual equals target minus epsilon', () => {
      const actual = TARGET - 0.0001;
      const fuel = 50;

      const result = computeCB(actual, fuel);

      expect(result.cb).toBeGreaterThan(0);
      expect(result.isSurplus).toBe(true);
    });
  });

  describe('negative CB (deficit)', () => {
    it('should compute negative CB when actual exceeds target', () => {
      const actual = 100.0;
      const fuel = 100; // metric tons

      const result = computeCB(actual, fuel);

      const expectedCB = (TARGET - actual) * fuel * MULTIPLIER;
      expect(result.cb).toBe(expectedCB);
      expect(result.cb).toBeLessThan(0);
      expect(result.isSurplus).toBe(false);
      expect(result.target).toBe(TARGET);
      expect(result.actual).toBe(actual);
      expect(result.fuelConsumption).toBe(fuel);
    });

    it('should compute large deficit for high actual intensity', () => {
      const actual = 150.0;
      const fuel = 200;

      const result = computeCB(actual, fuel);

      const expectedCB = (TARGET - actual) * fuel * MULTIPLIER;
      expect(result.cb).toBe(expectedCB);
      expect(result.cb).toBeLessThan(0);
      expect(result.isSurplus).toBe(false);
    });

    it('should compute negative CB when actual equals target plus epsilon', () => {
      const actual = TARGET + 0.0001;
      const fuel = 50;

      const result = computeCB(actual, fuel);

      expect(result.cb).toBeLessThan(0);
      expect(result.isSurplus).toBe(false);
    });
  });

  describe('zero CB', () => {
    it('should compute zero CB when actual equals target', () => {
      const actual = TARGET;
      const fuel = 100;

      const result = computeCB(actual, fuel);

      expect(result.cb).toBe(0);
      expect(result.isSurplus).toBe(false);
    });
  });

  describe('formula verification', () => {
    it('should use exact formula: CB = (target - actual) × fuel × 41000', () => {
      const actual = 80.0;
      const fuel = 150;

      const result = computeCB(actual, fuel);

      const expected = (TARGET - actual) * fuel * MULTIPLIER;
      expect(result.cb).toBe(expected);
    });

    it('should handle different fuel consumption values', () => {
      const actual = 85.0;

      const fuel1 = 50;
      const fuel2 = 100;
      const fuel3 = 250;

      const result1 = computeCB(actual, fuel1);
      const result2 = computeCB(actual, fuel2);
      const result3 = computeCB(actual, fuel3);

      expect(result2.cb).toBe(result1.cb * 2);
      expect(result3.cb).toBe(result1.cb * 5);
    });
  });

  describe('edge cases', () => {
    it('should handle zero fuel consumption', () => {
      const actual = 100.0;
      const fuel = 0;

      const result = computeCB(actual, fuel);

      expect(result.cb).toBe(0);
      expect(result.fuelConsumption).toBe(0);
    });

    it('should handle very small fuel consumption', () => {
      const actual = 80.0;
      const fuel = 0.001;

      const result = computeCB(actual, fuel);

      const expected = (TARGET - actual) * fuel * MULTIPLIER;
      expect(result.cb).toBeCloseTo(expected, 10);
    });

    it('should handle very large fuel consumption', () => {
      const actual = 85.0;
      const fuel = 10000;

      const result = computeCB(actual, fuel);

      const expected = (TARGET - actual) * fuel * MULTIPLIER;
      expect(result.cb).toBe(expected);
    });

    it('should handle negative fuel consumption (edge case)', () => {
      const actual = 80.0;
      const fuel = -100;

      const result = computeCB(actual, fuel);

      // Negative fuel should result in negative CB (or zero, depending on interpretation)
      const expected = (TARGET - actual) * fuel * MULTIPLIER;
      expect(result.cb).toBe(expected);
      expect(result.cb).toBeLessThan(0);
    });

    it('should handle extreme negative CB values', () => {
      const actual = 200.0; // Very high intensity
      const fuel = 500; // Large fuel consumption

      const result = computeCB(actual, fuel);

      expect(result.cb).toBeLessThan(0);
      expect(result.isSurplus).toBe(false);
      // Verify the calculation
      const expected = (TARGET - actual) * fuel * MULTIPLIER;
      expect(result.cb).toBe(expected);
    });

    it('should handle extreme positive CB values', () => {
      const actual = 20.0; // Very low intensity
      const fuel = 500; // Large fuel consumption

      const result = computeCB(actual, fuel);

      expect(result.cb).toBeGreaterThan(0);
      expect(result.isSurplus).toBe(true);
      // Verify the calculation
      const expected = (TARGET - actual) * fuel * MULTIPLIER;
      expect(result.cb).toBe(expected);
    });
  });
});

