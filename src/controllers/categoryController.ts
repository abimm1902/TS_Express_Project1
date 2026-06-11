import { Response } from 'express';
import Category from '../models/Category';
import { AuthRequest } from '../types';

export const getAllCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  const categories = await Category.find({ isActive: true }).populate('createdBy', 'name').sort({ name: 1 });
  res.json({ success: true, message: 'Categories fetched', data: { categories } });
};

export const getCategoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404).json({ success: false, message: 'Category not found' }); return; }
  res.json({ success: true, message: 'Category fetched', data: { category } });
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const category = await Category.create({ ...req.body, createdBy: req.user!.userId });
  res.status(201).json({ success: true, message: 'Category created', data: { category } });
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) { res.status(404).json({ success: false, message: 'Category not found' }); return; }
  res.json({ success: true, message: 'Category updated', data: { category } });
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) { res.status(404).json({ success: false, message: 'Category not found' }); return; }
  res.json({ success: true, message: 'Category deleted' });
};
