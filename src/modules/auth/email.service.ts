import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'Reset Your Password',
      html: `Click <a href="${url}">here</a> to reset your password.`,
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'Welcome to Our App!',
      html: `Hi ${name}, welcome to our app!`,
    });
  }
}
