import express, { Express} from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { rateLimit } from "express-rate-limit";

import { NODE_ENV } from "./config/secrets";
import rootRouter from "./routes";
import { errorMiddleware } from "./middlewares/errors";
import { requestLogger } from "./middlewares/logger";
import { checkHealth } from "./controllers/health";

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: NODE_ENV === 'production' ? ['https://prod-domain.com'] : true,
  credentials: true
}));

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

// Health check endpoint
app.get("/health", checkHealth);

// API routes
app.use("/api", rootRouter);


// Global error handler
app.use(errorMiddleware);

export default app;
