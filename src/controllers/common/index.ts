import { Router } from "express";
import bodyParser from "body-parser";
import prisma from "../../utils/db";

const router = Router();
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

router.get("/test-db", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ message: "Database connection successful" });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

export default router;
