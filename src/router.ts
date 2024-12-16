import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma'; // Make sure you import prisma correctly
import { createContext } from './context'; // Assuming createContext is defined in a separate file for context

// Initialize TRPC with context
const t = initTRPC.context<typeof createContext>().create(); // Use the context type here

// Utility function for error handling
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: 'An unknown error occurred' };
};

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'; // Use a secure secret in production!

export const appRouter = t.router({
  // User Registration
  register: t.procedure
    .input(
      z.object({
        username: z.string().min(3), // Changed from email to username
        password: z.string().min(6),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
          where: { username: input.username }, // Check by username
        });
        if (existingUser) {
          throw new Error('User already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Create the user
        const user = await prisma.user.create({
          data: {
            username: input.username,
            password: hashedPassword,
            name: input.name,
          },
        });

        // Return the user excluding password
        const { password, ...userWithoutPassword } = user;
        return { message: 'User registered successfully', user: userWithoutPassword };
      } catch (error) {
        return handleError(error);
      }
    }),

  // User Login
  login: t.procedure
  .input(
    z.object({
      username: z.string(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Find the user by username
      const user = await prisma.user.findUnique({
        where: { username: input.username },
      });

      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Verify the password with bcrypt
      const isPasswordValid = await bcrypt.compare(input.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid username or password');
      }

      // Generate a JWT token with an expiration of 1 hour
      const expirationTime = Date.now() + 3600 * 1000; // Current time + 1 hour in milliseconds
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      // const expirationTime = Date.now() + 3000; // Current time + 3 seconds in milliseconds
      // const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '3s' });

      // Return the token, expiration time, and user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      return { 
        message: 'Login successful', 
        token, 
        expirationTime,  // Send expiration time to frontend
        user: userWithoutPassword 
      };
    } catch (error) {
      return handleError(error);
    }
  }),


  // Logout (client-side only)
  logout: t.procedure.mutation(async () => {
    // JWT-based authentication is stateless. So to logout, just remove the token on the client-side.
    return { message: 'Logout successful' };
  }),

  // Get Lists
  getLists: t.procedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }

      const lists = await prisma.list.findMany({
        include: { items: true },
      });

      return lists;
    } catch (error) {
      return handleError(error);
    }
  }),

  getUsers: t.procedure.query(async ({ ctx }) => {
    try {
      // Ensure the user is authenticated
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }
  
      // Fetch all users from the database, excluding their password field
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          createdAt: true,
          // updatedAt: true,
        },
      });
  
      return users;
    } catch (error) {
      return handleError(error);
    }
  }),

  // Create a New List with status
  createList: t.procedure
    .input(
      z.object({
        userId: z.string(), // Changed to match the User ID type (String)
        name: z.string(),
        status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'), // Add status input
      })
    )
    .mutation(async ({ input }) => {
      try {
        const list = await prisma.list.create({
          data: {
            name: input.name,
            userId: input.userId,
            status: input.status,
          },
        });

        return list;
      } catch (error) {
        return handleError(error);
      }
    }),

  // Add an Item to a List
  addItem: t.procedure
    .input(
      z.object({
        listId: z.number(),
        userId: z.string(), // Updated to match User ID type
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const item = await prisma.item.create({
          data: {
            name: input.name,
            description: input.description,
            listId: input.listId,
            userId: input.userId,
          },
        });

        return item;
      } catch (error) {
        return handleError(error);
      }
    }),

  // Get Items for a Specific List
  getItems: t.procedure
    .input(z.object({ listId: z.number() }))
    .query(async ({ input }) => {
      try {
        const items = await prisma.item.findMany({
          where: { listId: input.listId },
        });

        return items;
      } catch (error) {
        return handleError(error);
      }
    }),

    editList: t.procedure
    .input(
      z.object({
        listId: z.number(),
        userId: z.string(),
        name: z.string().optional(),
        status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const list = await prisma.list.findUnique({
          where: { id: input.listId },
        });

        if (!list || list.userId !== input.userId) {
          throw new Error('List not found or user does not have permission');
        }

        const updatedList = await prisma.list.update({
          where: { id: input.listId },
          data: {
            name: input.name,
            status: input.status,
          },
        });

        return { message: 'List updated successfully', list: updatedList };
      } catch (error) {
        return handleError(error);
      }
    }),

  // Edit Item
  editItem: t.procedure
  .input(
    z.object({
      itemId: z.number(),
      userId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      listId: z.number().optional(), // Include listId as optional input
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Fetch the item to ensure it exists and the user has permissions
      const item = await prisma.item.findUnique({
        where: { id: input.itemId },
      });

      if (!item || item.userId !== input.userId) {
        throw new Error('Item not found or user does not have permission');
      }

      // Update the item with the provided data
      const updatedItem = await prisma.item.update({
        where: { id: input.itemId },
        data: {
          name: input.name || item.name, // Preserve existing value if not provided
          description: input.description || item.description,
          listId: input.listId || item.listId, // Update listId if provided
        },
      });

      return { message: 'Item updated successfully', item: updatedItem };
    } catch (error) {
      return handleError(error);
    }
  }),



  // Delete an Item
  deleteItem: t.procedure
    .input(
      z.object({
        itemId: z.number(),
        userId: z.string(), // Updated to match User ID type
      })
    )
    .mutation(async ({ input }) => {
      try {
        const item = await prisma.item.findUnique({
          where: { id: input.itemId },
        });

        if (!item || item.userId !== input.userId) {
          throw new Error('Item not found or user does not have permission');
        }

        await prisma.item.delete({
          where: { id: input.itemId },
        });

        return { message: 'Item deleted successfully' };
      } catch (error) {
        return handleError(error);
      }
    }),

  // Delete a List
  deleteList: t.procedure
    .input(
      z.object({
        listId: z.number(),
        userId: z.string(), // Updated to match User ID type
      })
    )
    .mutation(async ({ input }) => {
      try {
        const list = await prisma.list.findUnique({
          where: { id: input.listId },
        });

        if (!list || list.userId !== input.userId) {
          throw new Error('List not found or user does not have permission');
        }

        await prisma.item.deleteMany({
          where: { listId: input.listId },
        });

        await prisma.list.delete({
          where: { id: input.listId },
        });

        return { message: 'List deleted successfully' };
      } catch (error) {
        return handleError(error);
      }
    }),

  // Move List Status (update the status)
  moveListStatus: t.procedure
    .input(
      z.object({
        listId: z.number(),
        userId: z.string(), // Updated to match User ID type
        status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']), // Ensure status is one of the enum values
      })
    )
    .mutation(async ({ input }) => {
      try {
        const list = await prisma.list.findUnique({
          where: { id: input.listId },
        });

        if (!list || list.userId !== input.userId) {
          throw new Error('List not found or user does not have permission');
        }

        const updatedList = await prisma.list.update({
          where: { id: input.listId },
          data: { status: input.status },
        });

        return updatedList;
      } catch (error) {
        return handleError(error);
      }
    }),
});

export type AppRouter = typeof appRouter;
