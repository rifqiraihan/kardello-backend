import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { createContext } from './context';
const serverless = require('serverless-http');

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

app.get('/', (req, res) => {
  res.send('Hello, kardelo!');
});

// Export for serverless (for platforms like Vercel, AWS Lambda)
module.exports.handler = serverless(app);
