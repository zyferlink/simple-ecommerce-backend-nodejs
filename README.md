# Stage 3 – Routes Setup (Signup & Login)

## 1. Create Auth Routes

1. Inside `routes/`, create files `auth.ts` & `index.ts`
2. Import `Router` from Express.
3. Create a router instance:

   ```ts
   const authRoutes = Router();
   ```
4. Add route placeholders for **login** and **signup** (controllers will be linked later).


**View auth.ts** &nbsp;|&nbsp;  [ open auth.ts -> ](./src/routes/auth.ts)

<br/>

**View index.ts** &nbsp;|&nbsp;  [ open index.ts -> ](./src/routes/index.ts)

---

## 2. Create Controllers

1. Inside `controllers/`, create `auth.ts`.
2. Export controller functions:

   * `logIn` (POST)
   * `signUp` (POST)
3. Add request/response types:

   ```ts
   import { Request, Response } from "express";
   ```

**View auth.ts** &nbsp;|&nbsp;  [ open auth.ts -> ](./src/controllers/auth.ts)

---

## 3. Combine Routes

1. In `routes/index.ts`:

   * Import Express Router
   * Create a `rootRouter`
   * Use `rootRouter.use('/auth', authRoutes)`
   * Export `rootRouter`

---

## 4. Use Routes in Main App

1. In `index.ts` (main server file):

   * Enable JSON middleware:

     ```ts
     app.use(express.json());
     ```
   * Use `rootRouter` with a prefix:

     ```ts
     app.use('/api', rootRouter);
     ```

**View index.ts** &nbsp;|&nbsp;  [ open index.ts -> ](./src/index.ts)

---

## 5. Initialize Prisma Client

1. Import and create Prisma client in `prisma.ts`:

   ```ts
   import { PrismaClient } from "@prisma/client";
   export const prisma = new PrismaClient({ log: ["query"] });
   ```
2. Export it for use in controllers.

**View index.ts** &nbsp;|&nbsp;  [ open index.ts -> ](./src/index.ts)

---

## 6. Install Required Packages

```bash
npm install bcrypt jsonwebtoken
npm install -D @types/bcrypt @types/jsonwebtoken
```

---

## 7. Signup Logic

1. Destructure `name`, `email`, `password` from `req.body`.
2. Check if the user already exists:

   ```ts
   const user = await prisma.user.findFirst({ where: { email } });
   ```
3. If exists → throw error `"User already exists"`.
4. If not → hash password:

   ```ts
   const hashedPassword = bcrypt.hashSync(password, 10);
   ```
5. Create user in DB and return response **without** password.

**View auth.ts** &nbsp;|&nbsp;  [ open auth.ts -> ](./src/routes/auth.ts)

---

## 8. Login Logic

1. Destructure `email`, `password` from `req.body`.
2. Find user by email → if not found, throw `"User does not exist"`.
3. Compare passwords:

   ```ts
   const isMatch = bcrypt.compareSync(password, user.password);
   if (!isMatch) throw new Error("Incorrect password");
   ```
4. Generate JWT token:

   ```ts
   const token = jwt.sign({ userId: user.id }, JWT_SECRET!);
   ```
5. Return user data **without password** + token.

**View auth.ts** &nbsp;|&nbsp;  [ open auth.ts -> ](./src/routes/auth.ts)

---

## 9. Environment Variables (`.env`)

```
JWT_SECRET=your_random_secret
```

---

## 10. Testing in Postman

1. Create collection `e-commerce-backend`.
2. Add:

   * **POST** `/api/auth/signup` (Body: name, email, password)
   * **POST** `/api/auth/login` (Body: email, password)
3. Check hashed password in DB.
4. Use returned JWT in Authorization header for protected routes.

---
