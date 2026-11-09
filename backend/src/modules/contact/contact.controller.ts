import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { RoleKey } from '@prisma/client';

import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../../shared/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/auth.types';
import { env } from '../../shared/env';
import { Roles } from '../../shared/roles.decorator';
import { RolesGuard } from '../../shared/roles.guard';
import { SessionAuthGuard } from '../../shared/session-auth.guard';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ListContactMessagesQueryDto } from './dto/list-contact-messages-query.dto';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';
import { ContactService } from './contact.service';
import { TurnstileService } from '../auth/turnstile.service';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly authService: AuthService,
    private readonly turnstileService: TurnstileService,
  ) {}

  @Post('messages')
  @Throttle({
    default: {
      ttl: env.throttleAuthTtlMs,
      limit: env.throttleAuthLimit,
    },
  })
  async createMessage(@Body() dto: CreateContactMessageDto, @Req() request: Request) {
    await this.turnstileService.verifyOrThrow(dto.captchaToken, this.getRequestIp(request));

    return this.contactService.createMessage(
      await this.resolveAuthenticatedUserId(request),
      dto,
    );
  }

  @Get('messages')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(RoleKey.MODERATOR, RoleKey.EDITOR, RoleKey.ADMIN)
  listMessages(@Query() query: ListContactMessagesQueryDto) {
    return this.contactService.listMessages(query);
  }

  @Patch('messages/:id/status')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(RoleKey.MODERATOR, RoleKey.EDITOR, RoleKey.ADMIN)
  updateStatus(
    @CurrentUser() _user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateContactMessageStatusDto,
  ) {
    return this.contactService.updateStatus(id, dto);
  }

  private async resolveAuthenticatedUserId(request?: Request) {
    const sessionToken = request?.cookies?.[env.sessionCookieName];

    if (!sessionToken) {
      return undefined;
    }

    const user = await this.authService.validateSessionToken(sessionToken);
    return user?.id;
  }

  private getRequestIp(request: Request): string | undefined {
    return request.ip || request.socket.remoteAddress || undefined;
  }
}
