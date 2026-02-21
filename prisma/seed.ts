import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.company.createMany({
    data: [
      { name: "Tata Consultancy Services", shortName: "TCS", type: "IT Services", baseCTC: 3.6, tier: "service", visitsTier2: true, rounds: 4 },
      { name: "Infosys", shortName: "INF", type: "IT Services", baseCTC: 6.5, tier: "service", visitsTier2: true, rounds: 3 },
      { name: "Amazon", shortName: "AMZ", type: "Product", baseCTC: 18, tier: "product", visitsTier2: false, rounds: 4 },
      { name: "Google India", shortName: "G", type: "Product", baseCTC: 28, tier: "tier1", visitsTier2: false, rounds: 5 },
      { name: "Wipro", shortName: "WIP", type: "IT Services", baseCTC: 3.5, tier: "service", visitsTier2: true, rounds: 3 },
      { name: "Microsoft", shortName: "MS", type: "Product", baseCTC: 22, tier: "tier1", visitsTier2: false, rounds: 4 },
      { name: "Cognizant", shortName: "CTS", type: "IT Services", baseCTC: 4.5, tier: "service", visitsTier2: true, rounds: 3 },
      { name: "HCL Technologies", shortName: "HCL", type: "IT Services", baseCTC: 3.8, tier: "service", visitsTier2: true, rounds: 3 },
      { name: "Accenture", shortName: "ACC", type: "IT Services", baseCTC: 4.5, tier: "service", visitsTier2: true, rounds: 3 },
      { name: "Flipkart", shortName: "FK", type: "E-commerce", baseCTC: 20, tier: "product", visitsTier2: false, rounds: 4 },
      // Add these to the createMany array
      { name: "Atlassian", shortName: "ATL", type: "Product", baseCTC: 24, tier: "tier1", visitsTier2: false, rounds: 4 },
      { name: "Uber", shortName: "UBR", type: "Product", baseCTC: 22, tier: "tier1", visitsTier2: false, rounds: 4 },
      { name: "Visa", shortName: "VISA", type: "Fintech", baseCTC: 18, tier: "product", visitsTier2: false, rounds: 3 },
      { name: "JP Morgan", shortName: "JPM", type: "BFSI", baseCTC: 16, tier: "product", visitsTier2: false, rounds: 4 },
      { name: "Natwest Group", shortName: "NWG", type: "BFSI", baseCTC: 14, tier: "product", visitsTier2: false, rounds: 3 },
      { name: "Goldman Sachs", shortName: "GS", type: "BFSI", baseCTC: 20, tier: "tier1", visitsTier2: false, rounds: 5 },
      { name: "Deutsche Bank", shortName: "DB", type: "BFSI", baseCTC: 14, tier: "product", visitsTier2: false, rounds: 3 },
      { name: "American Express", shortName: "AMEX", type: "Fintech", baseCTC: 15, tier: "product", visitsTier2: false, rounds: 3 },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Seeded 18 companies");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());