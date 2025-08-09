import express, { Express, Request, Response } from "express";
import { PORT } from "./secrets";
import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";

const app: Express = express();

app.use(express.json());

app.use("/api", rootRouter);

export const prismaCilent = new PrismaClient({ log: ["query"] });

app.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}/api`);
});
