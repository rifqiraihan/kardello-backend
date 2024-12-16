import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { createContext } from './context';

const prisma = new PrismaClient();
const app = express();
const serverless = require('serverless-http');


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

app.get('/', (req, res) => {
  res.send('Hello, kardalo!');
});

/// Check if we are in a serverless environment (Vercel) or local
//if (process.env.VERCEL === '1') {
  // Export for serverless (Vercel will use this handler)
  module.exports.handler = serverless(app);
// } else {
//   // Start the server for local development
  const port = process.env.PORT || 8080;  // Default to 8080 if no PORT env variable is set
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

