// backend/src/services/CategoryService.ts
import { Category } from "@prisma/client";
import { ICategoryRepository } from "../interfaces/ICategoryRepository";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../common/types";

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    // Validação de Serviço adicional
    return this.categoryRepository.create(data);
  }

  async updateCategory(
    id: string,
    data: Partial<UpdateCategoryDTO>
  ): Promise<Category | null> {
    // Validação de Serviço
    return this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: string): Promise<void> {
    // O Repositório já tem a regra de negócio para verificar se há peças antes de excluir (se implementada)
    await this.categoryRepository.delete(id);
  }
}
