// backend/prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Carrega as variáveis de ambiente
dotenv.config({ path: "../.env" });

const prisma = new PrismaClient();

// Use o email definido no .env ou o fallback padrão
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@exemplo";

async function main() {
  console.log(`Iniciando o seeding...`);

  // 1. Criar uma categoria inicial
  const category1 = await prisma.category.upsert({
    where: { slug: "vestidos" },
    update: {},
    create: {
      name: "Vestidos",
      slug: "vestidos",
      is_active: true,
    },
  });
  console.log(`Categoria criada/atualizada: ${category1.name}`);

  // 2. Inicialização do StoreSetting (ID fixo: 'settings')
  const storeSetting = await prisma.storeSetting.upsert({
    where: { id: "settings" },
    update: {
      store_name: "LooksdeHoje Brechó",
    },
    create: {
      id: "settings",
      store_name: "LooksdeHoje Brechó",
      email: "contato@looksdehoje.com",
      whatsapp_url: "https://wa.me/5511999999999",
    },
  });
  console.log(`Configuração da Loja criada/atualizada: ${storeSetting.id}`);

  // 3. Inicialização do HeroSetting (ID fixo: 'hero')
  const heroSetting = await prisma.heroSetting.upsert({
    where: { id: "hero" },
    update: {
      is_active: true,
      interval_ms: 5000,
    },
    create: {
      id: "hero",
      is_active: true,
      interval_ms: 5000,
    },
  });
  console.log(`Configuração Hero criada/atualizada: ${heroSetting.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
