import express, { Express, Request, Response } from "express";
import { PORT } from "./secrets";

const app: Express = express();

app.get("/", (request: Request, response: Response) => {
  response.send("App working");
});

app.listen(PORT, () => {
   console.log(`App running at http://localhost:${PORT}`);
});
