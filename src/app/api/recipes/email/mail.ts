import nodemailer, { SentMessageInfo } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendMail = (mailOptions: MailOptions): Promise<SentMessageInfo> =>
  new Promise((resolve, reject) => {
    transporter.sendMail(
      { from: process.env.GMAIL_ADDRESS, ...mailOptions },
      (error, info) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log('Email sent: ' + info.response);
          resolve(info);
        }
      }
    );
  });
