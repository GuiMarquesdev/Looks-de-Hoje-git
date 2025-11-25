// backend/src/database/prisma.ts

import { PrismaClient } from "@prisma/client";

/**
 * Instância única do PrismaClient.
 * * É uma boa prática inicializar o Prisma Client uma vez
 * e exportar essa instância para uso em toda a aplicação.
 */
const prisma = new PrismaClient({
  // Opcional: Você pode adicionar logging para depuração.
  // log: ['query', 'info', 'warn', 'error'],
});

// Exporta a instância nomeada para ser utilizada nos repositórios.
export const PrismaClientInstance = prisma;
