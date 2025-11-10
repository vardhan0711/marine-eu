import { describe, it, expect } from 'vitest';
import { bankSurplus } from '../../src/application/use-cases/BankSurplus';

describe('BankSurplus', () => {
  const baseDate = new Date('2024-01-15T10:00:00Z');

  describe('basic banking', () => {
    it('should bank surplus units with default 2-year validity', () => {
      const input = {
        surplusUnits: 1000,
        bankingDate: baseDate,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(1000);
      expect(result.originalSurplus).toBe(1000);
      expect(result.bankedAt).toBe(baseDate);
      expect(result.remainingSurplus).toBe(0);

      const expectedExpiry = new Date(baseDate);
      expectedExpiry.setFullYear(expectedExpiry.getFullYear() + 2);
      expect(result.expiryDate).toEqual(expectedExpiry);
    });

    it('should bank surplus with custom validity period', () => {
      const input = {
        surplusUnits: 5000,
        bankingDate: baseDate,
        bankingValidityYears: 3,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(5000);
      const expectedExpiry = new Date(baseDate);
      expectedExpiry.setFullYear(expectedExpiry.getFullYear() + 3);
      expect(result.expiryDate).toEqual(expectedExpiry);
    });
  });

  describe('over-banking (capacity limits)', () => {
    it('should limit banked units when surplus exceeds capacity', () => {
      const input = {
        surplusUnits: 10000,
        bankingDate: baseDate,
        maxBankingCapacity: 5000,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(5000);
      expect(result.originalSurplus).toBe(10000);
      expect(result.remainingSurplus).toBe(5000);
    });

    it('should handle exact capacity match', () => {
      const input = {
        surplusUnits: 5000,
        bankingDate: baseDate,
        maxBankingCapacity: 5000,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(5000);
      expect(result.remainingSurplus).toBe(0);
    });

    it('should handle surplus below capacity', () => {
      const input = {
        surplusUnits: 2000,
        bankingDate: baseDate,
        maxBankingCapacity: 5000,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(2000);
      expect(result.remainingSurplus).toBe(0);
    });

    it('should handle zero capacity (no banking allowed)', () => {
      const input = {
        surplusUnits: 1000,
        bankingDate: baseDate,
        maxBankingCapacity: 0,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(0);
      expect(result.remainingSurplus).toBe(1000);
    });
  });

  describe('edge cases', () => {
    it('should handle zero surplus', () => {
      const input = {
        surplusUnits: 0,
        bankingDate: baseDate,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(0);
      expect(result.originalSurplus).toBe(0);
      expect(result.remainingSurplus).toBe(0);
    });

    it('should handle very large surplus without capacity limit', () => {
      const input = {
        surplusUnits: 1000000,
        bankingDate: baseDate,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(1000000);
      expect(result.remainingSurplus).toBe(0);
    });

    it('should handle very small surplus', () => {
      const input = {
        surplusUnits: 0.001,
        bankingDate: baseDate,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(0.001);
      expect(result.remainingSurplus).toBe(0);
    });

    it('should handle different banking dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-12-31');

      const result1 = bankSurplus({
        surplusUnits: 1000,
        bankingDate: date1,
      });

      const result2 = bankSurplus({
        surplusUnits: 1000,
        bankingDate: date2,
      });

      expect(result1.expiryDate.getFullYear()).toBe(2026);
      expect(result2.expiryDate.getFullYear()).toBe(2026);
      expect(result1.expiryDate.getTime()).not.toBe(result2.expiryDate.getTime());
    });

    it('should handle leap year dates correctly', () => {
      const leapYearDate = new Date('2024-02-29T10:00:00Z');

      const result = bankSurplus({
        surplusUnits: 1000,
        bankingDate: leapYearDate,
        bankingValidityYears: 2,
      });

      // Should handle leap year correctly
      expect(result.expiryDate.getFullYear()).toBe(2026);
    });

    it('should handle negative surplus (should not happen but edge case)', () => {
      const input = {
        surplusUnits: -1000,
        bankingDate: baseDate,
      };

      const result = bankSurplus(input);

      // Negative surplus should result in negative banked units
      expect(result.bankedUnits).toBe(-1000);
      expect(result.originalSurplus).toBe(-1000);
      expect(result.remainingSurplus).toBe(0);
    });

    it('should handle over-banking with negative capacity limit', () => {
      const input = {
        surplusUnits: 1000,
        bankingDate: baseDate,
        maxBankingCapacity: -500,
      };

      const result = bankSurplus(input);

      // With negative capacity, should bank 0 (or negative, but Math.min handles it)
      expect(result.bankedUnits).toBe(-500);
      expect(result.remainingSurplus).toBe(1500);
    });

    it('should handle fractional surplus units', () => {
      const input = {
        surplusUnits: 1234.567,
        bankingDate: baseDate,
        maxBankingCapacity: 2000,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(1234.567);
      expect(result.remainingSurplus).toBe(0);
    });

    it('should handle over-banking with fractional capacity', () => {
      const input = {
        surplusUnits: 1000.5,
        bankingDate: baseDate,
        maxBankingCapacity: 500.25,
      };

      const result = bankSurplus(input);

      expect(result.bankedUnits).toBe(500.25);
      expect(result.remainingSurplus).toBe(500.25);
    });
  });
});

