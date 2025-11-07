"use strict";
// backend/src/repositories/PrismaPieceRepository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPieceRepository = void 0;
const client_1 = require("@prisma/client");
class PrismaPieceRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.piece.findMany({
            include: {
                category: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });
    }
    async findById(id) {
        return this.prisma.piece.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });
    }
    async create(data) {
        if (!data.name ||
            data.price === undefined ||
            !data.category_id ||
            !data.image_urls ||
            data.image_urls.length === 0) {
            throw new Error("Dados incompletos para criar a peça.");
        }
        const status = data.is_available ? "available" : "rented";
        const createPayload = {
            name: data.name,
            description: data.description,
            price: data.price,
            status: status,
            category: { connect: { id: data.category_id } },
            image_url: data.image_urls.length > 0 ? data.image_urls[0] : null,
            images: data.image_urls,
        };
        return this.prisma.piece.create({
            data: createPayload,
            include: {
                category: true,
            },
        });
    }
    async update(id, data) {
        const existingPiece = await this.prisma.piece.findUnique({ where: { id } });
        if (!existingPiece) {
            return null;
        }
        const updateData = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                if (key === "name") {
                    updateData.name = value;
                    continue;
                }
                if (key === "is_available") {
                    updateData.status = value ? "available" : "rented";
                    continue;
                }
                if (key === "image_urls" && Array.isArray(value)) {
                    updateData.image_url = value.length > 0 ? value[0] : null;
                    updateData.images = value;
                    continue;
                }
                updateData[key] = value;
            }
        }
        if (updateData.category_id !== undefined) {
            updateData.category = { connect: { id: updateData.category_id } };
            delete updateData.category_id;
        }
        try {
            return this.prisma.piece.update({
                where: { id },
                data: updateData,
                include: {
                    category: true,
                },
            });
        }
        catch (e) {
            // Retorna null se a peça não for encontrada durante a atualização
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === "P2025") {
                return null;
            }
            throw e;
        }
    }
    async updateStatus(id, newStatus) {
        // 🛑 CORREÇÃO APLICADA
        // Removemos o findUnique anterior e usamos um try/catch para garantir
        // que o contrato de retorno 'null' em caso de peça não encontrada seja mantido,
        // tornando a operação atômica e mais robusta.
        try {
            return this.prisma.piece.update({
                where: { id },
                data: { status: newStatus },
                include: {
                    category: true,
                },
            });
        }
        catch (e) {
            // Se a peça não for encontrada para atualização, o Prisma lança um erro com código P2025
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === "P2025") {
                return null;
            }
            // Relança outros erros (como erro de banco de dados)
            throw e;
        }
    }
    async delete(id) {
        await this.prisma.piece.delete({
            where: { id },
        });
    }
}
exports.PrismaPieceRepository = PrismaPieceRepository;
//# sourceMappingURL=PrismaPieceRepository.js.map