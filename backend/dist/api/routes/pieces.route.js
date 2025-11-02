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
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
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
                image_urls: (incomingData.images || [])
                    .map((img) => img.url)
                    .filter((url) => url && typeof url === "string"),
                description: incomingData.description,
                title: "",
            };
            if (!data.name ||
                !data.price ||
                !data.category_id ||
                data.image_urls.length === 0) {
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
                image_urls: (incomingData.images || []).map((img) => img.url),
                description: incomingData.description,
            };
            Object.keys(updateData).forEach((key) => updateData[key] === undefined &&
                delete updateData[key]);
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
            const currentPiece = await pieceService.getPieceById(id);
            if (!currentPiece) {
                return res.status(404).json({ message: "Peça não encontrada." });
            }
            const updatedPiece = await pieceService.togglePieceStatus(id, status);
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