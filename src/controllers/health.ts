import { NODE_ENV } from "../config/secrets";
import { Request, Response } from "express";
import os from "os";

export const checkHealth = async (_request:any, response: Response) => {
  response.status(200).json({
    status: "OK",
    uptime: formatUptime(process.uptime()),
    environment: NODE_ENV,
    nodeVersion: process.version,
    cpuCores: os.cpus().length,
    memoryUsage: {
      totalMemory: formatDataValue(process.memoryUsage().rss),
      allocatedHeap: formatDataValue(process.memoryUsage().heapTotal),
      usedHeap: formatDataValue(process.memoryUsage().heapUsed),
    },
    serverTime: formatDateTime(new Date()),
    timestamp: new Date().toISOString(),
  });
};

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function formatDateTime(date: Date) {
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDataValue(value: number) {
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}
