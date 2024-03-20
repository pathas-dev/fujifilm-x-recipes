import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
  try {
    console.log(request);
    // const data = await getAllDocuments('recipes');
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.error();
  }
}
