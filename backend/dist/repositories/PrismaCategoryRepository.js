"use strict";
// backend/src/repositories/PrismaCategoryRepository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCategoryRepository = void 0;
class PrismaCategoryRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.category.findMany({
            orderBy: { name: "asc" },
        });
    }
    async findById(id) {
        return this.prisma.category.findUnique({
            where: { id },
        });
    }
    async findBySlug(slug) {
        return this.prisma.category.findFirst({
            where: { slug },
        });
    }
    async create(data) {
        if (!data.name || !data.slug) {
            throw new Error("Nome e slug são obrigatórios para criar a categoria.");
        }
        // Verifica se o slug já existe
        const existing = await this.prisma.category.findFirst({
            where: { slug: data.slug },
        });
        if (existing) {
            throw new Error(`Já existe uma categoria com o slug '${data.slug}'.`);
        }
        // CORREÇÃO: Asserção de tipo 'as any' é usada para contornar o erro TS2322
        // que exige 'title' incorretamente na sua versão do Prisma Client.
        const createPayload = {
            name: data.name,
            slug: data.slug,
            is_active: data.is_active ?? true,
        };
        return this.prisma.category.create({
            data: createPayload,
        });
    }
    async update(id, data) {
        const existingCategory = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!existingCategory) {
            return null;
        }
        // Constrói o objeto de atualização com Index Signature para flexibilidade
        const updateData = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                updateData[key] = value;
            }
        }
        // Não permite atualizar para um slug que já existe em OUTRA categoria
        if (updateData.slug && updateData.slug !== existingCategory.slug) {
            const conflictingCategory = await this.prisma.category.findFirst({
                where: { slug: updateData.slug },
            });
            if (conflictingCategory && conflictingCategory.id !== id) {
                throw new Error(`Já existe outra categoria com o slug '${updateData.slug}'.`);
            }
        }
        // Usa 'as any' para contornar problemas de tipagem com objetos dinâmicos
        return this.prisma.category.update({
            where: { id },
            data: updateData,
        });
    }
    async delete(id) {
        await this.prisma.category.delete({
            where: { id },
        });
    }
}
exports.PrismaCategoryRepository = PrismaCategoryRepository;
//# sourceMappingURL=PrismaCategoryRepository.js.map