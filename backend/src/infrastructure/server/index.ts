import { createApp } from "../../adapters/http/express/app";
import { PrismaRouteRepository } from "../../adapters/outbound/postgres/RouteRepository";
import { PrismaComplianceRepository } from "../../adapters/outbound/postgres/ComplianceRepository";
import { PrismaPoolRepository } from "../../adapters/outbound/postgres/PoolRepository";

// Create repositories
const routeRepository = new PrismaRouteRepository();
const complianceRepository = new PrismaComplianceRepository();
const poolRepository = new PrismaPoolRepository();

// Create Express app with all routes
const app = createApp(routeRepository, complianceRepository, poolRepository);

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`API on :${PORT}`));
