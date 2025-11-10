import { describe, it, expect } from 'vitest';
import { applyBanked, BankedUnit } from '../../src/application/use-cases/ApplyBanked';

describe('ApplyBanked', () => {
  const baseDate = new Date('2024-01-15T10:00:00Z');

  const createBankedUnit = (
    id: string,
    units: number,
    bankedAt: Date,
    validityYears: number = 2
  ): BankedUnit => {
    const expiryDate = new Date(bankedAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + validityYears);
    return { id, units, bankedAt, expiryDate };
  };

  describe('successful application', () => {
    it('should apply banked units to cover exact deficit', () => {
      const bankedUnits: BankedUnit[] = [
        createBankedUnit('unit1', 1000, new Date('2023-01-01')),
      ];

      const input = {
        deficit: 1000,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(1000);
      expect(result.remainingDeficit).toBe(0);
      expect(result.usedBankedUnits).toHaveLength(1);
      expect(result.usedBankedUnits[0].bankedUnitId).toBe('unit1');
      expect(result.usedBankedUnits[0].appliedAmount).toBe(1000);
      expect(result.unusedBankedUnits).toHaveLength(0);
    });

    it('should apply multiple banked units using FIFO', () => {
      const bankedUnits: BankedUnit[] = [
        createBankedUnit('unit1', 500, new Date('2023-01-01')),
        createBankedUnit('unit2', 300, new Date('2023-06-01')),
        createBankedUnit('unit3', 200, new Date('2023-12-01')),
      ];

      const input = {
        deficit: 1000,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(1000);
      expect(result.remainingDeficit).toBe(0);
      expect(result.usedBankedUnits).toHaveLength(3);
      expect(result.usedBankedUnits[0].bankedUnitId).toBe('unit1');
      expect(result.usedBankedUnits[1].bankedUnitId).toBe('unit2');
      expect(result.usedBankedUnits[2].bankedUnitId).toBe('unit3');
    });

    it('should partially use a banked unit when deficit is smaller', () => {
      const bankedUnits: BankedUnit[] = [
        createBankedUnit('unit1', 1000, new Date('2023-01-01')),
      ];

      const input = {
        deficit: 300,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(300);
      expect(result.remainingDeficit).toBe(0);
      expect(result.usedBankedUnits).toHaveLength(1);
      expect(result.usedBankedUnits[0].appliedAmount).toBe(300);
      expect(result.unusedBankedUnits).toHaveLength(1);
      expect(result.unusedBankedUnits[0].units).toBe(700);
    });
  });

  describe('insufficient banked units', () => {
    it('should apply all available units when deficit exceeds available', () => {
      const bankedUnits: BankedUnit[] = [
        createBankedUnit('unit1', 500, new Date('2023-01-01')),
        createBankedUnit('unit2', 300, new Date('2023-06-01')),
      ];

      const input = {
        deficit: 2000,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(800);
      expect(result.remainingDeficit).toBe(1200);
      expect(result.usedBankedUnits).toHaveLength(2);
      expect(result.unusedBankedUnits).toHaveLength(0);
    });

    it('should return full deficit when no banked units available', () => {
      const input = {
        deficit: 1000,
        availableBankedUnits: [],
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(0);
      expect(result.remainingDeficit).toBe(1000);
      expect(result.usedBankedUnits).toHaveLength(0);
      expect(result.unusedBankedUnits).toHaveLength(0);
    });
  });

  describe('expired units', () => {
    it('should filter out expired units', () => {
      const bankedUnits: BankedUnit[] = [
        createBankedUnit('unit1', 1000, new Date('2021-01-01'), 2), // expired
        createBankedUnit('unit2', 500, new Date('2023-01-01'), 2), // valid
      ];

      const input = {
        deficit: 1500,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(500);
      expect(result.remainingDeficit).toBe(1000);
      expect(result.usedBankedUnits).toHaveLength(1);
      expect(result.usedBankedUnits[0].bankedUnitId).toBe('unit2');
    });

    it('should use units expiring on application date', () => {
      const expiryDate = new Date(baseDate);
      const bankedUnits: BankedUnit[] = [
        {
          id: 'unit1',
          units: 1000,
          bankedAt: new Date('2022-01-15'),
          expiryDate,
        },
      ];

      const input = {
        deficit: 1000,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(1000);
      expect(result.remainingDeficit).toBe(0);
    });

    it('should exclude units expiring before application date', () => {
      const expiryDate = new Date(baseDate);
      expiryDate.setDate(expiryDate.getDate() - 1);

      const bankedUnits: BankedUnit[] = [
        {
          id: 'unit1',
          units: 1000,
          bankedAt: new Date('2022-01-15'),
          expiryDate,
        },
      ];

      const input = {
        deficit: 1000,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(0);
      expect(result.remainingDeficit).toBe(1000);
    });
  });

  describe('FIFO ordering', () => {
    it('should apply oldest units first', () => {
      const bankedUnits: BankedUnit[] = [
        createBankedUnit('unit3', 200, new Date('2023-12-01')),
        createBankedUnit('unit1', 500, new Date('2023-01-01')),
        createBankedUnit('unit2', 300, new Date('2023-06-01')),
      ];

      const input = {
        deficit: 600,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.usedBankedUnits[0].bankedUnitId).toBe('unit1');
      expect(result.usedBankedUnits[1].bankedUnitId).toBe('unit2');
      expect(result.usedBankedUnits[0].appliedAmount).toBe(500);
      expect(result.usedBankedUnits[1].appliedAmount).toBe(100);
    });
  });

  describe('edge cases', () => {
    it('should handle zero deficit', () => {
      const bankedUnits: BankedUnit[] = [
        createBankedUnit('unit1', 1000, new Date('2023-01-01')),
      ];

      const input = {
        deficit: 0,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(0);
      expect(result.remainingDeficit).toBe(0);
      expect(result.usedBankedUnits).toHaveLength(0);
      expect(result.unusedBankedUnits).toHaveLength(1);
    });

    it('should handle very large deficit', () => {
      const bankedUnits: BankedUnit[] = [
        createBankedUnit('unit1', 1000, new Date('2023-01-01')),
      ];

      const input = {
        deficit: 1000000,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(1000);
      expect(result.remainingDeficit).toBe(999000);
    });

    it('should handle very small deficit', () => {
      const bankedUnits: BankedUnit[] = [
        createBankedUnit('unit1', 1000, new Date('2023-01-01')),
      ];

      const input = {
        deficit: 0.01,
        availableBankedUnits: bankedUnits,
        applicationDate: baseDate,
      };

      const result = applyBanked(input);

      expect(result.appliedUnits).toBe(0.01);
      expect(result.remainingDeficit).toBe(0);
      expect(result.unusedBankedUnits[0].units).toBeCloseTo(999.99, 2);
    });
  });
});

