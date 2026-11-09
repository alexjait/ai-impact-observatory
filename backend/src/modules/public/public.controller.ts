import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { env } from '../../shared/env';
import { ListActivitiesQueryDto } from './dto/list-activities-query.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly authService: AuthService,
  ) {}

  @Get('search')
  async search(@Query() query: SearchQueryDto, @Req() request: Request) {
    return this.publicService.search(query, await this.resolveAuthenticatedUserId(request));
  }

  @Get('activities')
  async listActivities(@Query() query: ListActivitiesQueryDto, @Req() request: Request) {
    return this.publicService.listActivities(query, await this.resolveAuthenticatedUserId(request));
  }

  @Get('activities/:slug')
  async getActivityBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: 'en' | 'es',
    @Req() request?: Request,
  ) {
    return this.publicService.getActivityBySlug(
      slug,
      locale,
      await this.resolveAuthenticatedUserId(request),
    );
  }

  @Get('evidence/:idOrSlug')
  getEvidenceByIdOrSlug(
    @Param('idOrSlug') idOrSlug: string,
    @Query('locale') locale?: 'en' | 'es',
  ) {
    return this.publicService.getEvidenceByIdOrSlug(idOrSlug, locale);
  }

  @Get('methodology')
  getMethodology(@Query('locale') locale?: 'en' | 'es') {
    return this.publicService.getMethodology(locale);
  }

  @Get('taxonomies')
  getTaxonomies(@Query('locale') locale?: 'en' | 'es') {
    return this.publicService.getTaxonomies(locale);
  }

  private async resolveAuthenticatedUserId(request?: Request) {
    const sessionToken = request?.cookies?.[env.sessionCookieName];

    if (!sessionToken) {
      return undefined;
    }

    const user = await this.authService.validateSessionToken(sessionToken);
    return user?.id;
  }
}
