import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';
import { PrismaService } from './prisma.service.js';

/**
 * Registers the Prisma client application-wide, plus the filter that turns
 * Prisma's known request errors into 404/409/400 responses.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
