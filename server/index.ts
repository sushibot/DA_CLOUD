import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import tracksRouter from "./routes/tracks.js";
import albumsRouter from "./routes/albums.js";
import healthRouter from "./routes/health.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

// General limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit on presigned URL generation: 30 per 15 minutes per IP
const urlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const DEV_ORIGINS = [
  "http://localhost:5173",
  /^https:\/\/.*\.ngrok-free\.app$/,
  /^https:\/\/.*\.ngrok\.io$/,
];

const PROD_ORIGINS = process.env.ALLOWED_ORIGIN
  ? [process.env.ALLOWED_ORIGIN]
  : [];

const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "production" ? PROD_ORIGINS : DEV_ORIGINS;

app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use("/api/tracks/url", urlLimiter);
app.use("/api/tracks", generalLimiter);
app.use("/api/albums", generalLimiter);
app.use("/api/tracks", tracksRouter);
app.use("/api/albums", albumsRouter);
app.use("/api/health", healthRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
