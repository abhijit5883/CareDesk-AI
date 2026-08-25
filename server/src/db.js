require("dotenv/config"); // loads .env file

const { PrismaClient } = require("@prisma/client");   //imports the Prisma Client that we generated with: npx prisma generate
const { PrismaPg } = require("@prisma/adapter-pg");  //imports the PostgreSQL adapter. 

const adapter = new PrismaPg({ //prisma adapter created
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ //creates prisma client
  adapter,
});

module.exports = prisma;