/**
 * Demo seed for NIRAGA.
 * Creates a demo account with 7 days of dummy data:
 * suppliers, products, sales, purchase orders, and reorder suggestions.
 *
 * Usage: bunx prisma db seed
 * Login: demo@niraga.test / demo1234
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const DEMO_EMAIL = "demo@niraga.test";
const DEMO_PASSWORD = "demo1234";

function daysAgo(n: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Upsert demo user (idempotent).
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password: hashed, name: "Demo User" },
    create: {
      email: DEMO_EMAIL,
      password: hashed,
      name: "Demo User",
      firstName: "Demo",
      lastName: "User",
      role: 1,
      subscriptionStatus: "active",
    },
  });

  // Clean previous demo data (products cascade to sales/orders/suggestions).
  await prisma.product.deleteMany({ where: { userId: user.id } });
  await prisma.purchaseOrder.deleteMany({ where: { userId: user.id } });
  await prisma.reorderSuggestion.deleteMany({ where: { userId: user.id } });
  await prisma.supplier.deleteMany({ where: { userId: user.id } });

  // Suppliers.
  const suppliers = await prisma.supplier.createManyAndReturn({
    data: [
      {
        userId: user.id,
        name: "PT Maju Bersama",
        email: "sales@majubersama.co.id",
        phone: "+62 21 555 0101",
        address: "Jl. Industri Raya No. 12, Jakarta",
        notes: "Main electronics supplier, 7-day lead time.",
      },
      {
        userId: user.id,
        name: "CV Berkah Jaya",
        email: "order@berkahjaya.com",
        phone: "+62 812 3456 7890",
        address: "Jl. Raya Bogor KM 21, Bogor",
        notes: "Fast delivery for office supplies.",
      },
      {
        userId: user.id,
        name: "UD Sinar Abadi",
        email: "info@sinarabadi.id",
        phone: "+62 31 555 0202",
        address: "Jl. Raya Rungkut No. 88, Surabaya",
        notes: "Bulk pricing available.",
      },
    ],
  });
  const [maju, berkah, sinar] = suppliers;

  // Products (price/cost in cents). Mix of healthy, low, and out-of-stock.
  const productDefs = [
    {
      sku: "WID-001",
      name: "Premium Widget",
      category: "Electronics",
      price: 129900,
      cost: 85000,
      stockLevel: 45,
      reorderPoint: 10,
      leadTimeDays: 7,
      supplierId: maju.id,
    },
    {
      sku: "WID-002",
      name: "Standard Widget",
      category: "Electronics",
      price: 89900,
      cost: 55000,
      stockLevel: 8,
      reorderPoint: 10,
      leadTimeDays: 7,
      supplierId: maju.id,
    },
    {
      sku: "GAD-101",
      name: "Wireless Gadget",
      category: "Electronics",
      price: 249900,
      cost: 160000,
      stockLevel: 0,
      reorderPoint: 5,
      leadTimeDays: 5,
      supplierId: maju.id,
    },
    {
      sku: "OFF-201",
      name: "Office Paper A4 (Box)",
      category: "Office",
      price: 45900,
      cost: 32000,
      stockLevel: 120,
      reorderPoint: 20,
      leadTimeDays: 3,
      supplierId: berkah.id,
    },
    {
      sku: "OFF-202",
      name: "Ballpoint Pen (Pack)",
      category: "Office",
      price: 19900,
      cost: 12000,
      stockLevel: 3,
      reorderPoint: 15,
      leadTimeDays: 3,
      supplierId: berkah.id,
    },
    {
      sku: "FUR-301",
      name: "Ergonomic Chair",
      category: "Furniture",
      price: 1899000,
      cost: 1250000,
      stockLevel: 6,
      reorderPoint: 4,
      leadTimeDays: 14,
      supplierId: sinar.id,
    },
    {
      sku: "FUR-302",
      name: "Standing Desk",
      category: "Furniture",
      price: 3499000,
      cost: 2400000,
      stockLevel: 2,
      reorderPoint: 3,
      leadTimeDays: 14,
      supplierId: sinar.id,
    },
    {
      sku: "ACC-401",
      name: "USB-C Cable 1m",
      category: "Accessories",
      price: 79000,
      cost: 45000,
      stockLevel: 200,
      reorderPoint: 30,
      leadTimeDays: 5,
      supplierId: maju.id,
    },
    {
      sku: "ACC-402",
      name: 'Laptop Sleeve 14"',
      category: "Accessories",
      price: 159900,
      cost: 95000,
      stockLevel: 25,
      reorderPoint: 10,
      leadTimeDays: 5,
      supplierId: sinar.id,
    },
    {
      sku: "ACC-403",
      name: "Wireless Mouse",
      category: "Accessories",
      price: 119900,
      cost: 70000,
      stockLevel: 12,
      reorderPoint: 10,
      leadTimeDays: 5,
      supplierId: maju.id,
    },
  ];

  const products = [];
  for (const def of productDefs) {
    const p = await prisma.product.create({
      data: { ...def, userId: user.id },
    });
    products.push(p);
  }

  // Sales: 7 days of history (multiple sales per day, varied quantities).
  const salePlan: Array<{
    productIdx: number;
    day: number;
    qty: number;
    hour: number;
  }> = [
    // Day 6 ago (highest — makes the chart peak early)
    { productIdx: 0, day: 6, qty: 8, hour: 9 },
    { productIdx: 3, day: 6, qty: 12, hour: 10 },
    { productIdx: 7, day: 6, qty: 15, hour: 11 },
    { productIdx: 9, day: 6, qty: 6, hour: 14 },
    { productIdx: 0, day: 6, qty: 5, hour: 15 },
    // Day 5 ago
    { productIdx: 0, day: 5, qty: 6, hour: 9 },
    { productIdx: 3, day: 5, qty: 10, hour: 10 },
    { productIdx: 7, day: 5, qty: 12, hour: 13 },
    { productIdx: 8, day: 5, qty: 4, hour: 15 },
    // Day 4 ago
    { productIdx: 1, day: 4, qty: 7, hour: 9 },
    { productIdx: 3, day: 4, qty: 9, hour: 11 },
    { productIdx: 7, day: 4, qty: 10, hour: 14 },
    { productIdx: 9, day: 4, qty: 5, hour: 16 },
    // Day 3 ago
    { productIdx: 0, day: 3, qty: 7, hour: 10 },
    { productIdx: 3, day: 3, qty: 11, hour: 12 },
    { productIdx: 7, day: 3, qty: 14, hour: 14 },
    { productIdx: 8, day: 3, qty: 3, hour: 16 },
    // Day 2 ago
    { productIdx: 1, day: 2, qty: 5, hour: 9 },
    { productIdx: 3, day: 2, qty: 8, hour: 11 },
    { productIdx: 7, day: 2, qty: 9, hour: 13 },
    { productIdx: 9, day: 2, qty: 4, hour: 15 },
    // Day 1 ago
    { productIdx: 0, day: 1, qty: 6, hour: 10 },
    { productIdx: 3, day: 1, qty: 10, hour: 12 },
    { productIdx: 7, day: 1, qty: 11, hour: 14 },
    { productIdx: 8, day: 1, qty: 5, hour: 16 },
    // Today
    { productIdx: 0, day: 0, qty: 4, hour: 9 },
    { productIdx: 3, day: 0, qty: 6, hour: 11 },
    { productIdx: 7, day: 0, qty: 7, hour: 13 },
  ];

  for (const s of salePlan) {
    await prisma.sale.create({
      data: {
        userId: user.id,
        productId: products[s.productIdx].id,
        quantity: s.qty,
        saleDate: daysAgo(s.day, s.hour),
      },
    });
  }

  // Purchase orders: one draft, one sent, one received.
  const draftOrder = await prisma.purchaseOrder.create({
    data: {
      userId: user.id,
      status: "draft",
      supplier: "PT Maju Bersama",
      notes: "Restock widgets and gadgets.",
      items: {
        create: [
          { productId: products[1].id, quantity: 20 },
          { productId: products[2].id, quantity: 10 },
        ],
      },
    },
  });

  const sentOrder = await prisma.purchaseOrder.create({
    data: {
      userId: user.id,
      status: "sent",
      supplier: "CV Berkah Jaya",
      notes: "Office supplies restock.",
      items: {
        create: [
          { productId: products[4].id, quantity: 30 },
          { productId: products[3].id, quantity: 10 },
        ],
      },
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      userId: user.id,
      status: "received",
      supplier: "UD Sinar Abadi",
      notes: "Furniture delivery completed.",
      items: {
        create: [{ productId: products[5].id, quantity: 4 }],
      },
    },
  });

  // Reorder suggestions for low/out-of-stock products.
  await prisma.reorderSuggestion.createMany({
    data: [
      {
        userId: user.id,
        productId: products[2].id,
        suggestedQuantity: 15,
        reason: "Stock is 0 (reorder point: 5).",
        status: "pending",
      },
      {
        userId: user.id,
        productId: products[4].id,
        suggestedQuantity: 27,
        reason: "Stock fell to 3 (reorder point: 15).",
        status: "pending",
      },
      {
        userId: user.id,
        productId: products[1].id,
        suggestedQuantity: 12,
        reason: "Stock fell to 8 (reorder point: 10).",
        status: "pending",
      },
    ],
  });

  console.log(`Seeded demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(
    `  ${suppliers.length} suppliers, ${products.length} products, ${salePlan.length} sales (7 days), 3 purchase orders, 3 suggestions.`,
  );
  console.log(`  Draft PO #${draftOrder.id}, Sent PO #${sentOrder.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
