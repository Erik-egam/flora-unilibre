import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseHealthController } from './supabase.health.controller.js';
import { SupabaseService } from './supabase.service.js';

/**
 * Registers the Supabase clients for the whole application. Global, so feature
 * modules only need to inject `SupabaseService`.
 */
@Global()
@Module({
  imports: [ConfigModule],
  controllers: [SupabaseHealthController],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
