"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesSummary = exports.cancelOrder = exports.updateOrderStatus = exports.getOrderById = exports.getAllOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const createOrder = async (req, res) => {
    const { items, paymentMethod, discount = 0, tax = 0, notes } = req.body;
    const resolvedItems = [];
    for (const item of items) {
        const product = await Product_1.default.findById(item.productId);
        if (!product || !product.isActive) {
            res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
            return;
        }
        if (product.stock < item.quantity) {
            res.status(400).json({ success: false, message: `Insufficient stock for '${product.name}'` });
            return;
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
    const total = subtotal + tax - discount;
    const order = await Order_1.default.create({
        items: resolvedItems, subtotal, tax, discount, total,
        paymentMethod, paymentStatus: 'paid', status: 'completed',
        cashier: req.user.userId, notes,
    });
    await Promise.all(resolvedItems.map((i) => Product_1.default.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })));
    const populated = await Order_1.default.findById(order._id).populate('cashier', 'name email');
    res.status(201).json({ success: true, message: 'Order created', data: { order: populated } });
};
exports.createOrder = createOrder;
const getAllOrders = async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const cashier = req.query.cashier;
    const from = req.query.from ? new Date(req.query.from) : undefined;
    const to = req.query.to ? new Date(req.query.to) : undefined;
    const filter = {};
    if (status)
        filter['status'] = status;
    if (cashier)
        filter['cashier'] = cashier;
    if (from || to) {
        filter['createdAt'] = {};
        if (from)
            filter['createdAt']['$gte'] = from;
        if (to)
            filter['createdAt']['$lte'] = to;
    }
    const [orders, total] = await Promise.all([
        Order_1.default.find(filter).populate('cashier', 'name email').skip(skip).limit(limit).sort({ createdAt: -1 }),
        Order_1.default.countDocuments(filter),
    ]);
    res.json({ success: true, message: 'Orders fetched', data: { orders }, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
    const order = await Order_1.default.findById(req.params.id).populate('cashier', 'name email').populate('items.product', 'name sku');
    if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
    }
    res.json({ success: true, message: 'Order fetched', data: { order } });
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (req, res) => {
    const { status, paymentStatus } = req.body;
    const order = await Order_1.default.findById(req.params.id);
    if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
    }
    if (status)
        order.status = status;
    if (paymentStatus)
        order.paymentStatus = paymentStatus;
    await order.save();
    res.json({ success: true, message: 'Order updated', data: { order } });
};
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = async (req, res) => {
    const order = await Order_1.default.findById(req.params.id);
    if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
    }
    if (order.status === 'cancelled') {
        res.status(400).json({ success: false, message: 'Order already cancelled' });
        return;
    }
    order.status = 'cancelled';
    order.paymentStatus = 'refunded';
    await order.save();
    await Promise.all(order.items.map((i) => Product_1.default.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } })));
    res.json({ success: true, message: 'Order cancelled and stock restored', data: { order } });
};
exports.cancelOrder = cancelOrder;
const getSalesSummary = async (req, res) => {
    const from = req.query.from ? new Date(req.query.from) : new Date(new Date().setHours(0, 0, 0, 0));
    const to = req.query.to ? new Date(req.query.to) : new Date();
    const [summary] = await Order_1.default.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 }, avgOrderValue: { $avg: '$total' } } },
        { $project: { _id: 0, totalRevenue: 1, totalOrders: 1, avgOrderValue: { $round: ['$avgOrderValue', 2] } } },
    ]);
    res.json({ success: true, message: 'Sales summary', data: { summary: summary || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 } } });
};
exports.getSalesSummary = getSalesSummary;
//# sourceMappingURL=orderController.js.map