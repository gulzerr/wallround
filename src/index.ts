import app from "./app";
import prisma from "./utils/db";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  try {
    // Connect to PostgreSQL using Prisma
    await prisma.$connect();
    console.log("Successfully connected to PostgreSQL database");

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
