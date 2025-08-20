import { PrismaClient } from "@prisma/client";

export const prismaCilent = new PrismaClient({ 
  log: ["query"] 
}).$extends({
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
          const baseParts = [address.lineOne, address.city, `${address.country}-${address.zipcode}`];
          
          if (address.lineTwo) {
            baseParts.splice(1, 0, address.lineTwo);
          }
          
          return baseParts.join(", ");
        },
      },
    },
  },
});

process.on('beforeExit', async () => {
  await prismaCilent.$disconnect();
});