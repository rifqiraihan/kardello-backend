# Kardelo Backend

This is the backend for the Kardelo application, built using **Express**, **Prisma**, **tRPC**, and **TypeScript**.

## Tech Stack

- **Node.js** & **Express**: Web server
- **Prisma**: ORM for PostgreSQL
- **tRPC**: Type-safe API
- **JWT**: Authentication
- **Zod**: Schema validation
- **TypeScript**: Static typing

## Setup

1. Clone the repository

git clone https://github.com/yourusername/kardelo-backend.git
cd kardelo-backend

2. Install dependencies
npm install
# or
pnpm install

3. Configure Environment Variables
Create a .env file in the root with:

env
DATABASE_URL="postgresql://rifqiraihanlazuardi:newpassword@localhost:5432/kardello"
PORT="8080"
VERCEL="1"

4. Set up the database
Make sure PostgreSQL is running and set up the database:


5. Run Prisma Migrations
npx prisma generate
npx prisma migrate deploy

7. Start the server
8. 
For development:

npm run dev
# or
pnpm  dev







