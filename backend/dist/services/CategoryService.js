"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async getAllCategories() {
        return this.categoryRepository.findAll();
    }
    async getCategoryById(id) {
        return this.categoryRepository.findById(id);
    }
    async createCategory(data) {
        // Validação de Serviço adicional
        return this.categoryRepository.create(data);
    }
    async updateCategory(id, data) {
        // Validação de Serviço
        return this.categoryRepository.update(id, data);
    }
    async deleteCategory(id) {
        // O Repositório já tem a regra de negócio para verificar se há peças antes de excluir (se implementada)
        await this.categoryRepository.delete(id);
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=CategoryService.js.map