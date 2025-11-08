"use strict";
// backend/src/api/routes/pieces.route.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPiecesRoutes = void 0;
const express_1 = require("express");
const PieceService_1 = require("../../services/PieceService");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configuração do multer para armazenar imagens
// CORREÇÃO: Quatro `..` para garantir que o caminho chegue ao `uploads` na raiz do projeto
const uploadDir = path_1.default.join(__dirname, "../../../uploads");
// Cria a pasta uploads se não existir
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetypeIsAllowed = allowedTypes.test(file.mimetype);
        if (extname && mimetypeIsAllowed) {
            return cb(null, true);
        }
        else {
            // Adiciona logs detalhados para o console do Node (para ajudar no debug)
            console.error(`[Multer Error] File rejected in pieces upload: ${file.originalname}`);
            console.error(`[Multer Error] Extname passed: ${extname}. MimeType passed: ${mimetypeIsAllowed}. Received Mimetype: ${file.mimetype}`);
            cb(new Error("Apenas imagens são permitidas!"));
        }
    },
});
const createPiecesRoutes = (repositoryFactory) => {
    const router = (0, express_1.Router)();
    const pieceRepository = repositoryFactory.createPieceRepository();
    const pieceService = new PieceService_1.PieceService(pieceRepository);
    // GET /api/pieces - Listar todas as peças
    router.get("/", async (req, res) => {
        try {
            const pieces = await pieceService.getAllPieces();
            return res.json(pieces);
        }
        catch (error) {
            console.error("Error fetching pieces:", error);
            return res.status(500).json({ message: "Erro ao buscar peças." });
        }
    });
    // GET /api/pieces/:id - Buscar peça por ID
    router.get("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const piece = await pieceService.getPieceById(id);
            if (!piece) {
                return res.status(404).json({ message: "Peça não encontrada." });
            }
            return res.json(piece);
        }
        catch (error) {
            console.error("Error fetching piece:", error);
            return res.status(500).json({ message: "Erro ao buscar peça." });
        }
    });
    // POST /api/pieces/upload-images - Upload real de imagens
    router.post("/upload-images", upload.array("files", 10), async (req, res) => {
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                return res
                    .status(400)
                    .json({ message: "Nenhum arquivo foi enviado." });
            }
            // Gera URLs das imagens salvas
            const urls = files.map((file) => {
                // A URL gerada está correta, pois o server.ts mapeia /uploads
                return `http://localhost:3000/uploads/${file.filename}`;
            });
            return res.json({ urls });
        }
        catch (error) {
            console.error("Error uploading images:", error);
            return res
                .status(500)
                .json({ message: "Erro ao fazer upload de imagens." });
        }
    });
    // POST /api/pieces - Criar nova peça
    router.post("/", async (req, res) => {
        try {
            const incomingData = req.body;
            const isAvailable = incomingData.status === "available";
            const data = {
                name: incomingData.name,
                price: incomingData.price ? Number(incomingData.price) : 100,
                is_available: isAvailable,
                category_id: incomingData.category_id,
                // 🛑 CORREÇÃO 1: Passar o array completo de objetos de imagem (images)
                // O campo 'images' no DTO corresponde ao campo JSON do Prisma.
                images: incomingData.images || [],
                description: incomingData.description,
                // 🛑 CORREÇÃO 2: Adicionar o campo 'measurements' para salvar as medidas.
                measurements: incomingData.measurements || null,
                title: "", // Mantido para compatibilidade com o DTO
            };
            if (!data.name ||
                !data.price ||
                !data.category_id ||
                data.images.length === 0 // Verificação de imagens corrigida para usar 'data.images.length'
            ) {
                throw new Error("Dados incompletos para criar a peça.");
            }
            const newPiece = await pieceService.createPiece(data);
            return res.status(201).json(newPiece);
        }
        catch (error) {
            console.error("Erro ao salvar peça:", error);
            const msg = error instanceof Error
                ? error.message
                : "Erro desconhecido ao criar peça.";
            return res.status(400).json({
                message: msg,
            });
        }
    });
    // PUT /api/pieces/:id - Atualizar peça
    router.put("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const incomingData = req.body;
            const updateData = {
                name: incomingData.name,
                price: incomingData.price ? Number(incomingData.price) : undefined,
                is_available: incomingData.status
                    ? incomingData.status === "available"
                    : undefined,
                category_id: incomingData.category_id,
                // 🛑 CORREÇÃO 1: Passar o array completo de objetos de imagem (images)
                images: incomingData.images,
                description: incomingData.description,
                // 🛑 CORREÇÃO 2: Adicionar o campo 'measurements' para atualizar as medidas.
                measurements: incomingData.measurements,
            };
            // Remove chaves com valor 'undefined' do objeto de atualização
            Object.keys(updateData).forEach((key) => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });
            // Remove o 'title' do objeto de atualização (se houver, por questões de tipagem)
            if ("title" in updateData)
                delete updateData.title;
            const updatedPiece = await pieceService.updatePiece(id, updateData);
            if (!updatedPiece) {
                return res.status(404).json({ message: "Peça não encontrada." });
            }
            return res.json(updatedPiece);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : "Erro ao atualizar peça.";
            return res.status(400).json({ message: msg });
        }
    });
    // PUT /api/pieces/:id/toggle-status - Alternar status
    router.put("/:id/toggle-status", async (req, res) => {
        try {
            const id = req.params.id;
            const { status } = req.body;
            // Validação básica para garantir que o status é um dos permitidos
            if (status !== "available" && status !== "rented") {
                return res.status(400).json({
                    message: "Status inválido. Deve ser 'available' ou 'rented'.",
                });
            }
            // 🛑 CORREÇÃO: O service (PieceService.ts) foi modificado para simplesmente
            // definir o status para o valor fornecido (status), em vez de alterná-lo.
            // O frontend envia o status final desejado.
            const updatedPiece = await pieceService.togglePieceStatus(id, status);
            if (!updatedPiece) {
                return res.status(404).json({ message: "Peça não encontrada." });
            }
            return res.json(updatedPiece);
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : "Erro ao alterar status.";
            return res.status(400).json({ message: msg });
        }
    });
    // DELETE /api/pieces/:id - Deletar peça
    router.delete("/:id", async (req, res) => {
        try {
            const id = req.params.id;
            await pieceService.deletePiece(id);
            return res.status(204).send();
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : "Erro ao deletar peça.";
            return res.status(400).json({ message: msg });
        }
    });
    return router;
};
exports.createPiecesRoutes = createPiecesRoutes;
//# sourceMappingURL=pieces.route.js.map