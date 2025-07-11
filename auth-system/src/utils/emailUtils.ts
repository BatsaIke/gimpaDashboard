import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465', // SSL for port 465
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Function to send an email
export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
