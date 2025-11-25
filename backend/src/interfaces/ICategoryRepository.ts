// backend/src/interfaces/ICategoryRepository.ts

import { Category } from "@prisma/client";
// Importa os DTOs de criação e atualização de Categoria
import { CreateCategoryDTO, UpdateCategoryDTO } from "../common/types";

// Interface que define os métodos que o repositório de categorias deve implementar.
export interface ICategoryRepository {
  findAll(): Promise<Category[]>;

  findById(id: string): Promise<Category | null>;

  findBySlug(slug: string): Promise<Category | null>;

  // CORREÇÃO: O método 'create' deve esperar um DTO com todos os dados necessários.
  create(data: CreateCategoryDTO): Promise<Category>;

  update(
    id: string,
    data: Partial<UpdateCategoryDTO>
  ): Promise<Category | null>;

  delete(id: string): Promise<void>;
}
