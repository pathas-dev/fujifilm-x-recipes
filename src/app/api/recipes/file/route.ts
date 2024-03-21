import dayjs from 'dayjs';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
import path from 'path';

export const dynamic = 'force-dynamic'; // defaults to auto

const folder = path.resolve('.', 'public', 'temp');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, email } = body;

    if (!data) throw Error('data not found');
    if (!email?.trim()) throw Error('email not contained');

    const time = dayjs().format('YYYYMMDD_HHmmss');
    const filename = `${time}_x_recipes.json`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions: MailOptions = {
      from: process.env.GMAIL_ADDRESS,
      to: email,
      subject: 'fujifilm-x-recipes json 파일 전송',
      text: '안녕하세요, fujifilm-x-recipes 개발자입니다.\r\n요청하신 커스텀 레시피 json 파일을 보내드립니다.',
      attachments: [
        {
          content: JSON.stringify(data),
          contentType: 'application/json',
          filename,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return NextResponse.json({ code: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
