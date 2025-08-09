import express, { Express, Request, Response } from "express";

const app: Express = express();

app.get("/", (request: Request, response: Response) => {
  response.send("App working");
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
   console.log(`App running at http://localhost:${PORT}`);
});
