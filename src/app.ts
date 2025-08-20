import express, { Express, NextFunction, Request } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { rateLimit } from "express-rate-limit";

import { NODE_ENV } from "./config/secrets";
import rootRouter from "./routes";
import { errorMiddleware } from "./middlewares/errors";
import { requestLogger } from "./middlewares/logger";
import { checkHealth } from "./controllers/health";

import path from "path";
import fs from "fs";

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err as any, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || "";
    cb(null, `${uniqueSuffix}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ storage: storage });

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: NODE_ENV === "production" ? ["https://prod-domain.com"] : true,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Request logging (in development)
if (NODE_ENV === "development") {
  app.use(requestLogger);
}

app.get("/", (_req, res) => {
  res.send("Server Running...");
});

// Health check endpoint
app.get("/health", checkHealth);

// API routes
app.use("/api", rootRouter);

app.post(
  "/api/upload",
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "FAIL", message: "No file uploaded" });
    }
    res.status(200).json({
      status: "OK",
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    });
  }
);

// Global error handler
app.use(errorMiddleware);

export default app;
