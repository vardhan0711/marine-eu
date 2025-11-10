import { Router, Request, Response } from 'express';
import { PoolRepository } from '../../../../core/ports/PoolRepository';
import { createPool } from '../../../../application/use-cases';
import { v4 as uuidv4 } from 'uuid';
import { validate } from '../middleware/validate';
import {
  createPoolSchema,
  updatePoolSchema,
  poolParamsSchema,
  poolQuerySchema,
  addPoolMemberSchema,
  removePoolMemberSchema,
  allocateUnitsSchema,
} from '../validation/pools.schema';

export function createPoolsRouter(poolRepository: PoolRepository): Router {
  const router = Router();

  // GET /pools - Get all pools or filter
  router.get(
    '/',
    validate(poolQuerySchema),
    async (req: Request, res: Response) => {
      try {
        const { status, poolType, shipId } = req.query;

        let pools;
        if (shipId) {
          pools = await poolRepository.findByShipId(shipId as string);
        } else if (status) {
          pools = await poolRepository.findByStatus(status as any);
        } else if (status === 'ACTIVE' || !status) {
          // Default to active pools if no status specified
          pools = await poolRepository.findActivePools();
        } else {
          pools = await poolRepository.findAll();
        }

        res.json({ pools });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pools', message: (error as Error).message });
      }
    }
  );

  // GET /pools/:id - Get pool by ID
  router.get(
    '/:id',
    validate(poolParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const pool = await poolRepository.findById(id);

        if (!pool) {
          return res.status(404).json({ error: 'Pool not found' });
        }

        res.json({ pool });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pool', message: (error as Error).message });
      }
    }
  );

  // POST /pools - Create new pool
  router.post(
    '/',
    validate(createPoolSchema),
    async (req: Request, res: Response) => {
      try {
        const { name, description, poolType, startDate, endDate, totalComplianceUnits, allocatedComplianceUnits } = req.body;

        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

        // Validate using use-case (will throw if invalid)
        createPool({
          id: uuidv4(),
          name,
          description,
          poolType,
          startDate: start,
          endDate: end,
          totalComplianceUnits,
          allocatedComplianceUnits,
          createdAt: new Date(),
        });

        // Persist using repository
        const pool = await poolRepository.create({
          name,
          description,
          poolType,
          startDate: start,
          endDate: end,
          totalComplianceUnits,
          allocatedComplianceUnits,
        });

        res.status(201).json({ pool });
      } catch (error) {
        const message = (error as Error).message;
        if (message.includes('Start date') || message.includes('Pool name')) {
          return res.status(400).json({ error: message });
        }
        res.status(500).json({ error: 'Failed to create pool', message });
      }
    }
  );

  // PUT /pools/:id - Update pool
  router.put(
    '/:id',
    validate(updatePoolSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const exists = await poolRepository.exists(id);

        if (!exists) {
          return res.status(404).json({ error: 'Pool not found' });
        }

        const updateData: any = { ...req.body };
        if (updateData.startDate && typeof updateData.startDate === 'string') {
          updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate && typeof updateData.endDate === 'string') {
          updateData.endDate = new Date(updateData.endDate);
        }

        const pool = await poolRepository.update(id, updateData);
        res.json({ pool });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update pool', message: (error as Error).message });
      }
    }
  );

  // DELETE /pools/:id - Delete pool
  router.delete(
    '/:id',
    validate(poolParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const exists = await poolRepository.exists(id);

        if (!exists) {
          return res.status(404).json({ error: 'Pool not found' });
        }

        await poolRepository.delete(id);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete pool', message: (error as Error).message });
      }
    }
  );

  // GET /pools/:id/members - Get pool members
  router.get(
    '/:id/members',
    validate(poolParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const exists = await poolRepository.exists(id);

        if (!exists) {
          return res.status(404).json({ error: 'Pool not found' });
        }

        const members = await poolRepository.getMembers(id);
        res.json({ members });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pool members', message: (error as Error).message });
      }
    }
  );

  // POST /pools/:id/members - Add member to pool
  router.post(
    '/:id/members',
    validate(addPoolMemberSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { shipId, units } = req.body;

        const exists = await poolRepository.exists(id);
        if (!exists) {
          return res.status(404).json({ error: 'Pool not found' });
        }

        const member = await poolRepository.addMember(id, shipId, units);
        res.status(201).json({ member });
      } catch (error) {
        res.status(500).json({ error: 'Failed to add pool member', message: (error as Error).message });
      }
    }
  );

  // DELETE /pools/:id/members/:shipId - Remove member from pool
  router.delete(
    '/:id/members/:shipId',
    validate(removePoolMemberSchema),
    async (req: Request, res: Response) => {
      try {
        const { id, shipId } = req.params;

        const exists = await poolRepository.exists(id);
        if (!exists) {
          return res.status(404).json({ error: 'Pool not found' });
        }

        await poolRepository.removeMember(id, shipId);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to remove pool member', message: (error as Error).message });
      }
    }
  );

  // POST /pools/:id/allocate - Allocate units to pool member
  router.post(
    '/:id/allocate',
    validate(allocateUnitsSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { shipId, units } = req.body;

        const exists = await poolRepository.exists(id);
        if (!exists) {
          return res.status(404).json({ error: 'Pool not found' });
        }

        await poolRepository.allocateUnits({
          poolId: id,
          shipId,
          units,
          allocationDate: new Date(),
        });

        res.status(200).json({ message: 'Units allocated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to allocate units', message: (error as Error).message });
      }
    }
  );

  return router;
}

