import express, { Express, Request, Response } from "express";
import { PORT } from "./secrets";
import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors";
import { SignUpSchema } from "./schemas/users";

const app: Express = express();

app.use(express.json());

app.use("/api", rootRouter);

app.use(errorMiddleware);

export const prismaCilent = new PrismaClient({ log: ["query"] }).$extends({
  result: {
    address: {
      formattedAddress: {
        needs: {
          lineOne: true,
          lineTwo: true,
          city: true,
          country: true,
          zipcode: true,
        },
        compute: (address) => {
          if (address.lineTwo)
            return `${address.lineOne}, ${address.lineTwo}, ${address.city}, ${address.country}-${address.zipcode}`;
          else
            return `${address.lineOne}, ${address.city}, ${address.country}-${address.zipcode}`;
        },
      },
    },
  },
});

app.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}/api`);
});
