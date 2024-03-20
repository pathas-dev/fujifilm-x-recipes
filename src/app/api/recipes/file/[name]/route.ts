import { readFile, rm } from 'fs/promises';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic'; // defaults to auto

const withPath = (filename: string) =>
  path.resolve('.', 'public', 'temp', filename);

export async function GET(_request: Request, context: { params: Params }) {
  try {
    const fileName = context.params.name;
    const file = await readFile(withPath(context.params.name), {
      encoding: 'utf-8',
    });

    if (!file) throw Error('Not Found File!');

    setTimeout(() => {
      rm(withPath(fileName));
    });

    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.error();
  }
}
