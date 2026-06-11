"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCSV = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path_1.default.extname(file.originalname)}`);
    },
});
const fileFilter = (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || path_1.default.extname(file.originalname).toLowerCase() === '.csv') {
        cb(null, true);
    }
    else {
        cb(new Error('Only CSV files are allowed'));
    }
};
exports.uploadCSV = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
}).single('file');
//# sourceMappingURL=upload.js.map