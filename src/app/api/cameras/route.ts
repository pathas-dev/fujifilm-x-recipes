import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET() {
  try {
    // const data = await getAllDocuments('cameras');
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.error();
  }
}
