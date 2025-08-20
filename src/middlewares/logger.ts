import { Request, Response, NextFunction } from "express";

export function requestLogger(req:Request, res:Response, next:NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = `\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    console.log(log);
  });

  next();
}