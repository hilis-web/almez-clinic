import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./lib/prisma";
import consultationsRoutes from "./modules/consultations/consultations.routes";
import authRoutes from "./modules/auth/auth.routes";
import sectionsRoutes from "./modules/sections/sections.routes";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:3001"],
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   }),
// );
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  ...(process.env.FRONTEND_URL ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/consultations", consultationsRoutes);
app.use("/api/sections", sectionsRoutes);

app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "almez-clinic-api",
  });
});

app.listen(PORT, () => {
  console.log(`Almez Clinic API running at http://localhost:${PORT}`);
});
