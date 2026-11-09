import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicSettings() {
    const config = await this.getOrCreateConfig();

    return {
      publicCommentsEnabled: config.publicCommentsEnabled,
      updatedAt: config.updatedAt,
      updatedByUserId: config.updatedByUserId,
    };
  }

  async updatePublicSettings(
    actorUserId: string,
    input: { publicCommentsEnabled: boolean },
  ) {
    const config = await this.prisma.portalConfig.upsert({
      where: { id: 'default' },
      update: {
        publicCommentsEnabled: input.publicCommentsEnabled,
        updatedByUserId: actorUserId,
      },
      create: {
        id: 'default',
        publicCommentsEnabled: input.publicCommentsEnabled,
        updatedByUserId: actorUserId,
      },
    });

    return {
      publicCommentsEnabled: config.publicCommentsEnabled,
      updatedAt: config.updatedAt,
      updatedByUserId: config.updatedByUserId,
    };
  }

  async arePublicCommentsEnabled() {
    const config = await this.getOrCreateConfig();
    return config.publicCommentsEnabled;
  }

  private async getOrCreateConfig() {
    return this.prisma.portalConfig.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
      },
    });
  }
}
