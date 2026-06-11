# 🛒 POS System API

A full-featured **Point of Sale REST API** built with:

- **TypeScript** + **Node.js** + **Express**
- **MongoDB Atlas** (Mongoose ODM)
- **JWT** Role-Based Authentication
- **Worker Threads** for CSV bulk import

---

## 📦 Project Structure

```
pos-system/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB Atlas connection
│   │   └── jwt.ts               # Token generation & verification
│   ├── controllers/
│   │   ├── authController.ts    # Register, Login, Refresh, Profile
│   │   ├── userController.ts    # CRUD + change password
│   │   ├── productController.ts # CRUD + stock + CSV upload
│   │   ├── orderController.ts   # CRUD + cancel + sales summary
│   │   └── categoryController.ts
│   ├── middleware/
│   │   ├── auth.ts              # authenticate + authorize (permission/role)
│   │   ├── errorHandler.ts      # Global error handler
│   │   ├── upload.ts            # Multer CSV filter
│   │   └── validate.ts          # express-validator runner
│   ├── models/
│   │   ├── User.ts
│   │   ├── Category.ts
│   │   ├── Product.ts
│   │   └── Order.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── orderRoutes.ts
│   │   └── categoryRoutes.ts
│   ├── types/
│   │   └── index.ts             # Roles, Permissions, interfaces
│   ├── utils/
│   │   └── seed.ts              # DB seed script
│   ├── workers/
│   │   └── csvWorker.ts         # Worker thread for bulk CSV import
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Entry point
├── .env.example
├── sample_products.csv
├── tsconfig.json
└── package.json
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your **MongoDB Atlas URI** and **JWT secrets**.

### 3. Seed the Database

```bash
npx ts-node src/utils/seed.ts
```

Creates a **Super Admin**: `admin@pos.com` / `Admin@1234`

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build & Run Production

```bash
npm run build
npm start
```

---

## 🔐 Roles & Permissions

| Role          | Description                                    |
|---------------|------------------------------------------------|
| `super_admin` | Full access to everything                      |
| `admin`       | All except deleting users                      |
| `manager`     | Products, orders, categories, CSV upload       |
| `cashier`     | Read products, create & read orders            |

Permissions are automatically assigned on role creation and stored per-user for granular control.

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint           | Description         | Auth  |
|--------|--------------------|---------------------|-------|
| POST   | `/register`        | Register user       | ✗     |
| POST   | `/login`           | Login               | ✗     |
| POST   | `/refresh`         | Refresh access token| ✗     |
| GET    | `/profile`         | Get own profile     | ✓     |

### Users — `/api/users`

| Method | Endpoint                | Permission      |
|--------|-------------------------|-----------------|
| GET    | `/`                     | `read_user`     |
| GET    | `/:id`                  | `read_user`     |
| POST   | `/`                     | `create_user`   |
| PUT    | `/:id`                  | `update_user`   |
| DELETE | `/:id`                  | `delete_user`   |
| PATCH  | `/change-password`      | authenticated   |

### Products — `/api/products`

| Method | Endpoint             | Permission         |
|--------|----------------------|--------------------|
| GET    | `/`                  | `read_product`     |
| GET    | `/csv-template`      | `upload_csv`       |
| GET    | `/:id`               | `read_product`     |
| POST   | `/`                  | `create_product`   |
| PUT    | `/:id`               | `update_product`   |
| DELETE | `/:id`               | `delete_product`   |
| PATCH  | `/:id/stock`         | `update_product`   |
| POST   | `/upload-csv`        | `upload_csv`       |

### Orders — `/api/orders`

| Method | Endpoint           | Permission       |
|--------|--------------------|------------------|
| GET    | `/`                | `read_order`     |
| GET    | `/summary`         | `view_reports`   |
| GET    | `/:id`             | `read_order`     |
| POST   | `/`                | `create_order`   |
| PATCH  | `/:id/status`      | `update_order`   |
| PATCH  | `/:id/cancel`      | `update_order`   |

### Categories — `/api/categories`

| Method | Endpoint  | Permission          |
|--------|-----------|---------------------|
| GET    | `/`       | `read_category`     |
| GET    | `/:id`    | `read_category`     |
| POST   | `/`       | `create_category`   |
| PUT    | `/:id`    | `update_category`   |
| DELETE | `/:id`    | `delete_category`   |

---

## 📁 CSV Bulk Product Import

Upload products in bulk via CSV. Processing runs in a **Worker Thread** — the endpoint returns immediately (HTTP 202) and the import runs in the background.

### Upload Endpoint
```
POST /api/products/upload-csv
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: file=<your.csv>
```

### CSV Format
```csv
name,sku,barcode,description,price,costPrice,stock,minStock,categoryId,createdBy
Wireless Mouse,SKU-WM-001,1234567890,Ergonomic mouse,29.99,15.00,100,10,<objectId>,<objectId>
```

Download the template via `GET /api/products/csv-template`.

### How it works
1. Multer saves the file to disk
2. A `Worker` thread is spawned with the file path + MongoDB URI
3. The worker reads the CSV line-by-line using `readline`
4. Rows are validated and bulk-upserted in batches of 50
5. Worker reports results via `parentPort.postMessage()`
6. Temp file is cleaned up automatically

---

## 🔑 Example Login & Auth Flow

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pos.com","password":"Admin@1234"}'

# 2. Use the returned accessToken
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer <accessToken>"
```

---

## ⚙️ Environment Variables

| Variable               | Description                          |
|------------------------|--------------------------------------|
| `MONGODB_URI`          | MongoDB Atlas connection string      |
| `JWT_SECRET`           | Secret for access tokens             |
| `JWT_EXPIRES_IN`       | Access token expiry (e.g. `7d`)      |
| `JWT_REFRESH_SECRET`   | Secret for refresh tokens            |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (e.g. `30d`) |
| `PORT`                 | Server port (default: 5000)          |
| `NODE_ENV`             | `development` / `production`         |
| `MAX_FILE_SIZE`        | Max CSV upload in bytes              |
| `UPLOAD_DIR`           | Temp directory for CSV files         |
