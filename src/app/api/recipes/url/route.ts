import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let body = await request.json();
    const response = await fetch(body.url);
    const urlHtml = await response.text();
    return NextResponse.json({ urlHtml });
  } catch (error) {
    return NextResponse.error();
  }
}
