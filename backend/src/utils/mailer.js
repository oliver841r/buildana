const nodemailer = require("nodemailer");
const env = require("../config/env");
const logger = require("./logger");

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      auth: env.email.user ? { user: env.email.user, pass: env.email.pass } : undefined,
      secure: env.email.port === 465,
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!env.email.host) {
    logger.info("Email host not configured; skipping email send.");
    return;
  }
  const transport = getTransporter();
  await transport.sendMail({
    from: env.email.from,
    to,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
};
