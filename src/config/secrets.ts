import dotenv from 'dotenv';

dotenv.config({path:'.env'})

export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL || "";
export const JWT_SECRET = process.env.JWT_SECRET || "";

export const NODE_ENV = process.env.NODE_ENV || 'development';