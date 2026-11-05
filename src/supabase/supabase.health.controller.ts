import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SupabaseService } from './supabase.service.js';

/** Lets you confirm the configured Supabase project is reachable. */
@Controller('health')
export class SupabaseHealthController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  async check(): Promise<{ status: 'ok'; supabase: 'up' }> {
    if (!(await this.supabase.isHealthy())) {
      throw new ServiceUnavailableException({
        status: 'degraded',
        supabase: 'down',
      });
    }
    return { status: 'ok', supabase: 'up' };
  }
}
