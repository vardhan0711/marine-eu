import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.routes.createMany({
    data: [
      { 
        vesselId: "V001", 
        name: "Mumbai–Goa", 
        totalDistanceNauticalMiles: 318.57, // ~590 km converted
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-05"),
        status: "COMPLETED",
        segments: { origin: "Mumbai", destination: "Goa", distanceKm: 590 }
      },
      { 
        vesselId: "V002", 
        name: "Kolkata–Chennai", 
        totalDistanceNauticalMiles: 901.3, // ~1670 km converted
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-02-10"),
        status: "COMPLETED",
        segments: { origin: "Kolkata", destination: "Chennai", distanceKm: 1670 }
      },
      { 
        vesselId: "V003", 
        name: "Delhi–Jaipur", 
        totalDistanceNauticalMiles: 151.19, // ~280 km converted
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-03-02"),
        status: "COMPLETED",
        segments: { origin: "Delhi", destination: "Jaipur", distanceKm: 280 }
      },
    ],
    skipDuplicates: true,
  });
  console.log("Seeded routes");
}

main().finally(() => prisma.$disconnect());
