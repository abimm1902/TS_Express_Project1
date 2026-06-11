"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const getAllCategories = async (req, res) => {
    const categories = await Category_1.default.find({ isActive: true }).populate('createdBy', 'name').sort({ name: 1 });
    res.json({ success: true, message: 'Categories fetched', data: { categories } });
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res) => {
    const category = await Category_1.default.findById(req.params.id);
    if (!category) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
    }
    res.json({ success: true, message: 'Category fetched', data: { category } });
};
exports.getCategoryById = getCategoryById;
const createCategory = async (req, res) => {
    const category = await Category_1.default.create({ ...req.body, createdBy: req.user.userId });
    res.status(201).json({ success: true, message: 'Category created', data: { category } });
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    const category = await Category_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
    }
    res.json({ success: true, message: 'Category updated', data: { category } });
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    const category = await Category_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
    }
    res.json({ success: true, message: 'Category deleted' });
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryController.js.map