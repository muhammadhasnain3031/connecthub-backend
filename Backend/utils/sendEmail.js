import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Transporter create karein (Mailtrap ya Gmail SMTP settings)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2. Email message payload define karein
  const mailOptions = {
    from: `"ConnectHub Support" <noreply@connecthub.com>`,
    to: options.email,
    subject: options.subject,
    html: options.html, // Plain text ke bajaye rich HTML dynamic template support
  };

  // 3. Email send karein
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
