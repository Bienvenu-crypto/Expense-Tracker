import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    console.log('Prisma: Initializing singleton...')

    // Lazy load to avoid hang during compilation
    const { Pool } = require('pg')
    const { PrismaPg } = require('@prisma/adapter-pg')

    const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL

    console.log('Prisma: Creating pool...')
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    console.log('Prisma: Instantiating client...')
    return new PrismaClient({ adapter })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Don't initialize immediately at the top level to avoid hanging the compiler
const getPrisma = () => {
    if (!globalThis.prisma) {
        globalThis.prisma = prismaClientSingleton()
    }
    return globalThis.prisma
}

export default getPrisma()
