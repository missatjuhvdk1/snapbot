import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { VideosModule } from './modules/videos/videos.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ProxiesModule } from './modules/proxies/proxies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    AccountsModule,
    VideosModule,
    JobsModule,
    ProxiesModule,
  ],
})
export class AppModule {}
