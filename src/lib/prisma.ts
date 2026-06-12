import { PrismaClient } from '@prisma/client'; // Import PrismaClient to create database connection instances

const prismaClientSingleton = () => { // Factory function that creates a new PrismaClient — wrapped in a function to support the singleton pattern
  return new PrismaClient(); // Instantiate and return a new Prisma database client
};

declare global { // Extend the global scope to allow TypeScript to recognise the cached prisma instance
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>; // Declare the global variable as either unset or a PrismaClient instance
}

const prisma = globalThis.prisma ?? prismaClientSingleton(); // Reuse the existing global client if it exists, otherwise create a new one — prevents multiple connections in dev hot-reload

export default prisma; // Export the singleton Prisma client for use throughout the application

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma; // In non-production environments, cache the client on globalThis so hot module reloads reuse the same connection
