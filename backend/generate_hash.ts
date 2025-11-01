// backend/generate_hash.ts

import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Carrega as variáveis de ambiente para usar o ADMIN_EMAIL
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();
const PLAIN_PASSWORD = "admin123"; // 🚨 ESTA É A NOVA SENHA QUE VOCÊ DEVE USAR PARA LOGAR 🚨
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@123";

async function generateAndSeedAdminPassword() {
  try {
    // Gera o novo hash para a senha conhecida
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(PLAIN_PASSWORD, saltRounds);

    console.log("------------------------------------------------");
    console.log(`✅ HASH GERADO PARA A SENHA: "${PLAIN_PASSWORD}"`);
    console.log(`COPIE e COLE este hash no Prisma Studio:`);
    console.log(`\n${newHashedPassword}\n`);
    console.log("------------------------------------------------");

    // 🚨 NOVO: Insere/Atualiza no banco para garantir que a entrada exista
    await prisma.storeSetting.upsert({
      where: { id: "admin_config" },
      update: {
        admin_password: newHashedPassword,
        store_name: "Look de Hoje",
      },
      create: {
        id: "admin_config",
        admin_password: newHashedPassword,
        store_name: "Look de Hoje",
      },
    });

    console.log(
      `\n✅ O registro de StoreSetting foi ATUALIZADO com o novo HASH.`
    );
    console.log(`Email de Login: ${ADMIN_EMAIL}`);
    console.log(`Nova Senha: ${PLAIN_PASSWORD}`);
  } catch (error) {
    console.error(
      "🛑 ERRO CRÍTICO: Não foi possível gerar o hash ou conectar ao banco."
    );
    console.error(
      "Verifique se o seu banco de dados local está rodando e se há erros de dependências."
    );
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

generateAndSeedAdminPassword();
