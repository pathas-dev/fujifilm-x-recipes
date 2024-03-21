import dayjs from 'dayjs';
import { mkdir, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic'; // defaults to auto

const folder = path.resolve('.', 'public', 'temp');

const withPath = (filename: string) => path.resolve(folder, filename);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const time = dayjs().format('YYYYMMDD_HHmmss');
    const filename = `${time}_x_recipes.json`;

    await mkdir(folder, { recursive: true });

    await writeFile(withPath(filename), JSON.stringify(body), {});
    return NextResponse.json({ filename });
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
