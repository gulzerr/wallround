-- Create the role enum
CREATE TYPE role AS ENUM ('user', 'admin', 'moderator');
DROP TYPE "role";

-- Create the users table
CREATE TABLE "users" (
  id SERIAL PRIMARY KEY,
  uuid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  role "role" DEFAULT 'user',
  "isActive" BOOLEAN DEFAULT true,
  password TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);