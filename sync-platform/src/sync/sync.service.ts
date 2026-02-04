import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);
  private listenersRegistered = false;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  
  async onModuleInit() {
    const lookback = parseInt(process.env.SYNC_LOOKBACK_MINUTES || '5', 10);
    const since = Date.now() - lookback * 60 * 1000;

    this.logger.log(`Startup lookback sync: last ${lookback} minutes`);
    await this.syncProducts(since);
    await this.syncOrders(since);

    this.registerRealtimeListeners();
  }

  async runFullManualSync() {
    const products = await this.syncProducts();
    const orders = await this.syncOrders();

    return {
      status: 'success',
      products: products.count,
      orders: orders.count,
    };
  }

  private registerRealtimeListeners() {
    if (this.listenersRegistered) return;
    this.listenersRegistered = true;

    this.logger.log('Registering Firebase realtime listeners');

    const productsRef = this.firebase.db.ref('products');
    const ordersRef = this.firebase.db.ref('orders');

    productsRef.on('child_added', snap =>
      this.syncSingleProduct(snap.key!, snap.val()),
    );

    productsRef.on('child_changed', snap =>
      this.syncSingleProduct(snap.key!, snap.val()),
    );

    ordersRef.on('child_added', snap =>
      this.syncSingleOrder(snap.key!, snap.val()),
    );

    ordersRef.on('child_changed', snap =>
      this.syncSingleOrder(snap.key!, snap.val()),
    );
  }

  async syncProducts(since?: number) {
    let ref: any = this.firebase.db.ref('products');
    if (since) ref = ref.orderByChild('updatedAt').startAt(since);

    const snapshot = await ref.once('value');
    const products = snapshot.val();
    if (!products) return { count: 0 };

    for (const id of Object.keys(products)) {
      await this.syncSingleProduct(id, products[id]);
    }

    return { count: Object.keys(products).length };
  }

  private async syncSingleProduct(id: string, p: any) {
    await this.prisma.product.upsert({
      where: { id },
      update: {
        sku: p.sku,
        name: p.name,
        price: p.price,
        stock: p.stock ?? 0,
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      },
      create: {
        id,
        sku: p.sku,
        name: p.name,
        price: p.price,
        stock: p.stock ?? 0,
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      },
    });

    this.logger.debug(`Product synced: ${id}`);
  }

  async syncOrders(since?: number) {
    let ref: any = this.firebase.db.ref('orders');
    if (since) ref = ref.orderByChild('updatedAt').startAt(since);

    const snapshot = await ref.once('value');
    const orders = snapshot.val();
    if (!orders) return { count: 0 };

    for (const id of Object.keys(orders)) {
      await this.syncSingleOrder(id, orders[id]);
    }

    return { count: Object.keys(orders).length };
  }

  private async syncSingleOrder(orderId: string, o: any) {
    if (!o?.userId || o.total == null) return;

    const status = this.mapOrderStatus(o.status);

    await this.prisma.$transaction(async tx => {
      await tx.order.upsert({
        where: { id: orderId },
        update: {
          userId: o.userId,
          total: o.total,
          status,
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        },
        create: {
          id: orderId,
          userId: o.userId,
          total: o.total,
          status,
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        },
      });

      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          if (!item.productId) continue;

          await tx.orderItem.upsert({
            where: {
              orderId_productId: {
                orderId,
                productId: item.productId,
              },
            },
            update: {
              qty: item.qty ?? 1,
              unitPrice: item.unitPrice ?? 0,
            },
            create: {
              orderId,
              productId: item.productId,
              qty: item.qty ?? 1,
              unitPrice: item.unitPrice ?? 0,
            },
          });
        }
      }
    });

    this.logger.debug(`Order synced: ${orderId}`);
  }

  private mapOrderStatus(status?: string): OrderStatus {
    if (status && status in OrderStatus) {
      return status as OrderStatus;
    }
    return OrderStatus.PENDING;
  }
}
