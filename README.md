## Stage 2 – Prisma & Environment Variables Setup

## 1️⃣ Install Prisma & Client

```bash
npm install prisma @prisma/client
```

## 2️⃣ Initialize Prisma

```bash
npx prisma init
```

* This will creates a `prisma/` folder with `schema.prisma`.
* Generates `.env` file (already `.gitignore`d).

---

## 3️⃣ Configure Database

* In `.env` → set `DATABASE_URL` for **MySQL**:

  ```
  DATABASE_URL="mysql://root:password@localhost:3306/ecommerce_db"
  ```
* In `prisma/schema.prisma`:

  ```prisma
  datasource db {
    provider = "mysql"
    url      = env("DATABASE_URL")
  }
  ```
* Update database name (`ecommerce_db`) as needed.

---

## 4️⃣ Create First Model

Example `User` model:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

---

## 5️⃣ Run Migration

```bash
npx prisma migrate dev --name create_users_table
```

* Verifies DB connection.
* Creates the table in MySQL.

---

## 6️⃣ Set Up Environment Variables for Node.js

1. Install `dotenv`:

   ```bash
   npm install dotenv
   ```
2. Create `src/secrets.ts`:

   ```ts
   import dotenv from "dotenv";
   dotenv.config({ path: ".env" });

   export const PORT = process.env.PORT || 3000;
   export const DATABASE_URL = process.env.DATABASE_URL || "";
   ```
3. Use in `src/index.ts`:

   ```ts
   import { PORT } from "./secrets";
   app.listen(PORT, () => {
     console.log(`Server running on http://localhost:${PORT}`);
   });
   ```

---

## 7️⃣ Environment Variables Template


  ```
  PORT=3000
  DATABASE_URL="mysql://root:password@localhost:3306/ecommerce_db"
  ```
* **Developers** copy `.env.test` → `.env` and set your own values.

---

## 8️⃣ Verify Setup

```bash
npm run dev
```

* Visit: [http://localhost:3000](http://localhost:3000) → should respond with `"App working"`.

---

