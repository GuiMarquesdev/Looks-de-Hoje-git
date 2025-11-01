// backend/src/factories/PrismaRepositoryFactory.ts

import { PrismaClient } from "@prisma/client";
import { IRepositoryFactory } from "./IRepositoryFactory";
import { PrismaPieceRepository } from "../repositories/PrismaPieceRepository";
import { PrismaCategoryRepository } from "../repositories/PrismaCategoryRepository";
import { PrismaStoreSettingRepository } from "../repositories/PrismaStoreSettingRepository";
import { PrismaHeroSettingRepository } from "../repositories/PrismaHeroSettingRepository";
import { IPieceRepository } from "../interfaces/IPieceRepository";
import { ICategoryRepository } from "../interfaces/ICategoryRepository";
import { IStoreSettingRepository } from "../interfaces/IStoreSettingRepository";
import { IHeroSettingRepository } from "../interfaces/IHeroSettingRepository";
import { PrismaAdminCredentialsRepository } from "../repositories/PrismaAdminCredentialsRepository";

export class PrismaRepositoryFactory implements IRepositoryFactory {
  constructor(private prisma: PrismaClient) {}

  createPieceRepository(): IPieceRepository {
    return new PrismaPieceRepository(this.prisma);
  }

  createCategoryRepository(): ICategoryRepository {
    return new PrismaCategoryRepository(this.prisma);
  }

  createStoreSettingRepository(): IStoreSettingRepository {
    return new PrismaStoreSettingRepository(this.prisma);
  }

  createHeroSettingRepository(): IHeroSettingRepository {
    return new PrismaHeroSettingRepository(this.prisma);
  }

  createAdminCredentialsRepository() {
    return new PrismaAdminCredentialsRepository(this.prisma);
  }
}
