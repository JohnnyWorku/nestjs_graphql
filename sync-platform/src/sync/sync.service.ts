import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);
  private listenersRegistered = false;

  constructor(
    // Inject the DB directly using the token to ensure the service 
    // waits for Firebase to initialize before starting.
    @Inject('FIREBASE_DB') private readonly db: admin.database.Database,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Synchronization...');
    
    // Default lookback to 60 minutes if env is missing
    const lookbackStr = process.env.SYNC_LOOKBACK_MINUTES || '60';
    const lookback = parseInt(lookbackStr, 10);
    const since = Date.now() - lookback * 60 * 1000;

    try {
      await this.syncProducts(since);
      await this.syncOrders(since);
      this.registerRealtimeListeners();
      this.logger.log('Real-time listeners active.');
    } catch (error: any) {
      this.logger.error('Failed to run initial sync:', error.message);
    }
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

    // Use this.db directly (it's the injected Database instance)
    const productsRef = this.db.ref('products');
    const ordersRef = this.db.ref('orders');

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
    let ref: admin.database.Query = this.db.ref('products');
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
    try {
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
    } catch (e: any) {
      this.logger.error(`Error syncing product ${id}: ${e.message}`);
    }
  }

  async syncOrders(since?: number) {
    let ref: admin.database.Query = this.db.ref('orders');
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

    try {
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
    } catch (e: any) {
      this.logger.error(`Error syncing order ${orderId}: ${e.message}`);
    }
  }

  private mapOrderStatus(status?: string): OrderStatus {
    if (status && status.toUpperCase() in OrderStatus) {
      return status.toUpperCase() as OrderStatus;
    }
    return OrderStatus.PENDING;
  }
}