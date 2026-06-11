import { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../types';

// ─── Create Order ─────────────────────────────────────────────────────────────
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { items, paymentMethod, discount = 0, tax = 0, notes } = req.body;

  // Validate & compute totals
  const resolvedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      res.status(400).json({ success: false, message: `Product ${item.productId} not found` }); return;
    }
    if (product.stock < item.quantity) {
      res.status(400).json({ success: false, message: `Insufficient stock for '${product.name}'` }); return;
    }
    resolvedItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      total: product.price * item.quantity,
    });
  }

  const subtotal = resolvedItems.reduce((s, i) => s + i.total, 0);
  const total    = subtotal + tax - discount;

  const order = await Order.create({
    items: resolvedItems, subtotal, tax, discount, total,
    paymentMethod, paymentStatus: 'paid', status: 'completed',
    cashier: req.user!.userId, notes,
  });

  // Deduct stock
  await Promise.all(resolvedItems.map((i) =>
    Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })
  ));

  const populated = await Order.findById(order._id).populate('cashier', 'name email');
  res.status(201).json({ success: true, message: 'Order created', data: { order: populated } });
};

// ─── Get All Orders ───────────────────────────────────────────────────────────
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const page   = Math.max(1, Number(req.query.page) || 1);
  const limit  = Math.min(100, Number(req.query.limit) || 10);
  const skip   = (page - 1) * limit;
  const status = req.query.status as string;
  const cashier = req.query.cashier as string;
  const from   = req.query.from   ? new Date(req.query.from as string) : undefined;
  const to     = req.query.to     ? new Date(req.query.to   as string) : undefined;

  const filter: Record<string, unknown> = {};
  if (status)  filter['status']  = status;
  if (cashier) filter['cashier'] = cashier;
  if (from || to) {
    filter['createdAt'] = {};
    if (from) (filter['createdAt'] as Record<string, Date>)['$gte'] = from;
    if (to)   (filter['createdAt'] as Record<string, Date>)['$lte'] = to;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('cashier', 'name email').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, message: 'Orders fetched', data: { orders }, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
};

// ─── Get Order By ID ──────────────────────────────────────────────────────────
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id).populate('cashier', 'name email').populate('items.product', 'name sku');
  if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
  res.json({ success: true, message: 'Order fetched', data: { order } });
};

// ─── Update Order Status ──────────────────────────────────────────────────────
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }

  if (status)        order.status        = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  await order.save();

  res.json({ success: true, message: 'Order updated', data: { order } });
};

// ─── Cancel Order ─────────────────────────────────────────────────────────────
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
  if (order.status === 'cancelled') { res.status(400).json({ success: false, message: 'Order already cancelled' }); return; }

  order.status = 'cancelled';
  order.paymentStatus = 'refunded';
  await order.save();

  // Restore stock
  await Promise.all(order.items.map((i) =>
    Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } })
  ));

  res.json({ success: true, message: 'Order cancelled and stock restored', data: { order } });
};

// ─── Sales Summary ────────────────────────────────────────────────────────────
export const getSalesSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const from = req.query.from ? new Date(req.query.from as string) : new Date(new Date().setHours(0, 0, 0, 0));
  const to   = req.query.to   ? new Date(req.query.to   as string) : new Date();

  const [summary] = await Order.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 }, avgOrderValue: { $avg: '$total' } } },
    { $project: { _id: 0, totalRevenue: 1, totalOrders: 1, avgOrderValue: { $round: ['$avgOrderValue', 2] } } },
  ]);

  res.json({ success: true, message: 'Sales summary', data: { summary: summary || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 } } });
};
