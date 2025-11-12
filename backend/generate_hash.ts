// backend/generate_hash.ts
// 🚨 Garante que o PrismaClient seja reconhecido (correção da primeira etapa)
import { PrismaClient } from "@prisma/client";

// Se o erro do 'process' persistir, adicione esta linha para resolver o problema de tipos globais
// (mas a alteração no tsconfig.json é a preferencial)
// declare var process: NodeJS.Process;

const prisma = new PrismaClient();
const PLAIN_PASSWORD = "admin123"; // 🚨 ESTA É A NOVA SENHA QUE VOCÊ DEVE USAR PARA LOGAR 🚨
// Acessa process.env.ADMIN_EMAIL, que agora deve ser reconhecido
const ADMIN_USERNAME = process.env.ADMIN_EMAIL || "admin@123";

async function generateAndSeedAdminPassword() {
  // ... (hash generation logic)
  const newHashedPassword = "PASSWORD_HASH_PLACEHOLDER"; // Substitua pela sua lógica de hash

  try {
    // ... (restante da sua lógica)
    await prisma.adminCredentials.upsert({
      where: { id: "admin_credentials" },
      update: {
        admin_password: newHashedPassword,
        username: ADMIN_USERNAME,
      },
      create: {
        id: "admin_credentials",
        admin_password: newHashedPassword,
        username: ADMIN_USERNAME,
      },
    });

    console.log(
      `\n✅ O registro de AdminCredentials foi ATUALIZADO com o novo HASH.`
    );
    console.log(`Username de Login: ${ADMIN_USERNAME}`);
    console.log(`Nova Senha: ${PLAIN_PASSWORD}`);
  } catch (error) {
    // ... (error handling)
  } finally {
    await prisma.$disconnect();
  }
}

generateAndSeedAdminPassword();
