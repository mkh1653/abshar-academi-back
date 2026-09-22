import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { SmsMessage } from './entities/sms-message.entity';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationChannel } from './enums/notification-channel.enum';
import { SmsStatus } from './enums/sms-status.enum';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notifications: Repository<Notification>,
    @InjectRepository(SmsMessage) private readonly sms: Repository<SmsMessage>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  createForUser(user: User, input: {
    title: string;
    body: string;
    type: NotificationType;
    data?: Record<string, unknown>;
  }) {
    return this.notifications.save(
      this.notifications.create({
        user,
        title: input.title,
        body: input.body,
        type: input.type,
        channel: NotificationChannel.IN_APP,
        readAt: null,
        data: input.data ?? null,
      }),
    );
  }

  listForUser(userId: string) {
    return this.notifications.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async markRead(id: string, userId: string) {
    const notification = await this.notifications.findOne({
      where: { id, user: { id: userId } },
    });
    if (!notification) return null;
    notification.readAt = new Date();
    return this.notifications.save(notification);
  }

  async createAnnouncement(dto: CreateAnnouncementDto) {
    const users = await this.users.find({
      where: { isActive: true },
    });

    if (!users.length) return { count: 0 };

    const entities = users.map((user) =>
      this.notifications.create({
        user,
        title: dto.title,
        body: dto.body,
        type: NotificationType.ANNOUNCEMENT,
        channel: NotificationChannel.IN_APP,
        readAt: null,
        data: dto.type ? { type: dto.type } : null,
      }),
    );

    await this.notifications.save(entities);
    return { count: entities.length };
  }

  async sendSms(user: User, recipient: string, message: string) {
    const record = await this.sms.save(
      this.sms.create({
        user,
        recipient,
        message,
        provider: process.env.SMS_PROVIDER ?? 'mock',
        status: SmsStatus.PENDING,
        sentAt: null,
        providerMessageId: null,
        errorMessage: null,
      }),
    );

    // Provider adapter will be plugged in here.
    record.status = SmsStatus.SENT;
    record.sentAt = new Date();
    record.providerMessageId = record.id;
    return this.sms.save(record);
  }
}
