import { Controller, Post } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('run')
  async runFullSync() {
    const result = await this.syncService.runFullManualSync();

    return {
      status: 'success',
      message: 'Full sync completed',
      timestamp: new Date().toISOString(),
      ...result,
    };
  }
}
