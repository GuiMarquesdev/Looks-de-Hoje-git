// backend/src/repositories/PrismaPieceRepository.ts

import { PrismaClient, Piece, Prisma } from "@prisma/client";
import { IPieceRepository } from "../interfaces/IPieceRepository";
import { CreatePieceDTO, UpdatePieceDTO } from "../common/types";

type PieceCreatePrismaInput = Prisma.PieceCreateInput;
type PieceUpdatePrismaInput = Prisma.PieceUpdateInput;

export class PrismaPieceRepository implements IPieceRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Piece[]> {
    return this.prisma.piece.findMany({
      include: {
        category: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  async findById(id: string): Promise<Piece | null> {
    return this.prisma.piece.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async create(data: CreatePieceDTO): Promise<Piece> {
    if (
      !data.name ||
      data.price === undefined ||
      !data.category_id ||
      !data.image_urls ||
      data.image_urls.length === 0
    ) {
      throw new Error("Dados incompletos para criar a peça.");
    }

    const status = data.is_available ? "available" : "rented";

    const createPayload: PieceCreatePrismaInput = {
      name: data.name,
      description: data.description,
      price: data.price,
      status: status,
      category: { connect: { id: data.category_id } },
      image_url: data.image_urls.length > 0 ? data.image_urls[0] : null,
      images: data.image_urls as any,
    } as any;

    return this.prisma.piece.create({
      data: createPayload,
      include: {
        category: true,
      },
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

    return this.prisma.piece.update({
      where: { id },
      data: updateData as PieceUpdatePrismaInput,
      include: {
        category: true,
      },
    });
  }

  async updateStatus(
    id: string,
    newStatus: "available" | "rented"
  ): Promise<Piece | null> {
    const existingPiece = await this.prisma.piece.findUnique({ where: { id } });
    if (!existingPiece) {
      return null;
    }

    return this.prisma.piece.update({
      where: { id },
      data: { status: newStatus },
      include: {
        category: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.piece.delete({
      where: { id },
    });
  }
}
