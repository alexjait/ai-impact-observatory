import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { EditorialController } from './editorial.controller';
import { EditorialService } from './editorial.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EditorialController],
  providers: [EditorialService],
  exports: [EditorialService],
})
export class EditorialModule {}
