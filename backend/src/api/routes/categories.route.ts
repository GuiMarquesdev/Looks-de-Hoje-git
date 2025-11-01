// backend/src/api/routes/categories.route.ts

import { Router, Request, Response } from "express";
import { IRepositoryFactory } from "../../factories/IRepositoryFactory";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../common/types";
import { CategoryService } from "../../services/CategoryService";
import { createSlug } from "../../common/utils";

// Defina a rota de categorias (aberta - sem auth)
export const createCategoryRoutes = (repositoryFactory: IRepositoryFactory) => {
  const router = Router();
  const categoryRepository = repositoryFactory.createCategoryRepository();
  const categoryService = new CategoryService(categoryRepository);

  // GET /api/categories (Leitura)
  router.get("/", async (req: Request, res: Response) => {
    try {
      const categories = await categoryService.getAllCategories();
      return res.json(categories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar categorias." });
    }
  });

  // POST /api/categories (Criação - ABERTA)
  router.post("/", async (req: Request, res: Response) => {
    try {
      const { name, is_active } = req.body;

      // Validação básica
      if (!name) {
        return res
          .status(400)
          .json({ message: "O nome da categoria é obrigatório." });
      }

      // Criação de slug no backend a partir do nome
      const slug = createSlug(name);

      // Monta o DTO que o Repository espera
      const data: CreateCategoryDTO = {
        name,
        slug,
        is_active: is_active ?? true, // Assumindo default true
      };

      const newCategory = await categoryService.createCategory(data);
      return res.status(201).json(newCategory);
    } catch (error: any) {
      console.error("Error creating category:", error);
      // Tenta retornar a mensagem de erro da camada de repositório/serviço
      return res
        .status(400)
        .json({ message: error.message || "Erro ao criar categoria." });
    }
  });

  // PUT /api/categories/:id (Atualização - ABERTA)
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { name, is_active } = req.body;

      let slug: string | undefined;
      if (name) {
        slug = createSlug(name);
      }

      const updateData: Partial<UpdateCategoryDTO> = {
        name,
        slug,
        is_active,
      };

      Object.keys(updateData).forEach(
        (key) =>
          updateData[key as keyof UpdateCategoryDTO] === undefined &&
          delete updateData[key as keyof UpdateCategoryDTO]
      );

      const updatedCategory = await categoryService.updateCategory(
        id,
        updateData
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: "Categoria não encontrada." });
      }

      return res.json(updatedCategory);
    } catch (error: any) {
      console.error("Error updating category:", error);
      return res
        .status(400)
        .json({ message: error.message || "Erro ao atualizar categoria." });
    }
  });

  // DELETE /api/categories/:id (Deleção - ABERTA)
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await categoryService.deleteCategory(id);
      return res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      return res.status(400).json({
        message: error.message || "Não foi possível deletar a categoria.",
      });
    }
  });

  return router;
};
