"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Category_1 = __importDefault(require("../models/Category"));
const types_1 = require("../types");
const seed = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI not set');
        process.exit(1);
    }
    await mongoose_1.default.connect(uri);
    console.log('✅  Connected to MongoDB');
    const existing = await User_1.default.findOne({ email: 'admin@pos.com' });
    if (!existing) {
        await User_1.default.create({
            name: 'Super Admin',
            email: 'admin@pos.com',
            password: 'Admin@1234',
            role: types_1.Role.SUPER_ADMIN,
            permissions: types_1.ROLE_PERMISSIONS[types_1.Role.SUPER_ADMIN],
        });
        console.log('✅  Super Admin created → admin@pos.com / Admin@1234');
    }
    else {
        console.log('ℹ️   Super Admin already exists');
    }
    const admin = await User_1.default.findOne({ email: 'admin@pos.com' });
    const categories = ['Electronics', 'Beverages', 'Snacks', 'Stationery', 'Clothing'];
    for (const name of categories) {
        const exists = await Category_1.default.findOne({ name });
        if (!exists) {
            await Category_1.default.create({ name, description: `${name} category`, createdBy: admin._id });
            console.log(`✅  Category created: ${name}`);
        }
    }
    console.log('\n🎉  Seed complete!\n');
    await mongoose_1.default.disconnect();
    process.exit(0);
};
seed().catch((err) => { console.error(err); process.exit(1); });
//# sourceMappingURL=seed.js.map