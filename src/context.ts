import { inferAsyncReturnType } from '@trpc/server';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const createContext = ({ req }: { req: Request }) => {
  // Skip token validation for login or register routes
  if (req.path === '/login' || req.path === '/register') {
    return {}; // Return an empty context for these routes
  }

  // Otherwise, check for token in Authorization header
  const token = req.headers['authorization']?.split(' ')[1]; // Get the token from Authorization header

  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; name: string }; // Adjusted the decoding to include userId and name
    return { user: decoded }; // Attach the decoded user data to the context
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export type Context = inferAsyncReturnType<typeof createContext>;
