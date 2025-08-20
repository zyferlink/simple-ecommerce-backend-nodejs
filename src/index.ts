import { NODE_ENV, PORT } from "./config/secrets";
import { prismaCilent } from "./lib/prisma";
import { logSeparator } from "./lib/log-separator";
import app from "./app";

export const SIGNALS = {
  INTERRUPT: "SIGINT",
  TERMINATE: "SIGTERM",
} as const;

async function startServer() {
  try {
    logSeparator("SERVER START");

    await prismaCilent.$connect();
    console.log(`☑ Database connected | ☑  Working environment : ${NODE_ENV} \n`);
    

    const server = app.listen(PORT, () => {
      console.log(`Local: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      logSeparator("SERVER RUNNING");
    });

    const shutdownServer = async (signal: string) => {
      console.log(`${signal} received. Shutting down server...`);
      logSeparator("SERVER STOPPED");
      server.close(async () => {
        await prismaCilent.$disconnect();
        process.exit(0);
      });
    };

    process.on(SIGNALS.INTERRUPT, () => shutdownServer(SIGNALS.INTERRUPT));
    process.on(SIGNALS.TERMINATE, () => shutdownServer(SIGNALS.TERMINATE));

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
