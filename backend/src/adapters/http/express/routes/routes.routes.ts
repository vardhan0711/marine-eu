import { Router, Request, Response } from 'express';
import { RouteRepository } from '../../../../core/ports/RouteRepository';
import { validate } from '../middleware/validate';
import {
  createRouteSchema,
  updateRouteSchema,
  routeParamsSchema,
  routeQuerySchema,
} from '../validation/routes.schema';

export function createRoutesRouter(routeRepository: RouteRepository): Router {
  const router = Router();

  // GET /routes - Get all routes or filter by ports
  router.get(
    '/',
    validate(routeQuerySchema),
    async (req: Request, res: Response) => {
      try {
        const { originPort, destinationPort } = req.query;

        let routes;
        if (originPort && destinationPort) {
          routes = await routeRepository.findByPorts(
            originPort as string,
            destinationPort as string
          );
        } else {
          routes = await routeRepository.findAll();
        }

        res.json({ routes });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch routes', message: (error as Error).message });
      }
    }
  );

  // GET /routes/:id - Get route by ID
  router.get(
    '/:id',
    validate(routeParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const route = await routeRepository.findById(id);

        if (!route) {
          return res.status(404).json({ error: 'Route not found' });
        }

        res.json({ route });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch route', message: (error as Error).message });
      }
    }
  );

  // POST /routes - Create new route
  router.post(
    '/',
    validate(createRouteSchema),
    async (req: Request, res: Response) => {
      try {
        const route = await routeRepository.create(req.body);
        res.status(201).json({ route });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create route', message: (error as Error).message });
      }
    }
  );

  // PUT /routes/:id - Update route
  router.put(
    '/:id',
    validate(updateRouteSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const exists = await routeRepository.exists(id);

        if (!exists) {
          return res.status(404).json({ error: 'Route not found' });
        }

        const route = await routeRepository.update(id, req.body);
        res.json({ route });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update route', message: (error as Error).message });
      }
    }
  );

  // DELETE /routes/:id - Delete route
  router.delete(
    '/:id',
    validate(routeParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const exists = await routeRepository.exists(id);

        if (!exists) {
          return res.status(404).json({ error: 'Route not found' });
        }

        await routeRepository.delete(id);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete route', message: (error as Error).message });
      }
    }
  );

  return router;
}

