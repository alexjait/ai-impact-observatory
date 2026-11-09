import { Injectable } from '@nestjs/common';
import { ContactMessageStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { contactErrors } from './contact.errors';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ListContactMessagesQueryDto } from './dto/list-contact-messages-query.dto';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(authorUserId: string | undefined, dto: CreateContactMessageDto) {
    const message = await this.prisma.contactMessage.create({
      data: {
        authorUserId,
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        subject: dto.subject?.trim() || null,
        message: dto.message.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    return this.serializeMessage(message);
  }

  async listMessages(query: ListContactMessagesQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 20;
    const search = query.q?.trim();

    const where = {
      ...(query.status ? { status: query.status as ContactMessageStatus } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { subject: { contains: search, mode: 'insensitive' as const } },
              { message: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total, newCount, readCount, archivedCount] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.contactMessage.count({ where }),
      this.prisma.contactMessage.count({ where: { status: ContactMessageStatus.new } }),
      this.prisma.contactMessage.count({ where: { status: ContactMessageStatus.read } }),
      this.prisma.contactMessage.count({ where: { status: ContactMessageStatus.archived } }),
    ]);

    return {
      items: items.map((item) => this.serializeMessage(item)),
      total,
      page,
      pageSize,
      summary: {
        new: newCount,
        read: readCount,
        archived: archivedCount,
      },
    };
  }

  async updateStatus(id: string, dto: UpdateContactMessageStatusDto) {
    const existing = await this.prisma.contactMessage.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    if (!existing) {
      throw contactErrors.messageNotFound();
    }

    const updated = await this.prisma.contactMessage.update({
      where: { id },
      data: { status: dto.status },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    return this.serializeMessage(updated);
  }

  private serializeMessage(message: {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    status: ContactMessageStatus;
    createdAt: Date;
    updatedAt: Date;
    authorUserId: string | null;
    author?: {
      id: string;
      displayName: string;
      email: string;
    } | null;
  }) {
    return {
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message,
      status: message.status,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      author: message.author
        ? {
            id: message.author.id,
            displayName: message.author.displayName,
            email: message.author.email,
          }
        : null,
    };
  }
}
