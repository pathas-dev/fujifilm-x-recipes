import dayjs from 'dayjs';
import { NextResponse } from 'next/server';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
import { sendMail } from './mail';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, email } = body;

    if (!data) throw Error('data not contained');
    if (!email?.trim()) throw Error('email not contained');

    const time = dayjs().format('YYYYMMDD_HHmmss');
    const filename = `${time}_x_recipes.json`;

    const mailOptions: MailOptions = {
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
    const sentMailInfo = await sendMail(mailOptions);

    return NextResponse.json({ code: 200, body: sentMailInfo });
  } catch (error) {
    console.log(error);
    return new Response(null, {
      status: 500,
      statusText: (error as Error).message,
    });
  }
}
