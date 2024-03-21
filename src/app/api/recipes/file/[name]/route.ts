import { readFile, rm, stat } from 'fs/promises';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic'; // defaults to auto

const withPath = (filename: string) =>
  path.resolve('.', 'public', 'temp', filename);

export async function GET(_request: NextRequest, context: { params: Params }) {
  let fileNameWithPath = '';
  try {
    const fileName = context.params.name;
    fileNameWithPath = withPath(fileName);

    const file = await readFile(fileNameWithPath, {
      encoding: 'utf-8',
    });

    if (!file) throw Error('Not Found File!');

    const fileStat = await stat(fileNameWithPath);

    return new Response(file, {
      headers: {
        'content-type': 'application/json',
        'Content-Length': fileStat.size.toString(),
      },
      status: 200,
    });
  } catch (error) {
    return NextResponse.error();
  } finally {
    const file = await readFile(fileNameWithPath, {
      encoding: 'utf-8',
    });
    if (fileNameWithPath && file) {
      rm(fileNameWithPath);
    }
  }
}
