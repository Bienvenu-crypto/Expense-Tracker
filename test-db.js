const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasourceUrl: "postgresql://neondb_owner:npg_QbRA5qFpVYl1@ep-restless-cherry-ain2wzc3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function test() {
    try {
        console.log('Testing connection...');
        await prisma.$connect();
        console.log('Connected successfully!');

        console.log('Checking for tables...');
        try {
            const users = await prisma.user.findMany();
            console.log('Tables found. User count:', users.length);
        } catch (e) {
            console.log('Tables might not exist yet, but connection works.');
            console.log('Error was:', e.message);
        }
    } catch (error) {
        console.error('Error during database diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
