import { Controller, Post } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('run')
  async runFullSync() {
    try {

      const productsResult = await this.syncService.syncProducts();

      const ordersResult = await this.syncService.syncOrders();

      return {
        status: 'success',
        message: 'Full sync completed',
        timestamp: new Date().toISOString(),
        products: productsResult,
        orders: ordersResult,
      };
    } catch (error) {
      console.error('Full sync failed:', error);

      return {
        status: 'error',
        message: 'Sync failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}