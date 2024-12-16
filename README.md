# Kardelo Backend

This is the backend for the Kardelo application, built using Express, Prisma, tRPC, and TypeScript. The backend provides a set of RESTful APIs and supports authentication, task management, and user interactions in a Trello-like environment.

Currently, the backend is still under development, with core features such as task creation, editing, and deletion, as well as user authentication, already functional. However, some features may be subject to changes and optimizations.

## Features
User Authentication: Register, login, and manage user sessions using JWT (JSON Web Tokens).
Task Management: Create, edit, and delete tasks.
Reply Management: Create, edit, and delete replies on tasks.
tRPC API: Type-safe API calls using tRPC for frontend-backend communication.
Database Integration: PostgreSQL with Prisma ORM for task and user data storage.
Cors Middleware: Cross-origin resource sharing (CORS) support for frontend integration.
Drag-and-Drop Task Management: updateStatusList API to update the status of tasks when they are dragged and dropped between different lists or columns.

## Tech Stack

Express: Web framework for building the API.
Prisma: ORM for PostgreSQL database interactions.
tRPC: Type-safe API framework for building APIs without schemas.
TypeScript: Static typing for safer and more maintainable code.
jsonwebtoken: Authentication via JWT for user sessions.
bcrypt: Password hashing for secure authentication.
cors: Middleware to enable CORS support for cross-origin requests.


## Setup

1. Clone the repository

git clone https://github.com/yourusername/kardelo-backend.git
cd kardelo-backend

2. Install dependencies
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
pnpm  dev








