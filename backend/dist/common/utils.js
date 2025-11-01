"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSlug = void 0;
const createSlug = (text) => {
    return text
        .toLowerCase()
        .normalize("NFD") // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .trim() // Remove whitespace from both sides
        .replace(/[^a-z0-9\s-]/g, "") // Remove all non-word chars except hyphen and space
        .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with a single hyphen
        .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
};
exports.createSlug = createSlug;
//# sourceMappingURL=utils.js.map