import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { createContext } from './context';

const prisma = new PrismaClient();
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Set up tRPC handler with context
app.use(
  '/kardeloApi',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Start server for production and local environments
const port = process.env.PORT || 8080;  // Default to 8080 if no PORT env variable is set
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
