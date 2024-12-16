import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import serverless from 'serverless-http'; // Import for serverless function
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

// Start server locally for development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the app for serverless environments (e.g., Vercel)
export default serverless(app);
