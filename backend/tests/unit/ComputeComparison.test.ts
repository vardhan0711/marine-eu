import { describe, it, expect } from 'vitest';
import { computeComparison } from '../../src/application/use-cases/ComputeComparison';

describe('ComputeComparison', () => {
  const TARGET = 89.3368;

  describe('compliant cases', () => {
    it('should return compliant when actual equals target', () => {
      const result = computeComparison(TARGET);

      expect(result.actual).toBe(TARGET);
      expect(result.target).toBe(TARGET);
      expect(result.difference).toBe(0);
      expect(result.isCompliant).toBe(true);
    });

    it('should return compliant when actual is below target', () => {
      const actual = 75.5;
      const result = computeComparison(actual);

      expect(result.actual).toBe(actual);
      expect(result.target).toBe(TARGET);
      expect(result.difference).toBe(TARGET - actual);
      expect(result.isCompliant).toBe(true);
    });

    it('should return compliant for very low actual value', () => {
      const actual = 10.0;
      const result = computeComparison(actual);

      expect(result.actual).toBe(actual);
      expect(result.difference).toBe(TARGET - actual);
      expect(result.isCompliant).toBe(true);
    });
  });

  describe('non-compliant cases', () => {
    it('should return non-compliant when actual exceeds target', () => {
      const actual = 100.0;
      const result = computeComparison(actual);

      expect(result.actual).toBe(actual);
      expect(result.target).toBe(TARGET);
      expect(result.difference).toBe(TARGET - actual);
      expect(result.isCompliant).toBe(false);
    });

    it('should return non-compliant for very high actual value', () => {
      const actual = 150.0;
      const result = computeComparison(actual);

      expect(result.actual).toBe(actual);
      expect(result.difference).toBe(TARGET - actual);
      expect(result.isCompliant).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle zero actual value', () => {
      const result = computeComparison(0);

      expect(result.actual).toBe(0);
      expect(result.difference).toBe(TARGET);
      expect(result.isCompliant).toBe(true);
    });

    it('should handle very small actual value', () => {
      const actual = 0.001;
      const result = computeComparison(actual);

      expect(result.actual).toBe(actual);
      expect(result.difference).toBeCloseTo(TARGET - actual, 5);
      expect(result.isCompliant).toBe(true);
    });

    it('should handle negative difference correctly', () => {
      const actual = 100.0;
      const result = computeComparison(actual);

      expect(result.difference).toBeLessThan(0);
      expect(result.isCompliant).toBe(false);
    });
  });
});

