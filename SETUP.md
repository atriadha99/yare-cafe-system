# 🚀 Yare Cafe - Mini ERP System

A production-ready ERP system for cafe management built with **Next.js 16**, **Neon PostgreSQL**, and **Prisma**.

## 📋 Features

- ☕ **Menu Management** - Create and manage menu items with ingredients
- 📦 **Inventory Management** - Track raw materials and stock levels
- 🛒 **Purchase Orders** - Create, approve, and receive supplier orders
- 📋 **Stock Opname** - Perform inventory verification and reconciliation
- 👥 **Role-Based Access** - Admin, Warehouse, Cashier, Manager roles
- 🔐 **Secure Authentication** - NextAuth with credentials provider
- 📊 **Dashboard** - Real-time statistics and KPIs
- 📝 **Activity Logging** - Audit trail for all operations

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: NextAuth.js v5
- **Password Hashing**: bcryptjs

## 📦 Project Structure

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── dashboard/
├── menu/
├── inventory/
├── purchase-order/
├── stock-opname/
├── settings/
└── api/
    ├── auth/
    ├── menu/
    ├── inventory/
    ├── purchase-order/
    └── stock-opname/

components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Table.tsx
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── Shell.tsx
└── features/

services/
├── menu.service.ts
├── inventory.service.ts
├── purchase-order.service.ts
├── stock-opname.service.ts
└── user.service.ts

lib/
├── prisma.ts
├── auth.ts
├── validation.ts
└── middleware.ts
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL account (get free tier at neon.tech)

### 2. Setup Environment

```bash
# .env.local
DATABASE_URL="postgresql://user:password@ep-xxxxx.neon.tech/yare_cafe_db?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Database

```bash
# Run migrations
npx prisma migrate dev --name init

# Or generate from existing database
npx prisma db pull
npx prisma generate
```

### 5. Seed Database (Optional)

Create sample data:
```bash
npx ts-node prisma/seed.ts
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you'll be redirected to login.

## 🔐 Default Test Credentials

After seeding, you can login with:
- Email: `admin@yare.local`
- Password: `password123`

## 📖 Usage

### Create a Menu Item

```typescript
const menu = await MenuService.create({
  name: "Espresso",
  price: 25000, // in cents (250.00 IDR)
  stock: 100,
  image: "https://...",
});
```

### Create Raw Material

```typescript
const material = await InventoryService.createMaterial({
  sku: "COFFEE-001",
  name: "Arabica Coffee Beans",
  unit: "kg",
  unitCost: 180000, // in cents
  minStock: 5,
});
```

### Create Purchase Order

```typescript
const po = await PurchaseOrderService.create(
  {
    poNumber: "PO-2024-001",
    items: [
      {
        rawMaterialId: "...",
        quantityRequested: 10,
        unitPrice: 180000,
      },
    ],
  },
  userId
);
```

### Create Stock Opname

```typescript
const opname = await StockOpnameService.create(
  {
    items: [
      {
        rawMaterialId: "...",
        systemStock: 100,
        actualStock: 98,
        notes: "Slight loss due to spillage",
      },
    ],
  },
  userId
);
```

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Menu
- `GET /api/menu` - List all menus
- `POST /api/menu` - Create menu

### Inventory
- `GET /api/inventory` - List raw materials
- `POST /api/inventory` - Create raw material
- `GET /api/inventory/transactions` - List transactions
- `POST /api/inventory/transactions` - Create transaction

### Purchase Order
- `GET /api/purchase-order` - List POs
- `POST /api/purchase-order` - Create PO

### Stock Opname
- `GET /api/stock-opname` - List opnames
- `POST /api/stock-opname` - Create opname

## 🗄️ Database Schema

### Key Tables
- **User** - System users with roles
- **Menu** - Cafe menu items
- **RawMaterial** - Inventory items
- **ProductIngredient** - Menu-to-ingredient mapping
- **PurchaseOrder** - Supplier orders
- **InventoryTransaction** - Stock movements
- **StockOpname** - Inventory verification
- **ActivityLog** - Audit trail

See `prisma/schema.prisma` for full schema.

## 🔄 Key Business Logic

### Stock Management
```
Stock Change = Type
- "in": stock += quantity (receive)
- "out": stock -= quantity (use)
- "adjustment": stock = actual (opname)
```

### Purchase Order Flow
```
PENDING → APPROVED → ORDERED → RECEIVED → (Update Inventory)
```

### Menu Availability
```
Check if all ingredients have sufficient stock
Consume ingredients when menu is ordered
```

## 📱 Deployment

### Deploy to Vercel

```bash
# Push to GitHub first
git push origin main

# Deploy with Vercel CLI
vercel

# Or connect GitHub repo to Vercel dashboard
```

### Environment Variables

Set these in Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_URL` (production URL)
- `NEXTAUTH_SECRET`

## 🧪 Testing

Create test users:
```bash
npx prisma db seed
```

Test all flows:
- Create menu item with ingredients
- Create raw materials
- Create purchase order and receive items
- Perform stock opname with adjustments

## 📊 Monitoring

### View Database in Neon Console
```bash
# Dashboard at https://console.neon.tech
```

### View Logs
```bash
npm run dev
# Check terminal for query logs
```

### Activity Logs
- All operations are logged to `ActivityLog` table
- Query via API or Prisma

## 🚨 Common Issues

### Database Connection Error
- Check `DATABASE_URL` format
- Ensure IP is whitelisted in Neon
- Verify SSL mode is `require`

### Prisma Client Error
```bash
rm -rf node_modules .next
npm install
npx prisma generate
```

### NextAuth Session Not Working
- Verify `NEXTAUTH_SECRET` is set
- Clear cookies in browser
- Check session callback logic

## 📝 Notes

- All prices stored in cents (divide by 100 for display)
- Timestamps in UTC
- User roles control access (middleware in progress)
- Activity log tracks all changes for audit

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/xyz`
2. Make changes and test
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/xyz`
5. Create PR

## 📄 License

MIT

## 🎯 Next Steps

- [ ] Add role-based middleware
- [ ] Implement delete operations
- [ ] Add search and filtering
- [ ] Create reports module
- [ ] Add multi-cafe support
- [ ] Create mobile app (React Native)
- [ ] Add real-time notifications
- [ ] Implement backup system

---

**Built with ❤️ for cafe management**
