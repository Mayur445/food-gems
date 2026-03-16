const { PrismaClient } = require('@prisma/client');

// Create a single Prisma instance for the whole app
// Like Django's database connection — created once, reused everywhere
const prisma = new PrismaClient();

module.exports = prisma;