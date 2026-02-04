import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    const productCount   = await prisma.product.count();
    const orderCount     = await prisma.order.count();
    const orderItemCount = await prisma.orderItem.count();

    console.log('Database connection & tables look good 🎉');
    console.log(`Products:     ${productCount}`);
    console.log(`Orders:       ${orderCount}`);
    console.log(`Order Items:  ${orderItemCount}`);
  } catch (err) {
    console.error('Something went wrong:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();