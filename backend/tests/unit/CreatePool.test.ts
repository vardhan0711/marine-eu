import { describe, it, expect } from 'vitest';
import { createPool } from '../../src/application/use-cases/CreatePool';
import { PoolType, PoolStatus } from '../../src/core/domain/Pool';

describe('CreatePool', () => {
  const baseDate = new Date('2024-01-15T10:00:00Z');
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');

  describe('successful pool creation', () => {
    it('should create a pool with all required fields', () => {
      const input = {
        id: 'pool-1',
        name: 'Test Pool',
        poolType: PoolType.VOLUNTARY,
        startDate,
        endDate,
        createdAt: baseDate,
      };

      const result = createPool(input);

      expect(result.pool.id).toBe('pool-1');
      expect(result.pool.name).toBe('Test Pool');
      expect(result.pool.poolType).toBe(PoolType.VOLUNTARY);
      expect(result.pool.status).toBe(PoolStatus.PENDING);
      expect(result.pool.startDate).toBe(startDate);
      expect(result.pool.endDate).toBe(endDate);
      expect(result.pool.totalComplianceUnits).toBe(0);
      expect(result.pool.allocatedComplianceUnits).toBe(0);
      expect(result.pool.createdAt).toBe(baseDate);
      expect(result.pool.updatedAt).toBe(baseDate);
    });

    it('should create pool with description', () => {
      const input = {
        id: 'pool-2',
        name: 'Pool with Description',
        description: 'This is a test pool',
        poolType: PoolType.COMPANY,
        startDate,
        endDate,
        createdAt: baseDate,
      };

      const result = createPool(input);

      expect(result.pool.description).toBe('This is a test pool');
      expect(result.pool.poolType).toBe(PoolType.COMPANY);
    });

    it('should create pool for all pool types', () => {
      const poolTypes = [
        PoolType.VOLUNTARY,
        PoolType.MANDATORY,
        PoolType.COMPANY,
        PoolType.FLEET,
      ];

      poolTypes.forEach((poolType) => {
        const input = {
          id: `pool-${poolType}`,
          name: `${poolType} Pool`,
          poolType,
          startDate,
          endDate,
          createdAt: baseDate,
        };

        const result = createPool(input);

        expect(result.pool.poolType).toBe(poolType);
      });
    });

    it('should trim whitespace from name and description', () => {
      const input = {
        id: 'pool-3',
        name: '  Trimmed Pool Name  ',
        description: '  Trimmed description  ',
        poolType: PoolType.VOLUNTARY,
        startDate,
        endDate,
        createdAt: baseDate,
      };

      const result = createPool(input);

      expect(result.pool.name).toBe('Trimmed Pool Name');
      expect(result.pool.description).toBe('Trimmed description');
    });
  });

  describe('validation errors (mis-pools)', () => {
    it('should throw error when start date equals end date', () => {
      const input = {
        id: 'pool-4',
        name: 'Invalid Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: baseDate,
        endDate: baseDate,
        createdAt: baseDate,
      };

      expect(() => createPool(input)).toThrow('Start date must be before end date');
    });

    it('should throw error when start date is after end date', () => {
      const input = {
        id: 'pool-5',
        name: 'Invalid Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: endDate,
        endDate: startDate,
        createdAt: baseDate,
      };

      expect(() => createPool(input)).toThrow('Start date must be before end date');
    });

    it('should throw error when name is empty', () => {
      const input = {
        id: 'pool-6',
        name: '',
        poolType: PoolType.VOLUNTARY,
        startDate,
        endDate,
        createdAt: baseDate,
      };

      expect(() => createPool(input)).toThrow('Pool name cannot be empty');
    });

    it('should throw error when name is only whitespace', () => {
      const input = {
        id: 'pool-7',
        name: '   ',
        poolType: PoolType.VOLUNTARY,
        startDate,
        endDate,
        createdAt: baseDate,
      };

      expect(() => createPool(input)).toThrow('Pool name cannot be empty');
    });

    it('should throw error when start date is in the past relative to end date', () => {
      const pastStart = new Date('2023-01-01');
      const futureEnd = new Date('2024-12-31');
      const input = {
        id: 'pool-mis-1',
        name: 'Misconfigured Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: futureEnd,
        endDate: pastStart,
        createdAt: baseDate,
      };

      expect(() => createPool(input)).toThrow('Start date must be before end date');
    });

    it('should throw error when dates are reversed (mis-pool scenario)', () => {
      const input = {
        id: 'pool-mis-2',
        name: 'Reversed Dates Pool',
        poolType: PoolType.MANDATORY,
        startDate: new Date('2025-12-31'),
        endDate: new Date('2024-01-01'),
        createdAt: baseDate,
      };

      expect(() => createPool(input)).toThrow('Start date must be before end date');
    });

    it('should throw error when name contains only newlines and tabs', () => {
      const input = {
        id: 'pool-mis-3',
        name: '\n\t\n',
        poolType: PoolType.VOLUNTARY,
        startDate,
        endDate,
        createdAt: baseDate,
      };

      expect(() => createPool(input)).toThrow('Pool name cannot be empty');
    });

    it('should throw error when name is null-like (empty after trim)', () => {
      const input = {
        id: 'pool-mis-4',
        name: '\r\n  \t  \r\n',
        poolType: PoolType.COMPANY,
        startDate,
        endDate,
        createdAt: baseDate,
      };

      expect(() => createPool(input)).toThrow('Pool name cannot be empty');
    });
  });

  describe('edge cases', () => {
    it('should handle very long pool name', () => {
      const longName = 'A'.repeat(1000);
      const input = {
        id: 'pool-8',
        name: longName,
        poolType: PoolType.VOLUNTARY,
        startDate,
        endDate,
        createdAt: baseDate,
      };

      const result = createPool(input);

      expect(result.pool.name).toBe(longName);
    });

    it('should handle pool with very short date range', () => {
      const shortStart = new Date('2024-01-01');
      const shortEnd = new Date('2024-01-02');

      const input = {
        id: 'pool-9',
        name: 'Short Range Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: shortStart,
        endDate: shortEnd,
        createdAt: baseDate,
      };

      const result = createPool(input);

      expect(result.pool.startDate).toBe(shortStart);
      expect(result.pool.endDate).toBe(shortEnd);
    });

    it('should handle pool with long date range', () => {
      const longStart = new Date('2024-01-01');
      const longEnd = new Date('2030-12-31');

      const input = {
        id: 'pool-10',
        name: 'Long Range Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: longStart,
        endDate: longEnd,
        createdAt: baseDate,
      };

      const result = createPool(input);

      expect(result.pool.startDate).toBe(longStart);
      expect(result.pool.endDate).toBe(longEnd);
    });

    it('should handle undefined description', () => {
      const input = {
        id: 'pool-11',
        name: 'Pool Without Description',
        poolType: PoolType.VOLUNTARY,
        startDate,
        endDate,
        createdAt: baseDate,
      };

      const result = createPool(input);

      expect(result.pool.description).toBeUndefined();
    });

    it('should initialize with zero compliance units', () => {
      const input = {
        id: 'pool-12',
        name: 'New Pool',
        poolType: PoolType.VOLUNTARY,
        startDate,
        endDate,
        createdAt: baseDate,
      };

      const result = createPool(input);

      expect(result.pool.totalComplianceUnits).toBe(0);
      expect(result.pool.allocatedComplianceUnits).toBe(0);
    });

    it('should handle pool with start date in the past', () => {
      const pastStart = new Date('2020-01-01');
      const pastEnd = new Date('2023-12-31');

      const input = {
        id: 'pool-13',
        name: 'Historical Pool',
        poolType: PoolType.VOLUNTARY,
        startDate: pastStart,
        endDate: pastEnd,
        createdAt: baseDate,
      };

      const result = createPool(input);

      expect(result.pool.startDate).toBe(pastStart);
      expect(result.pool.endDate).toBe(pastEnd);
    });

    it('should handle pool with overlapping date ranges (valid creation)', () => {
      const input1 = {
        id: 'pool-14',
        name: 'Pool A',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        createdAt: baseDate,
      };

      const input2 = {
        id: 'pool-15',
        name: 'Pool B',
        poolType: PoolType.VOLUNTARY,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-12-31'),
        createdAt: baseDate,
      };

      // Both should be valid (overlap is allowed, validation happens elsewhere)
      const result1 = createPool(input1);
      const result2 = createPool(input2);

      expect(result1.pool.id).toBe('pool-14');
      expect(result2.pool.id).toBe('pool-15');
    });

    it('should handle pool with same start and end times (different dates)', () => {
      const sameDayStart = new Date('2024-06-15T00:00:00Z');
      const sameDayEnd = new Date('2024-06-16T00:00:00Z');

      const input = {
        id: 'pool-16',
        name: 'One Day Pool',
        poolType: PoolType.FLEET,
        startDate: sameDayStart,
        endDate: sameDayEnd,
        createdAt: baseDate,
      };

      const result = createPool(input);

      expect(result.pool.startDate).toBe(sameDayStart);
      expect(result.pool.endDate).toBe(sameDayEnd);
    });
  });
});

