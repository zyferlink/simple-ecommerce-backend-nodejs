## E-Commerce — Stage 1: Project Setup (TypeScript + Express)

---

## Project summary

A minimal starter for an e-commerce backend using TypeScript and Express.
Goals for Stage 1: initialize the repo, configure TypeScript, add Express, enable fast dev reloads, and establish a clean folder structure.

---

## Prerequisites

* Node.js (v16+ recommended)
* npm (v8+ recommended)
* Git (optional but recommended)

---

## Quick setup (copy & paste)

```bash
# create project folder
mkdir e-commerce-backend
cd e-commerce-backend

# initialize npm (use -y to accept defaults)
npm init -y

# install runtime and dev dependencies
npm install express
npm install -D typescript ts-node ts-node-dev nodemon @types/node @types/express

# initialize TypeScript config
npx tsc --init
```

> Notes:
>
> * `ts-node-dev` provides fast reloading for TypeScript during development (preferred). If you prefer `nodemon + ts-node`, that also works.
> * `@types/node` and `@types/express` are development dependencies that provide type definitions.

---

## Recommended `package.json` scripts

Add these to the `"scripts"` section of `package.json`:

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc -p .",
  "start": "node dist/index.js",
  "lint": "eslint . --ext .ts",
  "format": "prettier --write ."
}
```

* `npm run dev` — development server with hot reload
* `npm run build` — compiles TypeScript to `dist/`
* `npm start` — runs compiled production code

---

## Recommended `tsconfig.json` 

Open `tsconfig.json` and ensure these options (add/adjust):

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2016",
    "noImplicitAny": true,
    "removeComments": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
 
```

`outDir` and `rootDir` are important for a predictable build output.

---

<br/>

### Node/Dev runner configuration (optional)

**nodemon.json** (if you choose `nodemon` + `ts-node`):

```json
{
  "watch": ["src"],
  "ext": "ts,js,json",
  "exec": "npx ts-node ./src/index.ts"
}
```

Alternatively, use the `ts-node-dev` script shown above — it's simpler and faster for TypeScript.

<br/>

---

## Minimal `src/index.ts` (typed, middleware included)

```ts
import express, { Express, Request, Response } from "express";

const app: Express = express();

app.get("/", (request: Request, response: Response) => {
  response.send("App working");
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
   console.log(`App running at http://localhost:${PORT}`);
});

```

---

## Folder structure (standard)

```
e-commerce-backend/
├─ package.json
├─ tsconfig.json
├─ nodemon.json         # optional
├─ .env                 # environment variables (do not commit)
├─ .gitignore
└─ src/
   ├─ index.ts
   ├─ controllers/
   ├─ routes/
   ├─ middlewares/
   ├─ exceptions/
   ├─ schemas/         
   └─ services/
```

---

## .gitignore (check project file)

```
node_modules/
dist/
.env
*.log
.vscode/
```

---

## Environment variables

Create a `.env` file for configuration (do **not** commit it). Example:

```
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/dbname
```

Use a library like `dotenv` (optional) or your deployment environment to load env vars.

---

<br/>

---

## 🚀 How to Start & Check if Working

```bash
npm run dev
```

* Starts the server in development mode with hot reload.
* By default runs at: [http://localhost:3000](http://localhost:3000)

Open your browser and visit `http://localhost:3000` → You should see:


> App working


---

## 📦 (Optional) Build & Production

1. `npm run build` → compiles TypeScript to `dist/`
2. Deploy the `dist/` folder and run:

   ```bash
   npm start
   ```

   or use a process manager like **PM2**.
3. Ensure environment variables (e.g., DB credentials, API keys) are set in your hosting environment.

---

