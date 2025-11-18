import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('NODEMAILER_EMAIL'),
        pass: this.configService.get<string>('NODEMAILER_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.configService.get<string>('NODEMAILER_EMAIL'),
      to: email,
      subject: 'Password Reset Request - KYC Platform',
      html: this.getPasswordResetTemplate(resetUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, adminName: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const loginUrl = `${frontendUrl}/login`;

    const mailOptions = {
      from: this.configService.get<string>('NODEMAILER_EMAIL'),
      to: email,
      subject: `Welcome to the KYC Platform, ${adminName}!`,
      html: this.getWelcomeTemplate(adminName, loginUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
      throw error;
    }
  }

  async sendNewUserInvitation(email: string, fullName: string, temporaryPassword: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const loginUrl = `${frontendUrl}/login`;

    const mailOptions = {
      from: this.configService.get<string>('NODEMAILER_EMAIL'),
      to: email,
      subject: `Your KYC Platform Account Invitation`,
      html: this.getInvitationTemplate(fullName, loginUrl, temporaryPassword),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${email}`, error);
      throw error;
    }
  }

  async sendAdminPasswordChange(email: string, fullName: string, newPassword: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const loginUrl = `${frontendUrl}/login`;

    const mailOptions = {
      from: this.configService.get<string>('NODEMAILER_EMAIL'),
      to: email,
      subject: `Your Password Has Been Updated`,
      html: this.getAdminPasswordChangeTemplate(fullName, loginUrl, newPassword),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Admin password change email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send admin password change email to ${email}`, error);
      throw error;
    }
  }

  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0; 
          }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password for your KYC Platform account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>Best regards,<br>The KYC Platform Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeTemplate(adminName: string, loginUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to KYC Platform</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; padding: 20px; text-align: center; color: white; }
          .content { padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #28a745; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0; 
          }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .highlight { background-color: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to KYC Platform!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${adminName}</strong>,</p>
            <p>Congratulations! Your company has been successfully registered on the KYC Platform. You can now log in as the administrator and start managing your KYC/KYB processes.</p>
            
            <div class="highlight">
              <h3>🚀 What's Next?</h3>
              <ul>
                <li>Access your admin dashboard</li>
                <li>Configure your KYC settings</li>
                <li>Start onboarding entities</li>
                <li>Monitor compliance status</li>
              </ul>
            </div>

            <p>Click the button below to access your dashboard:</p>
            <p style="text-align: center;">
              <a href="${loginUrl}" class="button">Login to Dashboard</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #28a745;">${loginUrl}</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            <p>Welcome aboard!<br><strong>The KYC Platform Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2025 KYC Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getInvitationTemplate(fullName: string, loginUrl: string, temporaryPassword: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset=\"utf-8\">
        <title>Your KYC Platform Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0069d9; padding: 20px; text-align: center; color: white; }
          .content { padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #0069d9; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .code { font-family: monospace; background: #f1f3f5; padding: 8px 12px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class=\"container\">
          <div class=\"header\">
            <h1>Welcome to KYC Platform</h1>
          </div>
          <div class=\"content\">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>Your administrator has created an account for you on the KYC Platform.</p>
            <p>Use the temporary password below to sign in and set your own password:</p>
            <p class=\"code\">${temporaryPassword}</p>
            <p style=\"text-align: center;\"><a href=\"${loginUrl}\" class=\"button\">Login to Dashboard</a></p>
            <p>For security, please change your password after your first login.</p>
            <p>Best regards,<br>The KYC Platform Team</p>
          </div>
          <div class=\"footer\">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getAdminPasswordChangeTemplate(fullName: string, loginUrl: string, newPassword: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset=\"utf-8\">
        <title>Password Updated</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #17a2b8; padding: 20px; text-align: center; color: white; }
          .content { padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #17a2b8; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .code { font-family: monospace; background: #f1f3f5; padding: 8px 12px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class=\"container\">
          <div class=\"header\">
            <h1>Password Updated</h1>
          </div>
          <div class=\"content\">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>An administrator has updated your account password.</p>
            <p>Your new password is:</p>
            <p class=\"code\">${newPassword}</p>
            <p style=\"text-align: center;\"><a href=\"${loginUrl}\" class=\"button\">Login to Dashboard</a></p>
            <p>For security, please change your password after login.</p>
            <p>Best regards,<br>The KYC Platform Team</p>
          </div>
          <div class=\"footer\">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}