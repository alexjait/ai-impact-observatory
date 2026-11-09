import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

import { env } from '../../shared/env';
import { authErrors } from './auth.errors';

type EmailLocale = 'en' | 'es';

@Injectable()
export class AuthEmailService {
  private readonly resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

  ensureEmailSendingAvailable(): void {
    if (!this.resend || !env.resendFromEmail) {
      throw authErrors.emailDeliveryNotConfigured();
    }
  }

  async sendVerificationEmail(input: {
    userId: string;
    email: string;
    displayName: string;
    verificationUrl: string;
    locale: EmailLocale;
  }): Promise<void> {
    this.ensureEmailSendingAvailable();

    const copy = this.getEmailCopy(input.locale);
    const { error } = await this.resend!.emails.send(
      {
        from: env.resendFromEmail,
        to: [input.email],
        subject: copy.verificationSubject,
        html: this.renderVerificationHtml(input.displayName, input.verificationUrl, input.locale),
        text: this.renderVerificationText(input.displayName, input.verificationUrl, input.locale),
      },
      { idempotencyKey: `verify-email/${input.userId}` },
    );

    if (error) {
      console.error(error);
      throw authErrors.verificationEmailSendFailed();
    }
  }

  async sendWelcomeEmail(input: {
    userId: string;
    email: string;
    displayName: string;
    locale: EmailLocale;
  }): Promise<void> {
    this.ensureEmailSendingAvailable();

    const copy = this.getEmailCopy(input.locale);
    const { error } = await this.resend!.emails.send(
      {
        from: env.resendFromEmail,
        to: [input.email],
        subject: copy.welcomeSubject,
        html: this.renderWelcomeHtml(input.displayName, input.locale),
        text: this.renderWelcomeText(input.displayName, input.locale),
      },
      { idempotencyKey: `welcome-email/${input.userId}` },
    );

    if (error) {
      console.error(error);
      throw authErrors.welcomeEmailSendFailed();
    }
  }

  async sendPasswordResetEmail(input: {
    resetTokenId: string;
    email: string;
    displayName: string;
    resetUrl: string;
    locale: EmailLocale;
  }): Promise<void> {
    this.ensureEmailSendingAvailable();

    const copy = this.getEmailCopy(input.locale);
    const { error } = await this.resend!.emails.send(
      {
        from: env.resendFromEmail,
        to: [input.email],
        subject: copy.passwordResetSubject,
        html: this.renderPasswordResetHtml(input.displayName, input.resetUrl, input.locale),
        text: this.renderPasswordResetText(input.displayName, input.resetUrl, input.locale),
      },
      { idempotencyKey: `password-reset/${input.resetTokenId}` },
    );

    if (error) {
      console.error(error);
      throw authErrors.passwordResetEmailSendFailed();
    }
  }

  private renderVerificationHtml(
    displayName: string,
    verificationUrl: string,
    locale: EmailLocale,
  ): string {
    const safeUrl = this.escapeHtml(verificationUrl);
    const copy = this.getEmailCopy(locale);

    return `
      <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:32px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; padding:32px; color:#1f2937;">
          <p style="margin:0 0 12px; font-size:14px; letter-spacing:0.08em; text-transform:uppercase; color:#6b7280;">
            AI Impact Observatory
          </p>
          <h1 style="margin:0 0 16px; font-size:28px; line-height:1.2;">${copy.verificationHeading}</h1>
          <p style="margin:0 0 16px; font-size:16px; line-height:1.6;">
            ${this.escapeHtml(copy.verificationGreeting(displayName))}
          </p>
          <p style="margin:24px 0;">
            <a href="${safeUrl}" style="display:inline-block; background:#111827; color:#ffffff; text-decoration:none; padding:14px 22px; border-radius:999px;">
              ${copy.verificationCta}
            </a>
          </p>
          <p style="margin:0; font-size:14px; line-height:1.6; color:#6b7280;">
            ${copy.linkFallback}<br />
            ${safeUrl}
          </p>
        </div>
      </div>
    `;
  }

  private renderVerificationText(
    displayName: string,
    verificationUrl: string,
    locale: EmailLocale,
  ): string {
    const copy = this.getEmailCopy(locale);
    return `${copy.verificationTextPrefix(displayName)} ${verificationUrl}`;
  }

  private renderWelcomeHtml(displayName: string, locale: EmailLocale): string {
    const copy = this.getEmailCopy(locale);

    return `
      <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:32px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; padding:32px; color:#1f2937;">
          <p style="margin:0 0 12px; font-size:14px; letter-spacing:0.08em; text-transform:uppercase; color:#6b7280;">
            AI Impact Observatory
          </p>
          <h1 style="margin:0 0 16px; font-size:28px; line-height:1.2;">${copy.welcomeHeading}</h1>
          <p style="margin:0 0 16px; font-size:16px; line-height:1.6;">
            ${this.escapeHtml(copy.welcomeGreeting(displayName))}
          </p>
          <p style="margin:0; font-size:14px; line-height:1.6; color:#6b7280;">
            ${copy.welcomeClosing}
          </p>
        </div>
      </div>
    `;
  }

  private renderWelcomeText(displayName: string, locale: EmailLocale): string {
    const copy = this.getEmailCopy(locale);
    return copy.welcomeText(displayName);
  }

  private renderPasswordResetHtml(
    displayName: string,
    resetUrl: string,
    locale: EmailLocale,
  ): string {
    const safeUrl = this.escapeHtml(resetUrl);
    const copy = this.getEmailCopy(locale);

    return `
      <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:32px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; padding:32px; color:#1f2937;">
          <p style="margin:0 0 12px; font-size:14px; letter-spacing:0.08em; text-transform:uppercase; color:#6b7280;">
            AI Impact Observatory
          </p>
          <h1 style="margin:0 0 16px; font-size:28px; line-height:1.2;">${copy.passwordResetHeading}</h1>
          <p style="margin:0 0 16px; font-size:16px; line-height:1.6;">
            ${this.escapeHtml(copy.passwordResetGreeting(displayName))}
          </p>
          <p style="margin:24px 0;">
            <a href="${safeUrl}" style="display:inline-block; background:#111827; color:#ffffff; text-decoration:none; padding:14px 22px; border-radius:999px;">
              ${copy.passwordResetCta}
            </a>
          </p>
          <p style="margin:0 0 12px; font-size:14px; line-height:1.6; color:#6b7280;">
            ${copy.passwordResetNotice}
          </p>
          <p style="margin:0; font-size:14px; line-height:1.6; color:#6b7280;">
            ${copy.linkFallback}<br />
            ${safeUrl}
          </p>
        </div>
      </div>
    `;
  }

  private renderPasswordResetText(
    displayName: string,
    resetUrl: string,
    locale: EmailLocale,
  ): string {
    const copy = this.getEmailCopy(locale);
    return `${copy.passwordResetTextPrefix(displayName)} ${resetUrl}`;
  }

  private getEmailCopy(locale: EmailLocale) {
    if (locale === 'es') {
      return {
        verificationSubject: 'Verificá tu cuenta de AI Impact Observatory',
        verificationHeading: 'Verificá tu email',
        verificationGreeting: (name: string) =>
          `Hola ${name}, gracias por registrarte. Confirmá tu dirección de email para activar tu cuenta e ingresar al portal.`,
        verificationCta: 'Verificar cuenta',
        verificationTextPrefix: (name: string) =>
          `Hola ${name}, verificá tu cuenta de AI Impact Observatory visitando:`,
        welcomeSubject: 'Te damos la bienvenida a AI Impact Observatory',
        welcomeHeading: 'Bienvenido',
        welcomeGreeting: (name: string) =>
          `Hola ${name}, tu email ya está verificado y tu cuenta está lista. Ya podés ingresar y empezar a contribuir al observatorio.`,
        welcomeClosing: 'Gracias por ayudar a que el catálogo siga siendo auditable y útil.',
        welcomeText: (name: string) =>
          `Hola ${name}, te damos la bienvenida a AI Impact Observatory. Tu email ya está verificado y tu cuenta está lista para usar.`,
        passwordResetSubject: 'Recuperá tu contraseña de AI Impact Observatory',
        passwordResetHeading: 'Recuperá tu contraseña',
        passwordResetGreeting: (name: string) =>
          `Hola ${name}, recibimos una solicitud para restablecer tu contraseña. Usá el siguiente enlace para elegir una nueva.`,
        passwordResetCta: 'Crear nueva contraseña',
        passwordResetNotice:
          'Este enlace va a vencer pronto. Si no pediste este cambio, podés ignorar este email.',
        passwordResetTextPrefix: (name: string) =>
          `Hola ${name}, recuperá tu contraseña de AI Impact Observatory visitando:`,
        linkFallback: 'Si el botón no funciona, copiá y pegá esta URL en tu navegador:',
      };
    }

    return {
      verificationSubject: 'Verify your AI Impact Observatory account',
      verificationHeading: 'Verify your email',
      verificationGreeting: (name: string) =>
        `Hi ${name}, thanks for registering. Confirm your email address to activate your account and sign in to the portal.`,
      verificationCta: 'Verify account',
      verificationTextPrefix: (name: string) =>
        `Hi ${name}, verify your AI Impact Observatory account by visiting:`,
      welcomeSubject: 'Welcome to AI Impact Observatory',
      welcomeHeading: 'Welcome aboard',
      welcomeGreeting: (name: string) =>
        `Hi ${name}, your email is verified and your account is ready. You can now sign in and start contributing to the observatory.`,
      welcomeClosing: 'Thanks for helping keep the catalog auditable and useful.',
      welcomeText: (name: string) =>
        `Hi ${name}, welcome to AI Impact Observatory. Your email is verified and your account is ready to use.`,
      passwordResetSubject: 'Reset your AI Impact Observatory password',
      passwordResetHeading: 'Reset your password',
      passwordResetGreeting: (name: string) =>
        `Hi ${name}, we received a request to reset your password. Use the link below to choose a new one.`,
      passwordResetCta: 'Create a new password',
      passwordResetNotice:
        'This link will expire soon. If you did not request this change, you can safely ignore this email.',
      passwordResetTextPrefix: (name: string) =>
        `Hi ${name}, reset your AI Impact Observatory password by visiting:`,
      linkFallback: 'If the button does not work, copy and paste this URL into your browser:',
    };
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
