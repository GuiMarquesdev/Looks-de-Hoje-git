"use strict";
// backend/src/api/routes/categories.route.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryRoutes = void 0;
const express_1 = require("express");
const CategoryService_1 = require("../../services/CategoryService");
const utils_1 = require("../../common/utils");
// Defina a rota de categorias (aberta - sem auth)
const createCategoryRoutes = (repositoryFactory) => {
    const router = (0, express_1.Router)();
    const categoryRepository = repositoryFactory.createCategoryRepository();
    const categoryService = new CategoryService_1.CategoryService(categoryRepository);
    // GET /api/categories (Leitura)
    router.get("/", async (req, res) => {
        try {
            const categories = await categoryService.getAllCategories();
            return res.json(categories);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Erro ao buscar categorias." });
        }
    });
    // POST /api/categories (Criação - ABERTA)
    router.post("/", async (req, res) => {
        try {
            const { name, is_active } = req.body;
            // Validação básica
            if (!name) {
                return res
                    .status(400)
                    .json({ message: "O nome da categoria é obrigatório." });
            }
            // Criação de slug no backend a partir do nome
            const slug = (0, utils_1.createSlug)(name);
            // Monta o DTO que o Repository espera
            const data = {
                name,
                slug,
                is_active: is_active ?? true, // Assumindo default true
            };
            const newCategory = await categoryService.createCategory(data);
            return res.status(201).json(newCategory);
        }
        catch (error) {
            console.error("Error creating category:", error);
            // Tenta retornar a mensagem de erro da camada de repositório/serviço
            return res
                .status(400)
                .json({ message: error.message || "Erro ao criar categoria." });
        }
    });
    // PUT /api/categories/:id (Atualização - ABERTA)
    router.put("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const { name, is_active } = req.body;
            let slug;
            if (name) {
                slug = (0, utils_1.createSlug)(name);
            }
            const updateData = {
                name,
                slug,
                is_active,
            };
            Object.keys(updateData).forEach((key) => updateData[key] === undefined &&
                delete updateData[key]);
            const updatedCategory = await categoryService.updateCategory(id, updateData);
            if (!updatedCategory) {
                return res.status(404).json({ message: "Categoria não encontrada." });
            }
            return res.json(updatedCategory);
        }
        catch (error) {
            console.error("Error updating category:", error);
            return res
                .status(400)
                .json({ message: error.message || "Erro ao atualizar categoria." });
        }
    });
    // DELETE /api/categories/:id (Deleção - ABERTA)
    router.delete("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            await categoryService.deleteCategory(id);
            return res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting category:", error);
            return res.status(400).json({
                message: error.message || "Não foi possível deletar a categoria.",
            });
        }
    });
    return router;
};
exports.createCategoryRoutes = createCategoryRoutes;
//# sourceMappingURL=categories.route.js.map