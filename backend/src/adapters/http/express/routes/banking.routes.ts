import { Router, Request, Response } from 'express';
import { bankSurplus, applyBanked } from '../../../../application/use-cases';
import { prisma } from '../../../outbound/postgres/prisma-client';
import { validate } from '../middleware/validate';
import { bankSurplusSchema, applyBankedSchema, bankingQuerySchema } from '../validation/banking.schema';

export function createBankingRouter(): Router {
  const router = Router();

  // POST /banking/bank-surplus - Bank surplus compliance units
  router.post(
    '/bank-surplus',
    validate(bankSurplusSchema),
    async (req: Request, res: Response) => {
      try {
        const { surplusUnits, bankingDate, maxBankingCapacity, bankingValidityYears } = req.body;

        const date = typeof bankingDate === 'string' ? new Date(bankingDate) : bankingDate;

        const result = bankSurplus({
          surplusUnits,
          bankingDate: date,
          maxBankingCapacity,
          bankingValidityYears,
        });

        // Save to database if shipId is provided
        const shipId = req.body.shipId || 'default-ship'; // Default if not provided
        const reportingPeriod = req.body.reportingPeriod || new Date().getFullYear().toString();
        
        try {
          await prisma.bankEntry.create({
            data: {
              vesselId: shipId,
              reportingPeriod: reportingPeriod,
              bankedAmount: result.bankedUnits,
              appliedAmount: 0,
              remainingAmount: result.bankedUnits,
            },
          });
        } catch (dbError) {
          // Log but don't fail the request if DB save fails
          console.error('Failed to save bank entry to database:', dbError);
        }

        res.status(201).json({ result });
      } catch (error) {
        res.status(500).json({ error: 'Failed to bank surplus', message: (error as Error).message });
      }
    }
  );

  // POST /banking/apply-banked - Apply banked units to cover deficit
  router.post(
    '/apply-banked',
    validate(applyBankedSchema),
    async (req: Request, res: Response) => {
      try {
        const { deficit, applicationDate, availableBankedUnits } = req.body;

        const appDate = typeof applicationDate === 'string' ? new Date(applicationDate) : applicationDate;

        const bankedUnits = availableBankedUnits.map((unit: any) => ({
          id: unit.id,
          units: unit.units,
          bankedAt: typeof unit.bankedAt === 'string' ? new Date(unit.bankedAt) : unit.bankedAt,
          expiryDate: typeof unit.expiryDate === 'string' ? new Date(unit.expiryDate) : unit.expiryDate,
        }));

        const result = applyBanked({
          deficit,
          applicationDate: appDate,
          availableBankedUnits: bankedUnits,
        });

        res.json({ result });
      } catch (error) {
        res.status(500).json({ error: 'Failed to apply banked units', message: (error as Error).message });
      }
    }
  );

  // GET /banking/entries - Get bank entries (optional - if you want to query from DB)
  router.get(
    '/entries',
    validate(bankingQuerySchema),
    async (req: Request, res: Response) => {
      try {
        const { shipId, expired } = req.query;

        const where: any = {};
        if (shipId) {
          where.vesselId = shipId;
        }
        // Note: The Prisma schema doesn't have expiryDate, so we can't filter by expired
        // If needed, this would require schema changes or calculating expiry from reportingPeriod

        const entries = await prisma.bankEntry.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });

        // Map database fields to frontend-expected format
        const mappedEntries = entries.map((entry) => {
          const bankedDate = new Date(entry.createdAt);
          const expiryDate = new Date(bankedDate);
          expiryDate.setFullYear(expiryDate.getFullYear() + 2); // Default 2 years validity
          
          return {
            id: entry.id,
            shipId: entry.vesselId,
            units: entry.remainingAmount, // Remaining units (bankedAmount - appliedAmount)
            bankedAt: entry.createdAt.toISOString(),
            expiryDate: expiryDate.toISOString(),
            createdAt: entry.createdAt.toISOString(),
            updatedAt: entry.updatedAt.toISOString(),
          };
        });

        res.json({ entries: mappedEntries });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bank entries', message: (error as Error).message });
      }
    }
  );

  // DELETE /banking/entries/:id - Delete a bank entry
  router.delete(
    '/entries/:id',
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        const entry = await prisma.bankEntry.findUnique({
          where: { id },
        });

        if (!entry) {
          return res.status(404).json({ error: 'Bank entry not found' });
        }

        await prisma.bankEntry.delete({
          where: { id },
        });

        res.status(200).json({ message: 'Bank entry deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete bank entry', message: (error as Error).message });
      }
    }
  );

  return router;
}

