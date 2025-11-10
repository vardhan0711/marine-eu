import { Router, Request, Response } from 'express';
import { ComplianceRepository } from '../../../../core/ports/ComplianceRepository';
import { computeCB, computeComparison } from '../../../../application/use-cases';
import { validate } from '../middleware/validate';
import {
  createComplianceSchema,
  updateComplianceSchema,
  complianceParamsSchema,
  complianceQuerySchema,
  computeCBSchema,
  computeComparisonSchema,
} from '../validation/compliance.schema';

export function createComplianceRouter(
  complianceRepository: ComplianceRepository
): Router {
  const router = Router();

  // GET /compliance - Get all compliance records or filter
  router.get(
    '/',
    validate(complianceQuerySchema),
    async (req: Request, res: Response) => {
      try {
        const { shipId, routeId, reportingPeriod, status } = req.query;

        let compliances;
        if (shipId) {
          compliances = await complianceRepository.findByShipId(shipId as string);
        } else if (routeId) {
          compliances = await complianceRepository.findByRouteId(routeId as string);
        } else if (reportingPeriod) {
          compliances = await complianceRepository.findByReportingPeriod(reportingPeriod as string);
        } else if (status) {
          compliances = await complianceRepository.findByStatus(status as any);
        } else {
          compliances = await complianceRepository.findAll();
        }

        res.json({ compliances });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch compliance records', message: (error as Error).message });
      }
    }
  );

  // GET /compliance/:id - Get compliance by ID
  router.get(
    '/:id',
    validate(complianceParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const compliance = await complianceRepository.findById(id);

        if (!compliance) {
          return res.status(404).json({ error: 'Compliance record not found' });
        }

        res.json({ compliance });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch compliance record', message: (error as Error).message });
      }
    }
  );

  // POST /compliance - Create new compliance record
  router.post(
    '/',
    validate(createComplianceSchema),
    async (req: Request, res: Response) => {
      try {
        const compliance = await complianceRepository.create(req.body);
        res.status(201).json({ compliance });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create compliance record', message: (error as Error).message });
      }
    }
  );

  // PUT /compliance/:id - Update compliance record
  router.put(
    '/:id',
    validate(updateComplianceSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const exists = await complianceRepository.exists(id);

        if (!exists) {
          return res.status(404).json({ error: 'Compliance record not found' });
        }

        const compliance = await complianceRepository.update(id, req.body);
        res.json({ compliance });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update compliance record', message: (error as Error).message });
      }
    }
  );

  // DELETE /compliance/all - Delete all compliance records
  router.delete(
    '/all',
    async (req: Request, res: Response) => {
      try {
        await complianceRepository.deleteAll();
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete all compliance records', message: (error as Error).message });
      }
    }
  );

  // DELETE /compliance/status/:status - Delete compliance records by status
  router.delete(
    '/status/:status',
    async (req: Request, res: Response) => {
      try {
        const { status } = req.params;
        const validStatuses = ['COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'UNDER_REVIEW'];
        
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status', message: `Status must be one of: ${validStatuses.join(', ')}` });
        }

        await complianceRepository.deleteByStatus(status as any);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete compliance records by status', message: (error as Error).message });
      }
    }
  );

  // DELETE /compliance/:id - Delete compliance record
  router.delete(
    '/:id',
    validate(complianceParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const exists = await complianceRepository.exists(id);

        if (!exists) {
          return res.status(404).json({ error: 'Compliance record not found' });
        }

        await complianceRepository.delete(id);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete compliance record', message: (error as Error).message });
      }
    }
  );

  // POST /compliance/compute-cb - Compute Compliance Balance
  router.post(
    '/compute-cb',
    validate(computeCBSchema),
    async (req: Request, res: Response) => {
      try {
        const { actualGhgIntensity, fuelConsumption } = req.body;
        const result = computeCB(actualGhgIntensity, fuelConsumption);
        res.json({ result });
      } catch (error) {
        res.status(500).json({ error: 'Failed to compute CB', message: (error as Error).message });
      }
    }
  );

  // POST /compliance/compute-comparison - Compute comparison
  router.post(
    '/compute-comparison',
    validate(computeComparisonSchema),
    async (req: Request, res: Response) => {
      try {
        const { actualGhgIntensity } = req.body;
        const result = computeComparison(actualGhgIntensity);
        res.json({ result });
      } catch (error) {
        res.status(500).json({ error: 'Failed to compute comparison', message: (error as Error).message });
      }
    }
  );

  // GET /compliance/:id/metrics - Get metrics for a compliance record
  router.get(
    '/:id/metrics',
    validate(complianceParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const compliance = await complianceRepository.findById(id);

        if (!compliance) {
          return res.status(404).json({ error: 'Compliance record not found' });
        }

        const metrics = await complianceRepository.getMetricsByShipId(compliance.shipId);
        res.json({ metrics });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metrics', message: (error as Error).message });
      }
    }
  );

  return router;
}

