import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import logger from './logger.js';

let transporter = null;
let testAccountInfo = null;

const createEtherealTransporter = async () => {
  const account = await nodemailer.createTestAccount();
  testAccountInfo = account;
  const t = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
  return t;
};

const createConfiguredTransporter = () => {
  return nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: Number(config.EMAIL_PORT) || 587,
    secure: Number(config.EMAIL_PORT) === 465,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });
};

const getTransporter = async () => {
  if (transporter) return transporter;

  // If SMTP env vars are provided, use them. Otherwise create Ethereal test account.
  if (config.EMAIL_HOST && config.EMAIL_USER && config.EMAIL_PASS) {
    transporter = createConfiguredTransporter();
    transporter.verify().then(() => logger.info('✓ Mailer configured (SMTP)')).catch((err) => {
      logger.warn('Mailer verification failed (SMTP):', err.message);
    });
    return transporter;
  }

  // Dev fallback: Ethereal test account
  try {
    transporter = await createEtherealTransporter();
    logger.info('✓ Mailer configured using Ethereal test account');
  } catch (err) {
    logger.error('Failed to create Ethereal test account:', err.message);
    throw err;
  }

  return transporter;
};

export const getTestAccountInfo = () => testAccountInfo;

export const sendMail = async ({ from, to, subject, text, html }) => {
  const t = await getTransporter();
  const mailFrom = from || config.EMAIL_FROM || (config.EMAIL_USER || (testAccountInfo && testAccountInfo.user));
  try {
    const info = await t.sendMail({
      from: mailFrom,
      to,
      subject,
      text,
      html,
    });

    logger.info(`Mail sent to ${to}: ${info.messageId}`);

    // If Ethereal was used, log preview URL for dev convenience
    let preview = null;
    if (testAccountInfo) {
      preview = nodemailer.getTestMessageUrl(info);
      if (preview) logger.info(`Preview URL: ${preview}`);
      // attach preview URL to returned info for callers (dev convenience)
      try { info.previewUrl = preview; } catch (e) { /* ignore */ }
    }

    return info;
  } catch (err) {
    logger.error(`Failed to send mail to ${to}: ${err.message}`);
    throw err;
  }
};

export default { sendMail, getTestAccountInfo };
