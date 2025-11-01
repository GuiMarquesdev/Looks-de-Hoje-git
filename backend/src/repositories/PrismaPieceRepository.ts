// backend/src/repositories/PrismaPieceRepository.ts

import { PrismaClient, Piece, Prisma } from "@prisma/client";
import { IPieceRepository } from "../interfaces/IPieceRepository";
import { CreatePieceDTO, UpdatePieceDTO } from "../common/types";

type PieceCreatePrismaInput = Prisma.PieceCreateInput;
type PieceUpdatePrismaInput = Prisma.PieceUpdateInput;

export class PrismaPieceRepository implements IPieceRepository {
  constructor(private prisma: PrismaClient) {}
  findAll(): Promise<Piece[]> {
    throw new Error("Method not implemented.");
  }
  findById(id: string): Promise<Piece | null> {
    throw new Error("Method not implemented.");
  }
  updateStatus(
    id: string,
    newStatus: "available" | "rented"
  ): Promise<Piece | null> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  // ... (findAll and findById remain unchanged)

  async create(data: CreatePieceDTO): Promise<Piece> {
    // 🚨 VALIDAÇÃO CORRIGIDA
    if (
      !data.name ||
      data.price === undefined ||
      !data.category_id ||
      data.image_urls.length === 0
    ) {
      throw new Error("Dados incompletos para criar a peça.");
    }

    const status = data.is_available ? "available" : "rented";

    const createPayload: PieceCreatePrismaInput = {
      name: data.name, // 🚨 CORRIGIDO: Usando 'name' direto
      description: data.description,
      price: data.price, // 🚨 CORRIGIDO: Usando 'price' direto
      status: status,
      category: { connect: { id: data.category_id } },
      image_url: data.image_urls.length > 0 ? data.image_urls[0] : null,
      images: data.image_urls as any,
    } as any;

    return this.prisma.piece.create({
      data: createPayload,
    });
  }

  async update(
    id: string,
    data: Partial<UpdatePieceDTO>
  ): Promise<Piece | null> {
    const existingPiece = await this.prisma.piece.findUnique({ where: { id } });
    if (!existingPiece) {
      return null;
    }

    const updateData: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        // Mapeamento DTO.name -> DB.name (Agora não precisa de if especial)
        if (key === "name") {
          updateData.name = value;
          continue;
        }

        // Mapeamento DTO.is_available -> DB.status
        if (key === "is_available") {
          updateData.status = value ? "available" : "rented";
          continue;
        }

        // Mapeamento DTO.image_urls -> DB.image_url e DB.images
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

    return this.prisma.piece.update({
      where: { id },
      data: updateData as PieceUpdatePrismaInput,
    });
  }

  // ... (updateStatus e delete permanecem inalterados)
}
