import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { RoleKey } from '@prisma/client';

import { type AuthenticatedUser } from '../../shared/auth.types';
import { CurrentUser } from '../../shared/current-user.decorator';
import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';
import { SessionAuthGuard } from '../../shared/session-auth.guard';
import { UpdatePublicSettingsDto } from './dto/update-public-settings.dto';
import { PublicSettingsService } from './public-settings.service';

@Controller('admin/public-settings')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(RoleKey.ADMIN)
export class PublicSettingsController {
  constructor(private readonly publicSettingsService: PublicSettingsService) {}

  @Get()
  getPublicSettings() {
    return this.publicSettingsService.getPublicSettings();
  }

  @Patch()
  updatePublicSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePublicSettingsDto,
  ) {
    return this.publicSettingsService.updatePublicSettings(user.id, dto);
  }
}
