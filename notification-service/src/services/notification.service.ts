import nodemailer, { Transporter } from 'nodemailer';
import Handlebars from 'handlebars';
import path from 'path';
import { promises as fs } from 'fs';
import { envConfig } from '../configs';
import { fetchHelper, logger } from '../utils';
import { JwtPayload, EmailContext } from '../types';

export class NotificationService {
  private transporter: Transporter;
  private templates: { [key: string]: Handlebars.TemplateDelegate };
  private baseTemplate?: HandlebarsTemplateDelegate;
  constructor() {
    this.transporter = this.createTransporter();
    this.templates = {};
    this.loadEmailTemplates();
    Handlebars.registerHelper('eq', function (a, b) {
      return a === b;
    });
  }

  createTransporter(): Transporter {
    logger.info('Using MailHog for email testing');
    return nodemailer.createTransport({
      host: envConfig.mailHogUrl,
      port: 1025,
      ignoreTLS: true,
    });
  }

  async loadEmailTemplates(): Promise<void> {
    try {
      const templateDir = path.join(__dirname, '../templates');
      const baseTemplate = await fs.readFile(
        path.join(templateDir, 'base-email-template.html'),
        'utf-8',
      );
      this.baseTemplate = Handlebars.compile(baseTemplate);

      const templateFiles = [
        'verification',
        'login',
        'deposit',
        'kyc-verification',
        'qr-payment',
        'transfer',
        'withdrawal',
        'wallet-creation',
        'payment-method-added',
      ];

      for (const file of templateFiles) {
        const templatePath = path.join(templateDir, `${file}-email-template.html`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        this.templates[file] = Handlebars.compile(templateContent);
      }
      logger.info('Email templates loaded successfully');
      logger.debug('Loaded templates: ', Object.keys(this.templates));
    } catch (err) {
      logger.error('Error loading email templates ', err);
      throw new Error(`Failed to load all templates: ${err}`);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: EmailContext,
  ): Promise<void> {
    try {
      if (!this.templates[templateName]) {
        logger.error(
          `Template ${templateName} not found. Available templates: `,
          Object.keys(this.templates),
        );
        throw new Error(`Email template '${templateName}' not found`);
      }

      logger.debug(`Rendering template: ${templateName}`);
      logger.debug('Template context:', context);

      const template = this.templates[templateName];
      const content = template(context);

      if (!this.baseTemplate) throw new Error('Base template not found');
      const html = this.baseTemplate({ content, subject, ...context });

      const mailOptions = {
        from: 'Your E-Wallet <noreply@coderstudio.co>',
        to,
        subject,
        html,
      };

      logger.debug('Mail options:', mailOptions);

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to} using template ${templateName}`);

      // If using MailHog, log additional information for testing
      if (process.env.USE_MAILHOG === 'true') {
        logger.info(`MailHog Web Interface: http://localhost:8025`);
        logger.info(`Check MailHog to view the sent email.`);
      }
    } catch (err) {
      logger.error('Error sending email:', err);
      logger.error('Template name:', templateName);
      logger.error('Context:', context);
      throw new Error(`Failed to send email notification: ${err}`);
    }
  }

  async notifyEmailVerification(
    user: JwtPayload,
    verificationLink: string,
  ): Promise<boolean> {
    try {
      await this.sendEmail(user.email, 'Verify Your E-Wallet Email', 'verification', {
        firstName: user.sub,
        verificationLink,
      });
      logger.info(`Verification email sent successfully to ${user.email}`);
      return true;
    } catch (error) {
      logger.error(`Error sending verification email to ${user.email}:`, error);
      return false;
    }
  }

  async notifyLogin(
    adminToken: string,
    userId: string,
    loginTime: string,
    loginLoc: string,
  ): Promise<void> {
    const fetchUserResponse = await fetchHelper(
      `Bearer ${adminToken}`,
      `http://${envConfig.userService}:3001/api/users/${userId}`,
      'GET',
      null,
    );
    if (fetchUserResponse.status !== 200)
      throw new Error('Failed to retrieve target user for login notification sending.');

    const user = (await fetchUserResponse.json()).result.user;

    await this.sendEmail(user.email, 'New Login to Your E-Wallet Account', 'login', {
      firstName: user.firstName,
      loginTime,
      loginLoc,
      secureAccountLink: '',
    });
  }

  async notifyDeposit(
    adminToken: string,
    userId: string,
    amount: number,
    transactionId: string,
  ): Promise<void> {
    const fetchUserResponse = await fetchHelper(
      `Bearer ${adminToken}`,
      `http://${envConfig.userService}:3001/api/users/${userId}`,
      'GET',
      null,
    );
    if (fetchUserResponse.status !== 200)
      throw new Error('Failed to retrieve target user for deposit notification sending.');

    const user = (await fetchUserResponse.json()).result.user;

    await this.sendEmail(user.email, 'Deposit Successful', 'deposit', {
      firstName: user.firstName,
      amount,
      transactionId,
      transactionDate: new Date().toLocaleString(),
      viewBalanceLink: '',
    });
  }

  async notifyKycUpdate(
    user: JwtPayload,
    kycStatus: string,
    rejectionReason: string | null = null,
  ): Promise<void> {
    await this.sendEmail(user.email, 'KYC Verification Update', 'kyc-verification', {
      firstName: user.sub,
      kycStatus,
      rejectionReason,
      accountLink: '',
      resubmitLink: '',
    });
  }

  async notifyTransfer(
    adminToken: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    transactionId: string,
    fromBalance: number,
    toBalance: number,
  ): Promise<void> {
    const [fetchFromUserResponse, fetchToUserResponse] = await Promise.all([
      fetchHelper(
        `Bearer ${adminToken}`,
        `http://${envConfig.userService}:3001/api/users/${fromUserId}`,
        'GET',
        null,
      ),
      fetchHelper(
        `Bearer ${adminToken}`,
        `http://${envConfig.userService}:3001/api/users/${toUserId}`,
        'GET',
        null,
      ),
    ]);

    if (fetchFromUserResponse.status !== 200 && fetchToUserResponse.status !== 200)
      throw new Error(
        'Failed to retrieve one or both users for transfer notification sending.',
      );

    const fromUser = (await fetchFromUserResponse.json()).result.user;
    const toUser = (await fetchToUserResponse.json()).result.user;

    await Promise.all([
      this.sendEmail(fromUser.email, 'Transfer Sent', 'transfer', {
        firstName: fromUserId,
        transferStatus: 'sent',
        amount,
        otherPartyName: toUser.email,
        transactionId,
        transactionDate: new Date().toLocaleString(),
        transactionDetailsLink: '',
        newBalance: fromBalance,
      }),
      this.sendEmail(toUser.email, 'Transfer Received', 'transfer', {
        firstName: toUser.sub,
        transferStatus: 'received',
        amount,
        otherPartyName: fromUser.email,
        transactionId,
        transactionDate: new Date().toLocaleString(),
        transactionDetailsLink: '',
        newBalance: toBalance,
      }),
    ]);
  }

  async notifyWithdraw(
    adminToken: string,
    userId: string,
    amount: number,
    newBalance: number,
    transactionId: string,
    withdrawalStatus: string,
    withdrawalMethod: string,
    failureReason = null,
  ): Promise<void> {
    const fetchUserResponse = await fetchHelper(
      `Bearer ${adminToken}`,
      `http://${envConfig.userService}:3001/api/users/${userId}`,
      'GET',
      null,
    );
    if (fetchUserResponse.status !== 200)
      throw new Error(
        'Failed to retrieve target user for withdrawal notification sending.',
      );

    const user = (await fetchUserResponse.json()).result.user;

    await this.sendEmail(user.email, 'Withdrawal Update', 'withdrawal', {
      firstName: user.firstName,
      amount,
      withdrawalStatus,
      transactionId,
      transactionDate: new Date().toLocaleString(),
      withdrawalMethod,
      failureReason,
      transactionDetailsLink: '',
      newBalance: newBalance,
    });
  }

  async notifyWalletCreation(
    adminToken: string,
    userId: string,
    initialBalance: number,
  ): Promise<void> {
    const fetchUserResponse = await fetchHelper(
      `Bearer ${adminToken}`,
      `http://${envConfig.userService}:3001/api/users/${userId}`,
      'GET',
      null,
    );
    if (fetchUserResponse.status !== 200)
      throw new Error(
        'Failed to retrieve target user for withdrawal notification sending.',
      );

    const user = (await fetchUserResponse.json()).result.user;

    await this.sendEmail(user.email, 'Wallet Created Successfully', 'wallet-creation', {
      firstName: user.firstName,
      initialBalance,
      walletLink: '',
    });
  }

  async notifyPaymentMethodAdded(
    adminToken: string,
    userId: string,
    last4: string,
    cardBrand: string,
  ): Promise<void> {
    const fetchUserResponse = await fetchHelper(
      `Bearer ${adminToken}`,
      `http://${envConfig.userService}:3001/api/users/${userId}`,
      'GET',
      null,
    );
    if (fetchUserResponse.status !== 200)
      throw new Error(
        'Failed to retrieve target user for withdrawal notification sending.',
      );

    const user = (await fetchUserResponse.json()).result.user;

    await this.sendEmail(user.email, 'New Payment Method Added', 'payment-method-added', {
      firstName: user.firstName,
      last4: last4,
      cardBrand: cardBrand,
      managePaymentMethodsLink: '',
    });
  }
}
