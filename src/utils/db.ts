import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  //   log: ["query", "info", "warn", "error"],
});

// // Listen for query events and log them (only in development)
// if (process.env.NODE_ENV === "development") {
//   prisma.$on("query", (e) => {
//     console.log("📋 Prisma Query:", e.query);
//     console.log("⏱️  Duration:", e.duration + "ms");
//     console.log("📊 Parameters:", e.params);
//     console.log("---");
//   });
// }

export default prisma;
